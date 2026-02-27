/**
 * Cloudflare Worker - Kick.com M3U8 Proxy for Cytube
 *
 * Solves the problem of Kick.com M3U8 links expiring mid-stream.
 * Fetches fresh playback URLs from Kick's API on every manifest request,
 * so Cytube always has a valid stream.
 *
 * Routes:
 *   GET /kick/:channel/manifest.json  → Cytube custom media manifest
 *   GET /kick/:channel/stream.m3u8    → Proxied master M3U8 (fresh token each time)
 *   GET /kick/:channel/variant/*      → Proxied variant playlists (rewritten URLs)
 *   GET /kick/:channel/status         → Check if channel is live
 *
 * Deploy:
 *   1. Cloudflare Dashboard → Workers & Pages → Create Worker
 *   2. Paste this file → Deploy
 *   3. No environment variables needed
 *
 * Usage in Cytube:
 *   Add as custom media: https://your-worker.workers.dev/kick/channelname/manifest.json
 */

// Cache playback URLs briefly to avoid hammering Kick's API
// Key: channel slug, Value: { playbackUrl, fetchedAt }
var playbackCache = {};
var CACHE_TTL_MS = 30000; // 30 seconds

export default {
    async fetch(request) {
        var url = new URL(request.url);
        var path = url.pathname;

        // CORS headers for all responses
        var corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Range',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // Parse route: /kick/:channel/:action
        var match = path.match(/^\/kick\/([a-zA-Z0-9_-]+)\/(.+)$/);
        if (!match) {
            return new Response(
                'Kick M3U8 Proxy\n\n' +
                'Usage:\n' +
                '  /kick/{channel}/manifest.json  - Cytube custom media manifest\n' +
                '  /kick/{channel}/stream.m3u8    - Proxied HLS stream\n' +
                '  /kick/{channel}/status         - Check if channel is live\n',
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } }
            );
        }

        var channel = match[1].toLowerCase();
        var action = match[2];

        try {
            if (action === 'manifest.json') {
                return await handleManifest(channel, url.origin, corsHeaders);
            } else if (action === 'stream.m3u8') {
                return await handleMasterPlaylist(channel, url.origin, corsHeaders);
            } else if (action.startsWith('variant/')) {
                return await handleVariantPlaylist(channel, action, url.origin, corsHeaders);
            } else if (action === 'status') {
                return await handleStatus(channel, corsHeaders);
            } else {
                return new Response('Not Found', { status: 404, headers: corsHeaders });
            }
        } catch (err) {
            console.error('Worker error:', err);
            return new Response('Error: ' + err.message, { status: 502, headers: corsHeaders });
        }
    }
};

/**
 * GET /kick/:channel/manifest.json
 * Returns a Cytube custom media manifest pointing to our proxied stream
 */
