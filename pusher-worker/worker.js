/**
 * Cloudflare Worker for Pusher Authentication
 *
 * Deployed at: https://yellow-star-7913.babybirdoligodendrocyte.workers.dev/
 *
 * To deploy:
 * 1. Go to Cloudflare Dashboard → Workers & Pages
 * 2. Click on worker → Quick edit
 * 3. Paste this code
 * 4. Click "Save and deploy"
 */

const PUSHER_KEY = '5ed54d7472449e46d6c7';
const PUSHER_SECRET = 'f8bddb1167563e203095';

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
        const formData = await request.formData();
        const socketId = formData.get('socket_id');
        const channelName = formData.get('channel_name');
        const username = formData.get('username') || 'anonymous';

        const presenceData = {
            user_id: username,
            user_info: { name: username }
        };

        const stringToSign = socketId + ':' + channelName + ':' + JSON.stringify(presenceData);
        const encoder = new TextEncoder();
        const cryptoKey = await crypto.subtle.importKey(
            'raw', encoder.encode(PUSHER_SECRET),
            { name: 'HMAC', hash: 'SHA-256' },
            false, ['sign']
        );

        const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(stringToSign));
        const hexSignature = Array.from(new Uint8Array(signature))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        return new Response(JSON.stringify({
            auth: PUSHER_KEY + ':' + hexSignature,
            channel_data: JSON.stringify(presenceData)
        }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    } catch (error) {
        return new Response('Error: ' + error.message, { status: 500, headers: corsHeaders });
    }
}
