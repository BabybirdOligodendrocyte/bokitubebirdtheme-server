#!/bin/bash
echo "========================================"
echo "  CyTube 30-Bot Launcher v2"
echo "========================================"
echo

cd "$(dirname "$0")"

if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed."
    echo "Install it from https://nodejs.org"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "First run - installing dependencies..."
    npm install
    echo
fi

echo "Launching bots from config.json..."
echo "  Edit config.json to change bot count, proxies, channel."
echo "  Press Ctrl+C to stop all bots."
echo

node index.js
