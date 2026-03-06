'use strict';

const https = require('https');
const http = require('http');
const { io } = require('socket.io-client');
const { SocksProxyAgent } = require('socks-proxy-agent');
const fs = require('fs');
const path = require('path');

// ============================================================
//  Load Configuration
// ============================================================

const CONFIG_PATH = path.join(__dirname, 'config.json');
let config;
try {
  const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
  // Strip comment keys (keys starting with "//")
  config = JSON.parse(raw);
} catch (err) {
  console.error('Failed to load config.json:', err.message);
  console.error('Make sure config.json exists in the bots/ directory.');
  process.exit(1);
}

const CHANNEL = process.env.CYTUBE_CHANNEL || config.channel || 'AltarOfVictory';
const TOTAL_BOTS = parseInt(process.env.BOT_COUNT, 10) || config.totalBots || 30;
const AUTO_RECONNECT = config.autoReconnect !== false;
const RECONNECT_DELAY = (config.reconnectDelaySec || 15) * 1000;
const MAX_RECONNECTS = config.maxReconnects || 0; // 0 = infinite
const BURST_SIZE = config.burstSize || 4;
const STAGGER_MS = config.staggerMs || 11000;
const LOG_LEVEL = process.env.LOG_LEVEL || config.logLevel || 'minimal';
const GROUPS = config.groups || [];

// ============================================================
//  Helpers
// ============================================================

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { headers: { 'User-Agent': 'CytubeBot/2.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJSON(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('HTTP ' + res.statusCode + ' from ' + url));
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
//  Bot class - with auto-reconnect
// ============================================================

class CytubeBot {
  constructor(id, serverUrl, channel, proxyUrl, groupLabel) {
    this.id = id;
    this.label = (groupLabel || 'Direct') + '-' + String(id).padStart(2, '0');
    this.serverUrl = serverUrl;
    this.channel = channel;
    this.proxyUrl = proxyUrl || null;
    this.groupLabel = groupLabel || 'Direct';
    this.socket = null;
    this.connected = false;
    this.guestName = null;
    this.reconnectCount = 0;
    this.intentionalDisconnect = false;
  }

  log(msg) {
    if (LOG_LEVEL === 'silent') return;
    console.log('[' + ts() + '] [' + this.label + '] ' + msg);
  }

  logVerbose(msg) {
    if (LOG_LEVEL !== 'verbose') return;
    console.log('[' + ts() + '] [' + this.label + '] ' + msg);
  }

  connect() {
    return new Promise((resolve) => {
      var via = this.proxyUrl ? ' via ' + this.groupLabel : ' (direct)';
      this.log('Connecting' + via + ' ...');

      var opts = {
        secure: true,
        reconnection: false,  // We handle reconnection ourselves
        transports: ['websocket'],
      };

      if (this.proxyUrl) {
        var agent = new SocksProxyAgent(this.proxyUrl);
        opts.agent = agent;
      }

      this.socket = io(this.serverUrl, opts);

      this.socket.on('connect', () => {
        this.connected = true;
        this.reconnectCount = 0;
        this.log('Connected');
        this.socket.emit('joinChannel', { name: this.channel });
        resolve();
      });

      this.socket.on('channelOpts', () => {
        this.logVerbose('Channel join confirmed');
      });

      this.socket.on('usercount', (count) => {
        this.logVerbose('User count: ' + count);
      });

      this.socket.on('login', (data) => {
        if (data.success) {
          this.guestName = data.name;
          this.log('Guest: ' + data.name);
        }
      });

      this.socket.on('chatMsg', (data) => {
        this.logVerbose('Chat [' + data.username + ']: ' + data.msg.slice(0, 60));
      });

      this.socket.on('kick', (data) => {
        this.log('KICKED: ' + (data.reason || 'no reason'));
        this.scheduleReconnect();
      });

      this.socket.on('errorMsg', (data) => {
        this.logVerbose('Server error: ' + data.msg);
      });

      this.socket.on('disconnect', (reason) => {
        this.connected = false;
        this.log('Disconnected: ' + reason);
        if (!this.intentionalDisconnect) {
          this.scheduleReconnect();
        }
      });

      this.socket.on('connect_error', (err) => {
        this.log('Connection error: ' + err.message);
        if (!this.connected) {
          resolve(); // Don't block launcher
          this.scheduleReconnect();
        }
      });

      // Don't block launcher forever
      setTimeout(() => {
        if (!this.connected) {
          this.log('Connect timed out');
          resolve();
        }
      }, 15000);
    });
  }

  scheduleReconnect() {
    if (!AUTO_RECONNECT || this.intentionalDisconnect) return;
    if (MAX_RECONNECTS > 0 && this.reconnectCount >= MAX_RECONNECTS) {
      this.log('Max reconnects (' + MAX_RECONNECTS + ') reached, giving up');
      return;
    }

    this.reconnectCount++;
    var delay = RECONNECT_DELAY + Math.random() * 5000; // jitter
    this.log('Reconnecting in ' + Math.round(delay / 1000) + 's (attempt ' + this.reconnectCount + ')...');

    setTimeout(() => {
      if (this.intentionalDisconnect) return;
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
      }
      this.connect();
    }, delay);
  }

  disconnect() {
    this.intentionalDisconnect = true;
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }
  }
}

