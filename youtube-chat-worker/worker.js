/**
 * Cloudflare Worker - YouTube Live Chat Proxy (ES Modules format)
 *
 * Fetches YouTube live chat (live streams) and chat replay (VODs)
 * via YouTube's innertube API. No API key required.
 *
 * Endpoints:
 *   GET /chat/check?videoId=XXX        - Check if video has live/replay chat
 *   GET /chat/live?videoId=XXX         - Fetch live chat messages (first call)
 *   GET /chat/live?continuation=XXX    - Fetch next batch of live chat
 *   GET /chat/replay?videoId=XXX&offsetMs=0 - Fetch replay chat at timestamp
 *   GET /chat/replay?continuation=XXX&offsetMs=XXX - Fetch next replay batch
 *
 * Deploy:
 *   1. Cloudflare Dashboard -> Workers & Pages -> Create Worker
 *   2. Paste this file -> Deploy
 *   3. No environment variables needed
 *
 * Free tier: 100,000 requests/day (more than enough)
 */

// In-memory cache with TTL (reduces redundant YouTube fetches)
var cache = new Map();
var CACHE_TTL = 3000; // 3 seconds for live chat
var REPLAY_CACHE_TTL = 10000; // 10 seconds for replay

function getCached(key) {
    var entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > entry.ttl) {
        cache.delete(key);
        return null;
    }
    return entry.data;
}

function setCache(key, data, ttl) {
    // Evict old entries if cache is too large
    if (cache.size > 500) {
        var oldest = cache.keys().next().value;
        cache.delete(oldest);
    }
    cache.set(key, { data: data, ts: Date.now(), ttl: ttl });
}

// CORS headers applied to all responses
var CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// YouTube innertube API constants
var INNERTUBE_API_KEY = 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';
var INNERTUBE_BASE = 'https://www.youtube.com/youtubei/v1';
var INNERTUBE_CONTEXT = {
    client: {
        clientName: 'WEB',
        clientVersion: '2.20240101.00.00',
        hl: 'en',
        gl: 'US',
    }
};

export default {
    async fetch(request) {
        // CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: CORS_HEADERS });
        }

        if (request.method !== 'GET') {
            return jsonResponse({ error: 'Method not allowed' }, 405);
        }

        var url = new URL(request.url);
        var path = url.pathname;

        try {
            if (path.endsWith('/chat/check')) {
                return await handleCheck(url.searchParams);
            } else if (path.endsWith('/chat/live')) {
                return await handleLive(url.searchParams);
            } else if (path.endsWith('/chat/replay')) {
                return await handleReplay(url.searchParams);
            } else {
                return jsonResponse({ error: 'Not found. Endpoints: /chat/check, /chat/live, /chat/replay' }, 404);
            }
        } catch (err) {
            console.error('Worker error:', err);
            return jsonResponse({ error: 'Internal error', detail: err.message }, 500);
        }
    }
};

/**
 * GET /chat/check?videoId=XXX
 * Returns: { hasChat: bool, isLive: bool, continuation: string|null }
 */
async function handleCheck(params) {
    var videoId = params.get('videoId');
    if (!videoId) return jsonResponse({ error: 'Missing videoId' }, 400);

    var cacheKey = 'check_' + videoId;
    var cached = getCached(cacheKey);
    if (cached) return jsonResponse(cached);

    // Fetch the video page to get initial chat data
    var pageData = await fetchVideoPage(videoId);

    var result = {
        videoId: videoId,
        hasChat: false,
        isLive: false,
        liveContinuation: null,
        replayContinuation: null
    };

    if (pageData.isLive && pageData.liveContinuation) {
        result.hasChat = true;
        result.isLive = true;
        result.liveContinuation = pageData.liveContinuation;
    } else if (pageData.replayContinuation) {
        result.hasChat = true;
        result.isLive = false;
        result.replayContinuation = pageData.replayContinuation;
    }

    setCache(cacheKey, result, 30000); // Cache check result for 30s
    return jsonResponse(result);
}

