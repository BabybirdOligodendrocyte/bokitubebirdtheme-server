'use strict';

const https = require('https');
const http = require('http');
const net = require('net');
const { execSync, spawn } = require('child_process');
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
//  Tunnel Health Monitor - detects zombie SSH tunnels
// ============================================================

const TUNNEL_CHECK_INTERVAL = config.tunnelCheckIntervalSec
  ? config.tunnelCheckIntervalSec * 1000
  : 60000; // default: check every 60 seconds

const TUNNEL_CHECK_TIMEOUT = 5000; // 5s timeout for SOCKS handshake

/**
 * Tests if a SOCKS5 proxy is actually forwarding traffic.
 * Sends a SOCKS5 handshake and expects a response — if the tunnel is
 * zombied, the handshake will hang or be refused even though the port is open.
 */
function testSocksProxy(host, port) {
  return new Promise(function(resolve) {
    var sock = new net.Socket();
    var resolved = false;

    function done(ok) {
      if (resolved) return;
      resolved = true;
      sock.destroy();
      resolve(ok);
    }

    sock.setTimeout(TUNNEL_CHECK_TIMEOUT);
    sock.on('timeout', function() { done(false); });
    sock.on('error', function() { done(false); });

    sock.connect(port, host, function() {
      // Send SOCKS5 greeting: version 5, 1 auth method, no-auth
      sock.write(Buffer.from([0x05, 0x01, 0x00]));
    });

    sock.on('data', function(data) {
      // Valid SOCKS5 response: version 5, method accepted
      if (data.length >= 2 && data[0] === 0x05) {
        done(true);
      } else {
        done(false);
      }
    });

    // Failsafe timeout
    setTimeout(function() { done(false); }, TUNNEL_CHECK_TIMEOUT + 1000);
  });
}

/**
 * Restarts an SSH tunnel by killing the old process and spawning a new one.
 * Only works when tunnelRestart is configured in config.json.
 */
function restartTunnel(tunnelConfig) {
  var label = tunnelConfig.label;
  var port = tunnelConfig.port;
  console.log('[' + ts() + '] [TunnelMon] \x1b[33mRestarting tunnel for ' + label + ' (port ' + port + ')\x1b[0m');

  // Kill anything listening on this port
  try {
    if (process.platform === 'win32') {
      // Find PID listening on the port and kill it
      var out = execSync('netstat -aon | findstr ":' + port + ' " | findstr "LISTENING"', { encoding: 'utf8', timeout: 5000 });
      var lines = out.trim().split('\n');
      lines.forEach(function(line) {
        var parts = line.trim().split(/\s+/);
        var pid = parts[parts.length - 1];
        if (pid && pid !== '0') {
          try { execSync('taskkill /PID ' + pid + ' /F', { timeout: 5000 }); } catch (e) { /* ignore */ }
        }
      });
    } else {
      execSync('lsof -ti:' + port + ' 2>/dev/null | xargs kill -9 2>/dev/null', { timeout: 5000 });
    }
  } catch (e) {
    // May fail if no process was listening — that's fine
  }

  // Wait a moment for port to free up
  setTimeout(function() {
    var sshArgs = [
      '-i', tunnelConfig.sshKey,
      '-N',
      '-D', '127.0.0.1:' + port,
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'ServerAliveInterval=15',
      '-o', 'ServerAliveCountMax=2',
      '-o', 'TCPKeepAlive=yes',
      '-o', 'ExitOnForwardFailure=yes',
      tunnelConfig.sshUser + '@' + tunnelConfig.vpsIp
    ];

    var child = spawn('ssh', sshArgs, {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();

    console.log('[' + ts() + '] [TunnelMon] SSH tunnel respawned for ' + label + ' (pid ' + child.pid + ')');
  }, 2000);
}

/**
 * Starts periodic health checks on all proxy tunnels.
 * If a tunnel fails the SOCKS handshake test, it's considered zombie.
 */
function startTunnelMonitor(groups, tunnelRestartConfigs) {
  var failCounts = {};

  setInterval(async function() {
    for (var i = 0; i < groups.length; i++) {
      var g = groups[i];
      if (!g.proxy) continue; // Skip direct groups

      // Parse host:port from socks5://host:port
      var match = g.proxy.match(/socks5:\/\/([^:]+):(\d+)/);
      if (!match) continue;

      var host = match[1];
      var port = parseInt(match[2], 10);
      var label = g.label || 'Proxy-' + port;
      var key = host + ':' + port;

      var alive = await testSocksProxy(host, port);

      if (alive) {
        if (failCounts[key] > 0) {
          console.log('[' + ts() + '] [TunnelMon] \x1b[32m' + label + ' tunnel recovered\x1b[0m');
        }
        failCounts[key] = 0;
      } else {
        failCounts[key] = (failCounts[key] || 0) + 1;
        console.log('[' + ts() + '] [TunnelMon] \x1b[31m' + label + ' tunnel DEAD (fail #' + failCounts[key] + ')\x1b[0m');

        // After 2 consecutive failures, attempt restart if configured
        if (failCounts[key] >= 2 && tunnelRestartConfigs[port]) {
          restartTunnel(tunnelRestartConfigs[port]);
          failCounts[key] = 0; // Reset counter, give it time to come up
        }
      }
    }
  }, TUNNEL_CHECK_INTERVAL);

  console.log('[' + ts() + '] [TunnelMon] Monitoring tunnels every ' + (TUNNEL_CHECK_INTERVAL / 1000) + 's');
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

  // Start tunnel health monitor
  // Build restart configs from tunnelRestart in config.json (if present)
  var tunnelRestartConfigs = {};
  if (config.tunnelRestart) {
    config.tunnelRestart.forEach(function(t) {
      tunnelRestartConfigs[t.port] = t;
    });
  }
  startTunnelMonitor(GROUPS, tunnelRestartConfigs);

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