// ============================================================
//  Health Monitor - periodic status line
// ============================================================

function startHealthMonitor(bots) {
  setInterval(() => {
    var alive = 0;
    var dead = 0;
    var reconnecting = 0;

    bots.forEach(function(b) {
      if (b.connected) alive++;
      else if (b.reconnectCount > 0 && !b.intentionalDisconnect) reconnecting++;
      else dead++;
    });

    var bar = '';
    bots.forEach(function(b) {
      bar += b.connected ? '\x1b[32m.\x1b[0m' : '\x1b[31mx\x1b[0m';
    });

    console.log('[' + ts() + '] Status: ' + alive + ' alive, ' + reconnecting + ' reconnecting, ' + dead + ' dead  [' + bar + ']');
  }, 30000);
}

// ============================================================
//  Launch a group of bots (staggered within group)
// ============================================================

async function launchGroup(groupLabel, proxyUrl, count, serverUrl, startId) {
  var bots = [];
  console.log('[' + ts() + '] [' + groupLabel + '] Launching ' + count + ' bots' + (proxyUrl ? ' via ' + proxyUrl : ' (direct)'));

  for (var i = 0; i < count; i++) {
    var bot = new CytubeBot(startId + i, serverUrl, CHANNEL, proxyUrl, groupLabel);
    bots.push(bot);
    await bot.connect();

    // Rate-limit stagger within this group's IP
    if (i < BURST_SIZE - 1) {
      await sleep(500);
    } else if (i < count - 1) {
      await sleep(STAGGER_MS);
    }
  }

  return bots;
}

// ============================================================
//  Main - parallel group launch
// ============================================================

async function main() {
  console.log('');
  console.log('=== CyTube Multi-Bot Launcher v2 ===');
  console.log('Channel  : ' + CHANNEL);
  console.log('Total    : ' + TOTAL_BOTS + ' bots');
  console.log('Groups   : ' + (GROUPS.length || 1));
  console.log('Reconnect: ' + (AUTO_RECONNECT ? 'ON (every ' + (RECONNECT_DELAY / 1000) + 's)' : 'OFF'));
  console.log('Log level: ' + LOG_LEVEL);
  console.log('');

  // Step 1 - Fetch socket server URL
  console.log('[' + ts() + '] Fetching socket config for "' + CHANNEL + '" ...');

  var serverUrl;
  try {
    var socketConfig = await fetchJSON('https://cytu.be/socketconfig/' + CHANNEL + '.json');
    var server = socketConfig.servers.find(function(s) { return s.secure; }) || socketConfig.servers[0];
    serverUrl = server.url;
    console.log('[' + ts() + '] Socket server: ' + serverUrl);
    console.log('');
  } catch (err) {
    console.error('Failed to fetch socket config: ' + err.message);
    console.error('Make sure the channel name is correct in config.json');
    process.exit(1);
  }

  // Step 2 - Build group assignments
  var allBots = [];
  var groupPromises = [];
  var botId = 1;

  if (GROUPS.length > 0) {
    // Use configured groups - launch ALL groups in parallel
    var totalFromGroups = 0;

    GROUPS.forEach(function(g) {
      var count = g.count || 0;
      if (count <= 0) return;
      totalFromGroups += count;

      var label = g.label || (g.proxy ? 'Proxy' : 'Direct');
      var proxy = g.proxy || null;
      var startId = botId;
      botId += count;

      groupPromises.push(
        launchGroup(label, proxy, count, serverUrl, startId)
      );
    });

    // Any remaining bots go direct
    var remaining = TOTAL_BOTS - totalFromGroups;
    if (remaining > 0) {
      var startId = botId;
      groupPromises.push(
        launchGroup('Direct-Extra', null, remaining, serverUrl, startId)
      );
    }
  } else {
    // No groups configured - all direct
    groupPromises.push(
      launchGroup('Direct', null, TOTAL_BOTS, serverUrl, 1)
    );
  }

  // Launch all groups in PARALLEL - each group staggers internally
  // but different groups (different IPs) don't need to wait for each other
  var groupResults = await Promise.all(groupPromises);
  groupResults.forEach(function(groupBots) {
    allBots = allBots.concat(groupBots);
  });

  var connectedCount = allBots.filter(function(b) { return b.connected; }).length;
  console.log('');
  console.log('[' + ts() + '] === All groups launched: ' + connectedCount + '/' + allBots.length + ' connected ===');
  console.log('[' + ts() + '] Bots will auto-reconnect if disconnected.');
  console.log('[' + ts() + '] Press Ctrl+C to stop all bots.');
  console.log('');

  // Start health monitor
  startHealthMonitor(allBots);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('');
    console.log('[' + ts() + '] Shutting down all ' + allBots.length + ' bots...');
    allBots.forEach(function(b) { b.disconnect(); });
    setTimeout(() => process.exit(0), 1000);
  });

  process.on('SIGTERM', () => {
    allBots.forEach(function(b) { b.disconnect(); });
    setTimeout(() => process.exit(0), 1000);
  });
}

main().catch(function(err) {
  console.error('Fatal error:', err);
  process.exit(1);
});