/**
 * GET /chat/live?videoId=XXX (first call)
 * GET /chat/live?continuation=XXX (subsequent calls)
 * Returns: { messages: [...], continuation: string|null, pollingIntervalMs: number }
 */
async function handleLive(params) {
    var continuation = params.get('continuation');
    var videoId = params.get('videoId');

    if (!continuation && !videoId) {
        return jsonResponse({ error: 'Need videoId or continuation' }, 400);
    }

    // If first call, get continuation from video page
    if (!continuation) {
        var cacheKey = 'check_' + videoId;
        var checkResult = getCached(cacheKey);
        if (!checkResult) {
            var pageData = await fetchVideoPage(videoId);
            if (!pageData.isLive || !pageData.liveContinuation) {
                return jsonResponse({ error: 'Video has no live chat', hasChat: false }, 404);
            }
            continuation = pageData.liveContinuation;
        } else {
            if (!checkResult.isLive) {
                return jsonResponse({ error: 'Video is not live', hasChat: false }, 404);
            }
            continuation = checkResult.liveContinuation;
        }
    }

    // Fetch live chat actions
    var liveCacheKey = 'live_' + continuation.substring(0, 40);
    var cached = getCached(liveCacheKey);
    if (cached) return jsonResponse(cached);

    var body = {
        context: INNERTUBE_CONTEXT,
        continuation: continuation
    };

    var resp = await fetch(INNERTUBE_BASE + '/live_chat/get_live_chat?key=' + INNERTUBE_API_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!resp.ok) {
        return jsonResponse({ error: 'YouTube API error', status: resp.status }, 502);
    }

    var data = await resp.json();
    var parsed = parseLiveChatResponse(data);

    setCache(liveCacheKey, parsed, CACHE_TTL);
    return jsonResponse(parsed);
}

/**
 * GET /chat/replay?videoId=XXX&offsetMs=0 (first call)
 * GET /chat/replay?continuation=XXX&offsetMs=XXX (subsequent calls)
 * Returns: { messages: [...], continuation: string|null }
 */
async function handleReplay(params) {
    var continuation = params.get('continuation');
    var videoId = params.get('videoId');
    var offsetMs = parseInt(params.get('offsetMs') || '0', 10);

    if (!continuation && !videoId) {
        return jsonResponse({ error: 'Need videoId or continuation' }, 400);
    }

    // If first call, get replay continuation from video page
    if (!continuation) {
        var pageData = await fetchVideoPage(videoId);
        if (!pageData.replayContinuation) {
            return jsonResponse({ error: 'Video has no chat replay', hasChat: false }, 404);
        }
        continuation = pageData.replayContinuation;
    }

    var replayCacheKey = 'replay_' + continuation.substring(0, 30) + '_' + offsetMs;
    var cached = getCached(replayCacheKey);
    if (cached) return jsonResponse(cached);

    var body = {
        context: INNERTUBE_CONTEXT,
        continuation: continuation,
        currentPlayerTimeMs: offsetMs
    };

    var resp = await fetch(INNERTUBE_BASE + '/live_chat/get_live_chat_replay?key=' + INNERTUBE_API_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!resp.ok) {
        return jsonResponse({ error: 'YouTube API error', status: resp.status }, 502);
    }

    var data = await resp.json();
    var parsed = parseReplayChatResponse(data);

    setCache(replayCacheKey, parsed, REPLAY_CACHE_TTL);
    return jsonResponse(parsed);
}

/**
 * Fetch YouTube video page and extract chat continuation tokens
 */
