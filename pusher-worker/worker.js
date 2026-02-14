/**
 * Cloudflare Worker for Pusher Authentication (ES Modules format)
 *
 * Environment variables required (set in Worker Settings → Variables):
 * - PUSHER_KEY: Your Pusher app key
 * - PUSHER_SECRET: Your Pusher app secret
 *
 * Deploy:
 * 1. Go to Cloudflare Dashboard → Workers & Pages → your worker
 * 2. Edit Code → paste this file → Deploy
 * 3. Verify env vars are set in Settings → Variables
 * 4. Test: curl -X POST https://your-worker.workers.dev/pusher/auth
 *    -d "socket_id=123.456&channel_name=presence-test&username=testuser"
 */

export default {
    async fetch(request, env) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            });
        }

        // Only handle POST to /pusher/auth
        const url = new URL(request.url);
        if (request.method !== 'POST' || !url.pathname.endsWith('/pusher/auth')) {
            return new Response('Not Found', { status: 404 });
        }

        // Validate env vars are set
        if (!env.PUSHER_KEY || !env.PUSHER_SECRET) {
            console.error('Missing PUSHER_KEY or PUSHER_SECRET environment variables');
            return new Response('Server misconfigured', { status: 500 });
        }

        try {
            // Parse form data from Pusher client
            const formData = await request.formData();
            const socketId = formData.get('socket_id');
            const channelName = formData.get('channel_name');
            const username = formData.get('username') || 'anonymous';

            if (!socketId || !channelName) {
                return new Response('Missing socket_id or channel_name', { status: 400 });
            }

            // Generate auth signature for presence channel
            const presenceData = {
                user_id: username,
                user_info: { name: username }
            };

            const auth = await generatePusherAuth(
                env.PUSHER_KEY,
                env.PUSHER_SECRET,
                socketId,
                channelName,
                presenceData
            );

            return new Response(JSON.stringify(auth), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        } catch (error) {
            console.error('Auth error:', error);
            return new Response('Internal Server Error', { status: 500 });
        }
    }
};

/**
 * Generate Pusher auth signature (HMAC-SHA256)
 */
async function generatePusherAuth(key, secret, socketId, channelName, presenceData) {
    const stringToSign = socketId + ':' + channelName + ':' + JSON.stringify(presenceData);

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(stringToSign);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const hexSignature = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    return {
        auth: key + ':' + hexSignature,
        channel_data: JSON.stringify(presenceData)
    };
}
