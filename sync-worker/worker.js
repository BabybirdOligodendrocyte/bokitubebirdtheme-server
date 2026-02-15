// ========== BUDDY SYNC WEBSOCKET SERVER ==========
// Cloudflare Worker + Durable Object for real-time WebSocket sync
// Replaces Pusher - no per-delivery message counting, ~300x more free headroom
//
// Deploy: npx wrangler deploy
// URL: wss://buddy-sync.<your-subdomain>.workers.dev/ws/<roomName>?username=<name>

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': '*',
                }
            });
        }

        // Health check
        if (url.pathname === '/' || url.pathname === '/health') {
            return new Response(JSON.stringify({ status: 'ok', service: 'buddy-sync' }), {
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        // WebSocket endpoint: /ws/{roomName}
        const match = url.pathname.match(/^\/ws\/([^/]+)$/);
        if (!match) {
            return new Response('Not found. Use /ws/{roomName}?username={name}', { status: 404 });
        }

        const roomName = decodeURIComponent(match[1]);
        const username = url.searchParams.get('username');

        if (!username) {
            return new Response('Missing username parameter', { status: 400 });
        }

        // Route to the Durable Object for this room
        const id = env.BUDDY_ROOM.idFromName(roomName);
        const room = env.BUDDY_ROOM.get(id);

        // Forward the request with username in a header (cleaner than query param for DO)
        const newHeaders = new Headers(request.headers);
        newHeaders.set('X-Username', username);
        const newRequest = new Request(request.url, {
            method: request.method,
            headers: newHeaders,
            body: request.body,
        });

        return room.fetch(newRequest);
    }
};

// ========== DURABLE OBJECT: BUDDY ROOM ==========
// Each Cytube channel gets one BuddyRoom instance
// Uses WebSocket Hibernation API for efficiency (no duration charges while idle)

// Max age for stored SRT data (1 hour) - prevents stale data accumulating
const SRT_MAX_AGE_MS = 60 * 60 * 1000;
// Max number of SRT entries stored per room
const SRT_MAX_ENTRIES = 20;

export class BuddyRoom {
    constructor(state, env) {
        this.state = state;
        // In-memory SRT cache (survives within a single DO lifetime, rebuilt from storage on wake)
        // Structure: { mediaKey: { cuesJson: string, from: string, timestamp: number } }
        this.srtCache = null; // Lazy-loaded from storage
    }

    // Load SRT cache from Durable Object storage (persistent across hibernation)
    async loadSrtCache() {
        if (this.srtCache !== null) return;
        this.srtCache = (await this.state.storage.get('srtCache')) || {};
        // Prune expired entries
        const now = Date.now();
        let changed = false;
        for (const key in this.srtCache) {
            if (now - this.srtCache[key].timestamp > SRT_MAX_AGE_MS) {
                delete this.srtCache[key];
                changed = true;
            }
        }
        if (changed) {
            await this.state.storage.put('srtCache', this.srtCache);
        }
    }

    // Save SRT cache to persistent storage
    async saveSrtCache() {
        await this.state.storage.put('srtCache', this.srtCache);
    }

    async fetch(request) {
        const url = new URL(request.url);
        const username = request.headers.get('X-Username');

        if (!username) {
            return new Response('Missing username', { status: 400 });
        }

        // Verify WebSocket upgrade
        const upgradeHeader = request.headers.get('Upgrade');
        if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
            return new Response('Expected WebSocket upgrade', { status: 426 });
        }

        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);

        // Accept with Hibernation API - tag with username for identification
        this.state.acceptWebSocket(server, [username]);

        // Build current member list (deduplicated)
        const memberSet = new Set();
        for (const ws of this.state.getWebSockets()) {
            const tags = this.state.getTags(ws);
            if (tags.length > 0) {
                memberSet.add(tags[0]);
            }
        }
        // The new user is already in getWebSockets() after acceptWebSocket
        memberSet.delete(username); // Don't include self in "others" list

        // Send welcome message with current members
        server.send(JSON.stringify({
            type: 'connected',
            members: Array.from(memberSet),
            you: username
        }));

        // Notify all existing connections that a new member joined
        this.broadcast(JSON.stringify({
            type: 'member-added',
            username: username
        }), server);

        // Send cached SRT subtitle data to the new joiner
        await this.loadSrtCache();
        if (Object.keys(this.srtCache).length > 0) {
            this.sendCachedSrt(server);
        }

        return new Response(null, { status: 101, webSocket: client });
    }

    // Send all cached SRT subtitles to a specific WebSocket connection
    sendCachedSrt(ws) {
        for (const mediaKey in this.srtCache) {
            const entry = this.srtCache[mediaKey];
            try {
                // Reconstruct the srt-subtitle message as a single chunk
                ws.send(JSON.stringify({
                    type: 'srt-subtitle',
                    from: entry.from,
                    mediaKey: mediaKey,
                    sessionId: mediaKey + '_server_' + Date.now(),
                    chunkIndex: 0,
                    totalChunks: 1,
                    data: entry.cuesJson
                }));
            } catch (e) {
                // Connection issue - will be cleaned up
            }
        }
    }

    // Called when a WebSocket receives a message (Hibernation API)
    async webSocketMessage(ws, message) {
        // Check if this is an SRT message that should be cached
        let parsed = null;
        try {
            parsed = typeof message === 'string' ? JSON.parse(message) : null;
        } catch (e) {
            // Not JSON - just relay
        }

        if (parsed) {
            if (parsed.type === 'srt-subtitle') {
                await this.handleSrtStore(parsed);
            } else if (parsed.type === 'srt-remove') {
                await this.handleSrtRemove(parsed);
            } else if (parsed.type === 'srt-request') {
                // Peer is requesting SRT data - send from server cache
                await this.loadSrtCache();
                if (Object.keys(this.srtCache).length > 0) {
                    this.sendCachedSrt(ws);
                }
            }
        }

        // Relay message to all OTHER connections (sender exclusion)
        this.broadcast(message, ws);
    }

    // Store SRT subtitle chunks, assembled into complete data
    async handleSrtStore(msg) {
        if (!msg.mediaKey || !msg.data || !msg.sessionId) return;

        await this.loadSrtCache();

        // For single-chunk messages, store directly
        if (msg.totalChunks === 1) {
            this.srtCache[msg.mediaKey] = {
                cuesJson: msg.data,
                from: msg.from || 'unknown',
                timestamp: Date.now()
            };
            // Enforce entry limit
            this.pruneSrtCache();
            await this.saveSrtCache();
            return;
        }

        // For multi-chunk messages, use a temporary assembly buffer
        // stored under a special key prefix
        const bufferKey = '_chunk_' + msg.sessionId;
        if (!this.srtCache[bufferKey]) {
            this.srtCache[bufferKey] = {
                mediaKey: msg.mediaKey,
                from: msg.from || 'unknown',
                totalChunks: msg.totalChunks,
                chunks: {},
                received: 0,
                timestamp: Date.now()
            };
        }

        const buffer = this.srtCache[bufferKey];
        if (!buffer.chunks[msg.chunkIndex]) {
            buffer.chunks[msg.chunkIndex] = msg.data;
            buffer.received++;
        }

        // All chunks received - assemble
        if (buffer.received === buffer.totalChunks) {
            let fullPayload = '';
            for (let i = 0; i < buffer.totalChunks; i++) {
                fullPayload += buffer.chunks[i] || '';
            }

            this.srtCache[buffer.mediaKey] = {
                cuesJson: fullPayload,
                from: buffer.from,
                timestamp: Date.now()
            };

            // Clean up the chunk buffer
            delete this.srtCache[bufferKey];
            this.pruneSrtCache();
            await this.saveSrtCache();
        } else {
            // Save partial buffer (in case DO hibernates between chunks)
            await this.saveSrtCache();
        }
    }

    // Remove SRT data for a media key
    async handleSrtRemove(msg) {
        if (!msg.mediaKey) return;

        await this.loadSrtCache();
        if (this.srtCache[msg.mediaKey]) {
            delete this.srtCache[msg.mediaKey];
            await this.saveSrtCache();
        }
    }

    // Prune oldest entries if over limit, and clean up stale chunk buffers
    pruneSrtCache() {
        const now = Date.now();

        // Clean stale chunk buffers (older than 60 seconds)
        for (const key in this.srtCache) {
            if (key.startsWith('_chunk_') && now - this.srtCache[key].timestamp > 60000) {
                delete this.srtCache[key];
            }
        }

        // Count real entries (not chunk buffers)
        const realKeys = Object.keys(this.srtCache).filter(k => !k.startsWith('_chunk_'));
        if (realKeys.length > SRT_MAX_ENTRIES) {
            // Sort by timestamp ascending and remove oldest
            realKeys.sort((a, b) => this.srtCache[a].timestamp - this.srtCache[b].timestamp);
            const toRemove = realKeys.length - SRT_MAX_ENTRIES;
            for (let i = 0; i < toRemove; i++) {
                delete this.srtCache[realKeys[i]];
            }
        }

        // Also prune expired entries
        for (const key in this.srtCache) {
            if (!key.startsWith('_chunk_') && now - this.srtCache[key].timestamp > SRT_MAX_AGE_MS) {
                delete this.srtCache[key];
            }
        }
    }

    // Called when a WebSocket closes (Hibernation API)
    async webSocketClose(ws, code, reason, wasClean) {
        const tags = this.state.getTags(ws);
        const username = tags.length > 0 ? tags[0] : null;

        ws.close();

        if (username) {
            // Check if this user still has other connections (multiple tabs)
            let hasOtherConnection = false;
            for (const other of this.state.getWebSockets()) {
                if (other === ws) continue;
                const otherTags = this.state.getTags(other);
                if (otherTags.length > 0 && otherTags[0] === username) {
                    hasOtherConnection = true;
                    break;
                }
            }

            // Only broadcast removal if user has no other connections
            if (!hasOtherConnection) {
                this.broadcast(JSON.stringify({
                    type: 'member-removed',
                    username: username
                }));
            }
        }
    }

    // Called on WebSocket error (Hibernation API)
    async webSocketError(ws) {
        const tags = this.state.getTags(ws);
        console.log('[BuddyRoom] WebSocket error for:', tags[0] || 'unknown');
        ws.close();
    }

    // Broadcast a message to all connected WebSockets, optionally excluding one
    broadcast(message, exclude) {
        const msg = typeof message === 'string' ? message : JSON.stringify(message);
        for (const ws of this.state.getWebSockets()) {
            if (ws === exclude) continue;
            try {
                ws.send(msg);
            } catch (e) {
                // Dead connection - will be cleaned up by webSocketClose
            }
        }
    }
}