async function fetchVideoPage(videoId) {
    var result = {
        isLive: false,
        liveContinuation: null,
        replayContinuation: null
    };

    var resp = await fetch('https://www.youtube.com/watch?v=' + videoId, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
        }
    });

    if (!resp.ok) return result;

    var html = await resp.text();

    // Extract ytInitialData JSON
    var match = html.match(/var ytInitialData\s*=\s*({.*?});\s*<\/script/s);
    if (!match) {
        // Try alternate pattern
        match = html.match(/window\["ytInitialData"\]\s*=\s*({.*?});\s*<\/script/s);
    }
    if (!match) return result;

    var initialData;
    try {
        initialData = JSON.parse(match[1]);
    } catch (e) {
        return result;
    }

    // Check for live chat (isLive)
    var isLive = html.indexOf('"isLiveContent":true') !== -1 ||
                 html.indexOf('"isLive":true') !== -1;

    // Look for chat continuation in the subMenu or conversationBar
    var continuations = findContinuations(initialData);

    if (isLive && continuations.liveContinuation) {
        result.isLive = true;
        result.liveContinuation = continuations.liveContinuation;
    }

    if (continuations.replayContinuation) {
        result.replayContinuation = continuations.replayContinuation;
    }

    // Fallback: look in the page for chat continuation tokens directly
    if (!result.liveContinuation && !result.replayContinuation) {
        var contMatch = html.match(/"continuation":"([^"]+)"/);
        if (contMatch) {
            // Determine if it's live or replay from context
            if (isLive) {
                result.isLive = true;
                result.liveContinuation = contMatch[1];
            } else {
                result.replayContinuation = contMatch[1];
            }
        }
    }

    return result;
}

/**
 * Recursively search ytInitialData for chat continuation tokens
 */
function findContinuations(obj) {
    var result = { liveContinuation: null, replayContinuation: null };

    var queue = [obj];
    var visited = 0;
    while (queue.length > 0 && visited < 5000) {
        var current = queue.shift();
        visited++;

        if (!current || typeof current !== 'object') continue;

        // Live chat continuation
        if (current.liveChatRenderer && current.liveChatRenderer.continuations) {
            var conts = current.liveChatRenderer.continuations;
            for (var i = 0; i < conts.length; i++) {
                var c = conts[i];
                if (c.invalidationContinuationData) {
                    result.liveContinuation = c.invalidationContinuationData.continuation;
                } else if (c.timedContinuationData) {
                    result.liveContinuation = c.timedContinuationData.continuation;
                } else if (c.reloadContinuationData) {
                    result.liveContinuation = c.reloadContinuationData.continuation;
                }
            }
        }

        // Replay chat continuation
        if (current.liveChatRenderer && current.liveChatRenderer.continuations) {
            var rconts = current.liveChatRenderer.continuations;
            for (var j = 0; j < rconts.length; j++) {
                var rc = rconts[j];
                if (rc.playerSeekContinuationData) {
                    result.replayContinuation = rc.playerSeekContinuationData.continuation;
                }
            }
        }

        // Check subMenuItems for the replay chat
        if (current.subMenuItems) {
            for (var k = 0; k < current.subMenuItems.length; k++) {
                var sub = current.subMenuItems[k];
                if (sub.continuation && sub.continuation.reloadContinuationData) {
                    // The first subMenuItem is usually "Top chat replay"
                    if (!result.replayContinuation) {
                        result.replayContinuation = sub.continuation.reloadContinuationData.continuation;
                    }
                }
            }
        }

        if (result.liveContinuation && result.replayContinuation) break;

        // Recurse into child properties
        if (Array.isArray(current)) {
            for (var a = 0; a < current.length; a++) {
                if (current[a] && typeof current[a] === 'object') queue.push(current[a]);
            }
        } else {
            var keys = Object.keys(current);
            for (var b = 0; b < keys.length; b++) {
                var val = current[keys[b]];
                if (val && typeof val === 'object') queue.push(val);
            }
        }
    }

    return result;
}

/**
 * Parse live chat API response into clean message array
 */
