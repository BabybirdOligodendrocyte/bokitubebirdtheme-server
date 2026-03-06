@echo off
title CyTube 30-Bot Launcher v2
echo ========================================
echo   CyTube 30-Bot Launcher v2
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

if not exist "node_modules" (
    echo First run - installing dependencies...
    call npm install
    echo.
)

echo Launching bots from config.json...
echo   Edit config.json to change bot count, proxies, channel.
echo   Press Ctrl+C to stop all bots.
echo.

node index.js

echo.
echo Bots stopped.
cmd /k
