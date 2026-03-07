@echo off
title CyTube Bot Launcher (Tunnels + Bots)
echo ========================================
echo   CyTube 30-Bot Launcher
echo   Oracle Cloud SSH Tunnels + Bots
echo ========================================
echo.

cd /d "%~dp0"

:: ============================================================
::  FILL THESE IN - Your Oracle Cloud VPS Details
:: ============================================================

:: VPS #1 - Your first Oracle Cloud VM's public IP address
set VPS1_IP=PASTE_YOUR_FIRST_VPS_IP_HERE

:: VPS #2 - Your second Oracle Cloud VM's public IP address
set VPS2_IP=PASTE_YOUR_SECOND_VPS_IP_HERE

:: SSH key - Full path to your Oracle Cloud private key file
:: Example: C:\Users\YourName\.ssh\oracle_key
set SSH_KEY=PASTE_YOUR_SSH_KEY_PATH_HERE

:: SSH username - Usually "opc" for Oracle Linux, "ubuntu" for Ubuntu
set SSH_USER=opc

:: Local ports for the SOCKS proxies (no need to change these)
set PORT1=1080
set PORT2=1081

:: ============================================================
::  Don't edit below this line
:: ============================================================

:: Validate settings
if "%VPS1_IP%"=="PASTE_YOUR_FIRST_VPS_IP_HERE" (
    echo ERROR: You haven't configured your VPS IPs yet!
    echo.
    echo Open this file in a text editor and fill in:
    echo   - VPS1_IP = Your first Oracle VM's public IP
    echo   - VPS2_IP = Your second Oracle VM's public IP
    echo   - SSH_KEY = Path to your SSH private key file
    echo.
    pause
    exit /b 1
)

if "%VPS2_IP%"=="PASTE_YOUR_SECOND_VPS_IP_HERE" (
    echo ERROR: VPS2_IP is not set. Edit this file first.
    pause
    exit /b 1
)

if "%SSH_KEY%"=="PASTE_YOUR_SSH_KEY_PATH_HERE" (
    echo ERROR: SSH_KEY path is not set. Edit this file first.
    pause
    exit /b 1
)

:: Check for ssh
where ssh >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: ssh is not available.
    echo Windows 10/11 should have it built in.
    echo Try: Settings ^> Apps ^> Optional Features ^> OpenSSH Client
    pause
    exit /b 1
)

:: Check for node
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed.
    echo Download it from https://nodejs.org
    pause
    exit /b 1
)

:: Kill any existing tunnels on these ports
echo Cleaning up old tunnels...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%PORT1% " ^| findstr "LISTENING" 2^>nul') do (
    taskkill /PID %%a /F >nul 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%PORT2% " ^| findstr "LISTENING" 2^>nul') do (
    taskkill /PID %%a /F >nul 2>nul
)

echo.
echo [Step 1/3] Opening SSH tunnel to VPS #1 (%VPS1_IP% on port %PORT1%)...
start /b ssh -i "%SSH_KEY%" -N -D 127.0.0.1:%PORT1% -o StrictHostKeyChecking=no -o ServerAliveInterval=60 -o ServerAliveCountMax=3 %SSH_USER%@%VPS1_IP%

echo [Step 2/3] Opening SSH tunnel to VPS #2 (%VPS2_IP% on port %PORT2%)...
start /b ssh -i "%SSH_KEY%" -N -D 127.0.0.1:%PORT2% -o StrictHostKeyChecking=no -o ServerAliveInterval=60 -o ServerAliveCountMax=3 %SSH_USER%@%VPS2_IP%

:: Give tunnels a moment to establish
echo.
echo Waiting 5 seconds for tunnels to connect...
timeout /t 5 /nobreak >nul

:: Verify tunnels are running
set TUNNELS_OK=1
netstat -an | findstr ":%PORT1% " | findstr "LISTENING" >nul 2>nul
if %errorlevel% neq 0 (
    echo WARNING: Tunnel on port %PORT1% may not be ready yet.
    echo          It might still be connecting. Bots will auto-reconnect if needed.
    set TUNNELS_OK=0
)
netstat -an | findstr ":%PORT2% " | findstr "LISTENING" >nul 2>nul
if %errorlevel% neq 0 (
    echo WARNING: Tunnel on port %PORT2% may not be ready yet.
    echo          It might still be connecting. Bots will auto-reconnect if needed.
    set TUNNELS_OK=0
)

if %TUNNELS_OK%==1 (
    echo Both tunnels are UP!
)

echo.
echo [Step 3/3] Launching 30 bots...
echo.

:: Install deps if needed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

node index.js

echo.
echo Bots stopped. Closing tunnels...

:: Cleanup tunnels on exit
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%PORT1% " ^| findstr "LISTENING" 2^>nul') do (
    taskkill /PID %%a /F >nul 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%PORT2% " ^| findstr "LISTENING" 2^>nul') do (
    taskkill /PID %%a /F >nul 2>nul
)

echo Tunnels closed.
cmd /k
