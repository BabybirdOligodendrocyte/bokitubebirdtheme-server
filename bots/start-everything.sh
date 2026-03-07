#!/bin/bash
echo "========================================"
echo "  CyTube 30-Bot Launcher"
echo "  Oracle Cloud SSH Tunnels + Bots"
echo "========================================"
echo

cd "$(dirname "$0")"

# ============================================================
#  FILL THESE IN - Your Oracle Cloud VPS Details
# ============================================================

# VPS #1 - Your first Oracle Cloud VM's public IP address
VPS1_IP="PASTE_YOUR_FIRST_VPS_IP_HERE"

# VPS #2 - Your second Oracle Cloud VM's public IP address
VPS2_IP="PASTE_YOUR_SECOND_VPS_IP_HERE"

# SSH key - Full path to your Oracle Cloud private key file
# Example: ~/.ssh/oracle_key
SSH_KEY="PASTE_YOUR_SSH_KEY_PATH_HERE"

# SSH username - Usually "opc" for Oracle Linux, "ubuntu" for Ubuntu
SSH_USER="opc"

# Local ports for the SOCKS proxies (no need to change these)
PORT1=1080
PORT2=1081

# ============================================================
#  Don't edit below this line
# ============================================================

# Validate settings
if [ "$VPS1_IP" = "PASTE_YOUR_FIRST_VPS_IP_HERE" ]; then
    echo "ERROR: You haven't configured your VPS IPs yet!"
    echo
    echo "Open this file in a text editor and fill in:"
    echo "  - VPS1_IP = Your first Oracle VM's public IP"
    echo "  - VPS2_IP = Your second Oracle VM's public IP"
    echo "  - SSH_KEY = Path to your SSH private key file"
    echo
    exit 1
fi

if [ "$VPS2_IP" = "PASTE_YOUR_SECOND_VPS_IP_HERE" ]; then
    echo "ERROR: VPS2_IP is not set. Edit this file first."
    exit 1
fi

if [ "$SSH_KEY" = "PASTE_YOUR_SSH_KEY_PATH_HERE" ]; then
    echo "ERROR: SSH_KEY path is not set. Edit this file first."
    exit 1
fi

if ! command -v ssh &> /dev/null; then
    echo "ERROR: ssh is not installed."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed."
    echo "Install it from https://nodejs.org"
    exit 1
fi

# Cleanup function
cleanup() {
    echo
    echo "Shutting down tunnels..."
    [ -n "$TUNNEL1_PID" ] && kill "$TUNNEL1_PID" 2>/dev/null
    [ -n "$TUNNEL2_PID" ] && kill "$TUNNEL2_PID" 2>/dev/null
    echo "Done."
    exit 0
}
trap cleanup SIGINT SIGTERM

# Kill any existing tunnels on these ports
echo "Cleaning up old tunnels..."
lsof -ti:$PORT1 2>/dev/null | xargs kill -9 2>/dev/null
lsof -ti:$PORT2 2>/dev/null | xargs kill -9 2>/dev/null

echo
echo "[Step 1/3] Opening SSH tunnel to VPS #1 ($VPS1_IP on port $PORT1)..."
ssh -i "$SSH_KEY" -N -D 127.0.0.1:$PORT1 \
    -o StrictHostKeyChecking=no \
    -o ServerAliveInterval=60 \
    -o ServerAliveCountMax=3 \
    "$SSH_USER@$VPS1_IP" &
TUNNEL1_PID=$!

echo "[Step 2/3] Opening SSH tunnel to VPS #2 ($VPS2_IP on port $PORT2)..."
ssh -i "$SSH_KEY" -N -D 127.0.0.1:$PORT2 \
    -o StrictHostKeyChecking=no \
    -o ServerAliveInterval=60 \
    -o ServerAliveCountMax=3 \
    "$SSH_USER@$VPS2_IP" &
TUNNEL2_PID=$!

echo
echo "Waiting 5 seconds for tunnels to connect..."
sleep 5

# Check if tunnel processes are still alive
TUNNELS_OK=1
if ! kill -0 "$TUNNEL1_PID" 2>/dev/null; then
    echo "WARNING: Tunnel #1 may have failed. Bots will auto-reconnect if needed."
    TUNNELS_OK=0
fi
if ! kill -0 "$TUNNEL2_PID" 2>/dev/null; then
    echo "WARNING: Tunnel #2 may have failed. Bots will auto-reconnect if needed."
    TUNNELS_OK=0
fi

if [ "$TUNNELS_OK" = "1" ]; then
    echo "Both tunnels are UP!"
fi

echo
echo "[Step 3/3] Launching 30 bots..."
echo

# Install deps if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo
fi

node index.js

# Cleanup on exit
cleanup