function parseLiveChatResponse(data) {
    var result = {
        messages: [],
        continuation: null,
        pollingIntervalMs: 5000
    };

    var liveChatCont = data.continuationContents && data.continuationContents.liveChatContinuation;
    if (!liveChatCont) return result;

    // Extract next continuation token
    if (liveChatCont.continuations) {
        for (var i = 0; i < liveChatCont.continuations.length; i++) {
            var c = liveChatCont.continuations[i];
            if (c.invalidationContinuationData) {
                result.continuation = c.invalidationContinuationData.continuation;
                result.pollingIntervalMs = c.invalidationContinuationData.timeoutMs || 5000;
            } else if (c.timedContinuationData) {
                result.continuation = c.timedContinuationData.continuation;
                result.pollingIntervalMs = c.timedContinuationData.timeoutMs || 5000;
            }
        }
    }

    // Extract messages
    var actions = liveChatCont.actions || [];
    for (var j = 0; j < actions.length; j++) {
        var action = actions[j];
        var msg = extractMessageFromAction(action);
        if (msg) result.messages.push(msg);
    }

    return result;
}

/**
 * Parse replay chat API response
 */
function parseReplayChatResponse(data) {
    var result = {
        messages: [],
        continuation: null
    };

    var liveChatCont = data.continuationContents && data.continuationContents.liveChatContinuation;
    if (!liveChatCont) return result;

    // Extract next continuation
    if (liveChatCont.continuations) {
        for (var i = 0; i < liveChatCont.continuations.length; i++) {
            var c = liveChatCont.continuations[i];
            if (c.playerSeekContinuationData) {
                result.continuation = c.playerSeekContinuationData.continuation;
            } else if (c.liveChatReplayContinuationData) {
                result.continuation = c.liveChatReplayContinuationData.continuation;
            }
        }
    }

    // Extract messages from replay actions
    var actions = liveChatCont.actions || [];
    for (var j = 0; j < actions.length; j++) {
        var action = actions[j];

        // Replay wraps actions in replayChatItemAction
        var replayAction = action.replayChatItemAction;
        if (replayAction) {
            var innerActions = replayAction.actions || [];
            for (var k = 0; k < innerActions.length; k++) {
                var msg = extractMessageFromAction(innerActions[k]);
                if (msg) {
                    // Add video offset timestamp from replay data
                    msg.videoOffsetMs = parseInt(replayAction.videoOffsetTimeMsec || '0', 10);
                    result.messages.push(msg);
                }
            }
        } else {
            // Some replay responses have actions directly
            var directMsg = extractMessageFromAction(action);
            if (directMsg) result.messages.push(directMsg);
        }
    }

    return result;
}

/**
 * Extract a clean message object from a chat action
 */
function extractMessageFromAction(action) {
    var item = null;

    if (action.addChatItemAction && action.addChatItemAction.item) {
        var chatItem = action.addChatItemAction.item;

        if (chatItem.liveChatTextMessageRenderer) {
            item = chatItem.liveChatTextMessageRenderer;
        } else if (chatItem.liveChatPaidMessageRenderer) {
            item = chatItem.liveChatPaidMessageRenderer;
            // Superchat
        }
    }

    if (!item) return null;

    // Extract message text from runs
    var text = '';
    if (item.message && item.message.runs) {
        for (var i = 0; i < item.message.runs.length; i++) {
            var run = item.message.runs[i];
            if (run.text) {
                text += run.text;
            } else if (run.emoji) {
                // Use emoji shortcut or unicode
                text += run.emoji.emojiId || run.emoji.shortcuts && run.emoji.shortcuts[0] || '';
            }
        }
    }

    if (!text) return null;

    // Extract author name
    var author = '';
    if (item.authorName && item.authorName.simpleText) {
        author = item.authorName.simpleText;
    }

    var result = {
        author: author,
        text: text,
        timestampUsec: item.timestampUsec || '0'
    };

    // Mark superchats
    if (item.purchaseAmountText) {
        result.superchat = true;
        result.amount = item.purchaseAmountText.simpleText || '';
    }

    return result;
}

/**
 * JSON response helper with CORS
 */
function jsonResponse(data, status) {
    return new Response(JSON.stringify(data), {
        status: status || 200,
        headers: Object.assign({ 'Content-Type': 'application/json' }, CORS_HEADERS)
    });
}
