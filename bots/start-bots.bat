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

echo Installing dependencies...
call npm install
echo.

echo Starting bots...
echo Press Ctrl+C to stop all bots.
echo.

node index.js

echo.
echo Bots stopped.
cmd /k
