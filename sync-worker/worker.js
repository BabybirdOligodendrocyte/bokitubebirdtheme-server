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

export class BuddyRoom {
    constructor(state, env) {
        this.state = state;
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

        return new Response(null, { status: 101, webSocket: client });
    }

    // Called when a WebSocket receives a message (Hibernation API)
    async webSocketMessage(ws, message) {
        // Relay message to all OTHER connections (sender exclusion)
        this.broadcast(message, ws);
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
