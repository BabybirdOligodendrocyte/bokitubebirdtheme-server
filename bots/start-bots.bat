@echo off
title CyTube Multi-Bot Launcher
echo ========================================
echo   CyTube Multi-Bot Launcher
echo ========================================
echo.

cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed.
    echo Download it from https://nodejs.org
    echo.
    pause
    exit /b 1
)

if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting 20 bots...
echo.
echo To route some bots through your VPN's SOCKS proxy:
echo   set PROXY_URL=socks5://127.0.0.1:1080
echo   set PROXY_BOT_COUNT=10
echo   start-bots.bat
echo.
echo Press Ctrl+C to stop all bots.
echo.

node index.js

pause