async function handleManifest(channel, origin, corsHeaders) {
    // Verify channel is live first
    var info = await fetchKickChannelInfo(channel);
    if (!info || !info.playbackUrl) {
        return new Response(JSON.stringify({ error: channel + ' is not live' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    var manifest = {
        title: info.title || channel + ' (Kick)',
        duration: 0,
        live: true,
        sources: [
            {
                url: origin + '/kick/' + channel + '/stream.m3u8',
                contentType: 'application/x-mpegURL',
                quality: 1080,
            },
        ],
    };

    if (info.thumbnail && typeof info.thumbnail === 'string') {
        manifest.thumbnail = info.thumbnail;
    }

    return new Response(JSON.stringify(manifest, null, 2), {
        headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store',
        },
    });
}

/**
 * GET /kick/:channel/stream.m3u8
 * Fetches a FRESH master playlist from Kick and rewrites variant URLs
 * to go through our proxy (so we can keep refreshing tokens on those too)
 */
async function handleMasterPlaylist(channel, origin, corsHeaders) {
    var playbackUrl = await getPlaybackUrl(channel);
    if (!playbackUrl) {
        return new Response('#EXTM3U\n#EXT-X-ERROR:Channel not live', {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/vnd.apple.mpegurl' },
        });
    }

    // Fetch the master playlist from Kick's CDN
    var m3u8Response = await fetch(playbackUrl, {
        headers: buildCDNHeaders(),
    });

    if (!m3u8Response.ok) {
        // Token might have expired between cache and now, clear cache and retry once
        delete playbackCache[channel];
        playbackUrl = await getPlaybackUrl(channel);
        if (!playbackUrl) {
            return new Response('#EXTM3U\n#EXT-X-ERROR:Failed to get stream', {
                status: 502,
                headers: { ...corsHeaders, 'Content-Type': 'application/vnd.apple.mpegurl' },
            });
        }
        m3u8Response = await fetch(playbackUrl, { headers: buildCDNHeaders() });
    }

    if (!m3u8Response.ok) {
        return new Response('#EXTM3U\n#EXT-X-ERROR:CDN returned ' + m3u8Response.status, {
            status: 502,
            headers: { ...corsHeaders, 'Content-Type': 'application/vnd.apple.mpegurl' },
        });
    }

    var body = await m3u8Response.text();
    var baseUrl = playbackUrl.substring(0, playbackUrl.lastIndexOf('/') + 1);

    // Rewrite variant playlist URLs to go through our proxy
    // Master playlist lines that aren't comments and end in .m3u8 are variant URLs
    var rewritten = rewriteMasterPlaylist(body, baseUrl, channel, origin);

    return new Response(rewritten, {
        headers: {
            ...corsHeaders,
            'Content-Type': 'application/vnd.apple.mpegurl',
            'Cache-Control': 'no-cache, no-store',
        },
    });
}

/**
 * GET /kick/:channel/variant/...
 * Proxies variant (quality-level) playlists.
 * Segment .ts URLs are rewritten to absolute CDN URLs so the player
 * fetches them directly (no bandwidth through us).
 */
async function handleVariantPlaylist(channel, action, origin, corsHeaders) {
    // action = "variant/<base64-encoded-url>"
    var encodedUrl = action.replace('variant/', '');
    var variantUrl;
    try {
        variantUrl = atob(encodedUrl);
    } catch (e) {
        return new Response('Invalid variant URL encoding', { status: 400, headers: corsHeaders });
    }

    var response = await fetch(variantUrl, { headers: buildCDNHeaders() });

    if (!response.ok) {
        // Variant URL expired, get fresh master to derive new base URL
        var playbackUrl = await getPlaybackUrl(channel, true);
        if (playbackUrl) {
            var baseUrl = playbackUrl.substring(0, playbackUrl.lastIndexOf('/') + 1);
            // Extract the relative path from the old variant URL
            var oldBase = variantUrl.substring(0, variantUrl.lastIndexOf('/') + 1);
            var relativePath = variantUrl.substring(oldBase.length);
            var freshVariantUrl = baseUrl + relativePath;
            response = await fetch(freshVariantUrl, { headers: buildCDNHeaders() });
        }
    }

    if (!response.ok) {
        return new Response('#EXTM3U\n#EXT-X-ERROR:Variant fetch failed ' + response.status, {
            status: 502,
            headers: { ...corsHeaders, 'Content-Type': 'application/vnd.apple.mpegurl' },
        });
    }

    var body = await response.text();
    var variantBase = variantUrl.substring(0, variantUrl.lastIndexOf('/') + 1);

    // Rewrite relative segment URLs to absolute CDN URLs
    var rewritten = rewriteVariantPlaylist(body, variantBase);

    return new Response(rewritten, {
        headers: {
            ...corsHeaders,
            'Content-Type': 'application/vnd.apple.mpegurl',
            'Cache-Control': 'no-cache, no-store',
        },
    });
}

/**
 * GET /kick/:channel/status
 * Quick check if a channel is live
 */
async function handleStatus(channel, corsHeaders) {
    var info = await fetchKickChannelInfo(channel);
    var result = {
        channel: channel,
        live: !!(info && info.playbackUrl),
        title: info ? info.title : null,
    };
    return new Response(JSON.stringify(result, null, 2), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
}

// ========== KICK API ==========

/**
 * Fetch channel info from Kick's API
 * Returns { playbackUrl, title, thumbnail } or null
 */
async function fetchKickChannelInfo(channel) {
    // Try v2 API first, fall back to v1
    var apis = [
        'https://kick.com/api/v2/channels/' + channel,
        'https://kick.com/api/v1/channels/' + channel,
    ];

    for (var i = 0; i < apis.length; i++) {
        try {
            var resp = await fetch(apis[i], {
                headers: buildBrowserHeaders(),
            });

            if (!resp.ok) continue;

            var data = await resp.json();

            // v2 API structure
            var playbackUrl = null;
            var title = null;
            var thumbnail = null;

            if (data.playback_url) {
                playbackUrl = data.playback_url;
            } else if (data.livestream && data.livestream.playback_url) {
                playbackUrl = data.livestream.playback_url;
            }

            if (data.livestream) {
                title = data.livestream.session_title || data.livestream.slug || channel;
                thumbnail = data.livestream.thumbnail || null;
            }

            if (!title) {
                title = data.slug || data.user && data.user.username || channel;
            }

            if (playbackUrl) {
                return { playbackUrl: playbackUrl, title: title, thumbnail: thumbnail };
            }
        } catch (e) {
            console.error('Kick API error (' + apis[i] + '):', e.message);
        }
    }

    return null;
}

/**
 * Get a playback URL, using cache unless expired or forced refresh
 */
async function getPlaybackUrl(channel, forceRefresh) {
    var cached = playbackCache[channel];
    var now = Date.now();

    if (!forceRefresh && cached && (now - cached.fetchedAt) < CACHE_TTL_MS) {
        return cached.playbackUrl;
    }

    var info = await fetchKickChannelInfo(channel);
    if (info && info.playbackUrl) {
        playbackCache[channel] = {
            playbackUrl: info.playbackUrl,
            fetchedAt: now,
        };
        return info.playbackUrl;
    }

    return null;
}

// ========== M3U8 REWRITING ==========

/**
 * Rewrite master playlist: variant .m3u8 URLs become proxied through us
 * Segment URLs (if any) become absolute CDN URLs
 */
function rewriteMasterPlaylist(body, baseUrl, channel, origin) {
    var lines = body.split('\n');
    var result = [];

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();

        if (!line) {
            result.push(line);
            continue;
        }

        // Comment/tag lines pass through
        if (line.startsWith('#')) {
            result.push(line);
            continue;
        }

        // Non-comment line = URL (variant playlist or segment)
        var absoluteUrl = resolveUrl(line, baseUrl);

        if (line.endsWith('.m3u8') || line.indexOf('.m3u8?') !== -1) {
            // Variant playlist — proxy through us so we can rewrite segment URLs
            var encoded = btoa(absoluteUrl);
            result.push(origin + '/kick/' + channel + '/variant/' + encoded);
        } else {
            // Direct segment or other file — point straight to CDN
            result.push(absoluteUrl);
        }
    }

    return result.join('\n');
}

/**
 * Rewrite variant playlist: make relative segment URLs absolute
 * so the player fetches .ts segments directly from Kick's CDN
 */
function rewriteVariantPlaylist(body, baseUrl) {
    var lines = body.split('\n');
    var result = [];

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();

        if (!line || line.startsWith('#')) {
            // Check for URI= in tags (e.g., #EXT-X-MAP:URI="init.mp4")
            if (line.indexOf('URI="') !== -1) {
                line = line.replace(/URI="([^"]+)"/g, function(match, uri) {
                    if (uri.startsWith('http')) return match;
                    return 'URI="' + resolveUrl(uri, baseUrl) + '"';
                });
            }
            result.push(line);
            continue;
        }

        // Non-comment line = segment URL
        if (line.startsWith('http')) {
            result.push(line);
        } else {
            result.push(resolveUrl(line, baseUrl));
        }
    }

    return result.join('\n');
}

/**
 * Resolve a potentially relative URL against a base
 */
function resolveUrl(relative, baseUrl) {
    if (relative.startsWith('http://') || relative.startsWith('https://')) {
        return relative;
    }
    if (relative.startsWith('/')) {
        var origin = baseUrl.match(/^https?:\/\/[^/]+/);
        return origin ? origin[0] + relative : relative;
    }
    return baseUrl + relative;
}

// ========== HEADERS ==========

/**
 * Browser-like headers for Kick's Cloudflare-protected API
 */
function buildBrowserHeaders() {
    return {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://kick.com/',
        'Origin': 'https://kick.com',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Sec-Ch-Ua': '"Chromium";v="131", "Not_A Brand";v="24"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
    };
}

/**
 * Headers for fetching M3U8/segments from Kick's CDN (live-video.net)
 */
function buildCDNHeaders() {
    return {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Origin': 'https://kick.com',
        'Referer': 'https://kick.com/',
    };
}
