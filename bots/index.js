'use strict';

const https = require('https');
const http = require('http');
const { io } = require('socket.io-client');
const { SocksProxyAgent } = require('socks-proxy-agent');

// ============================================================
//  Configuration
// ============================================================

const CHANNEL = process.env.CYTUBE_CHANNEL || 'AltarOfVictory';
const BOT_COUNT = parseInt(process.env.BOT_COUNT, 10) || 20;

// Proxy support - route bots through one or more SOCKS proxies (e.g. VPN).
// Comma-separated list of proxy URLs with bot counts.
// Example: PROXIES=socks5://127.0.0.1:1080,socks5://127.0.0.1:1081
//          PROXY_BOT_COUNTS=10,10
// This routes bots 1-10 through :1080, bots 11-20 through :1081, rest go direct.
// EDIT THESE with your VPN's SOCKS proxy addresses and ports:
const PROXIES = (process.env.PROXIES || 'socks5://YOUR_PIA_USER:YOUR_PIA_PASS@proxy-nl.privateinternetaccess.com:1080').split(',').map(s => s.trim()).filter(Boolean);
const PROXY_BOT_COUNTS = (process.env.PROXY_BOT_COUNTS || '10').split(',').map(s => parseInt(s.trim(), 10));

// CyTube rate-limits connections: 5 burst, then ~1 per 10s.
// We stagger beyond the burst window to stay safe.
const BURST_SIZE = 4;              // first batch (stay under 5)
const STAGGER_MS = 11000;          // delay between bots after burst (>10s)

// ============================================================
//  Helpers
// ============================================================

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { headers: { 'User-Agent': 'CytubeBot/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJSON(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ts() {
  return new Date().toISOString().slice(11, 19);
}

// ============================================================
//  Bot class
// ============================================================

class CytubeBot {
  constructor(id, serverUrl, channel, proxyUrl) {
    this.id = id;
    this.label = `Bot-${String(id).padStart(2, '0')}`;
    this.serverUrl = serverUrl;
    this.channel = channel;
    this.proxyUrl = proxyUrl || null;
    this.socket = null;
    this.connected = false;
    this.guestName = null;
  }

  log(msg) {
    console.log(`[${ts()}] [${this.label}] ${msg}`);
  }

  connect() {
    return new Promise((resolve) => {
      var via = this.proxyUrl ? ` via proxy ${this.proxyUrl}` : ' (direct)';
      this.log(`Connecting to ${this.serverUrl}${via} ...`);

      var opts = {
        secure: true,
        reconnection: true,
        reconnectionDelay: 5000,
        reconnectionAttempts: 10,
        transports: ['websocket'],
      };

      if (this.proxyUrl) {
        var agent = new SocksProxyAgent(this.proxyUrl);
        opts.agent = agent;
      }

      this.socket = io(this.serverUrl, opts);

      this.socket.on('connect', () => {
        this.connected = true;
        this.log('Socket connected');

        // Join the channel
        this.socket.emit('joinChannel', { name: this.channel });
        this.log(`Joined channel: ${this.channel}`);

        resolve();
      });

      // Server confirms channel join by sending initial state
      this.socket.on('channelOpts', () => {
        this.log('Received channel options (join confirmed)');
      });

      this.socket.on('usercount', (count) => {
        this.log(`User count: ${count}`);
      });

      this.socket.on('login', (data) => {
        if (data.success) {
          this.guestName = data.name;
          this.log(`Guest login OK: ${data.name}`);
        } else {
          this.log(`Guest login failed: ${data.error}`);
        }
      });

      this.socket.on('chatMsg', (data) => {
        this.log(`Chat [${data.username}]: ${data.msg.slice(0, 80)}`);
      });

      this.socket.on('kick', (data) => {
        this.log(`KICKED: ${data.reason}`);
      });

      this.socket.on('errorMsg', (data) => {
        this.log(`Error from server: ${data.msg}`);
      });

      this.socket.on('disconnect', (reason) => {
        this.connected = false;
        this.log(`Disconnected: ${reason}`);
      });

      this.socket.on('connect_error', (err) => {
        this.log(`Connection error: ${err.message}`);
      });

      // Resolve after a timeout even if connect hasn't fired
      // (so the launcher can keep going)
      setTimeout(() => {
        if (!this.connected) {
          this.log('Connect timed out, moving on');
          resolve();
        }
      }, 15000);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.log('Disconnected (manual)');
    }
  }
}

// ============================================================
//  Launcher
// ============================================================

async function main() {
  console.log(`\n=== CyTube Multi-Bot Launcher ===`);
  console.log(`Channel : ${CHANNEL}`);
  console.log(`Bots    : ${BOT_COUNT}`);
  if (PROXIES.length > 0) {
    var totalProxied = 0;
    PROXIES.forEach(function(p, idx) {
      var count = PROXY_BOT_COUNTS[idx] || 0;
      totalProxied += count;
      console.log(`Proxy ${idx + 1} : ${p}  (${count} bots)`);
    });
    console.log(`Direct  : ${Math.max(0, BOT_COUNT - totalProxied)} bots`);
  } else {
    console.log(`Proxy   : none (all direct)`);
  }
  console.log(`Burst   : ${BURST_SIZE}, then 1 every ${STAGGER_MS / 1000}s\n`);

  // Step 1 - Fetch socket server URL
  console.log(`[${ts()}] Fetching socket config for channel "${CHANNEL}" ...`);

  let serverUrl;
  try {
    const config = await fetchJSON(`https://cytu.be/socketconfig/${CHANNEL}.json`);
    const server = config.servers.find((s) => s.secure) || config.servers[0];
    serverUrl = server.url;
    console.log(`[${ts()}] Socket server: ${serverUrl}\n`);
  } catch (err) {
    console.error(`Failed to fetch socket config: ${err.message}`);
    console.error('Make sure the channel name is correct. Usage:');
    console.error('  CYTUBE_CHANNEL=yourchannel node index.js');
    process.exit(1);
  }

  // Step 2 - Launch bots with staggered connections
  const bots = [];

  for (let i = 1; i <= BOT_COUNT; i++) {
    // Assign proxy: walk through proxy ranges, rest go direct
    var useProxy = null;
    var offset = 0;
    for (var p = 0; p < PROXIES.length; p++) {
      var count = PROXY_BOT_COUNTS[p] || 0;
      if (i > offset && i <= offset + count) {
        useProxy = PROXIES[p];
        break;
      }
      offset += count;
    }
    const bot = new CytubeBot(i, serverUrl, CHANNEL, useProxy);
    bots.push(bot);

    await bot.connect();

    // Stagger: first BURST_SIZE connect quickly, then slow down
    if (i < BURST_SIZE) {
      await sleep(500); // small gap within burst
    } else if (i < BOT_COUNT) {
      console.log(`[${ts()}] Waiting ${STAGGER_MS / 1000}s before next bot (rate limit)...\n`);
      await sleep(STAGGER_MS);
    }
  }

  const connectedCount = bots.filter((b) => b.connected).length;
  console.log(`\n[${ts()}] === All bots launched: ${connectedCount}/${BOT_COUNT} connected ===`);
  console.log(`[${ts()}] Press Ctrl+C to disconnect all bots and exit.\n`);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log(`\n[${ts()}] Shutting down all bots...`);
    bots.forEach((b) => b.disconnect());
    setTimeout(() => process.exit(0), 1000);
  });
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
