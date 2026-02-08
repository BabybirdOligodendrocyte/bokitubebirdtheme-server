#!/bin/bash
echo "========================================"
echo "  CyTube Multi-Bot Launcher"
echo "========================================"
echo

cd "$(dirname "$0")"

if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed."
    echo "Install it from https://nodejs.org"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo
fi

echo "Starting 20 bots..."
echo "Press Ctrl+C to stop all bots."
echo

node index.js
