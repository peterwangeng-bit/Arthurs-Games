@echo off
cd /d "%~dp0"
where npm >nul 2>&1
if errorlevel 1 (
  echo.
  echo Node.js is not installed.
  echo Download it from https://nodejs.org/ then run this file again.
  echo.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing lobby server...
  call npm install
)
echo.
echo Starting Depth Strike lobby server...
echo Open this in your browser: http://localhost:8080
echo Friends on your network: http://YOUR-PC-IP:8080
echo.
start "" "http://localhost:8080/depth-strike.html"
call npm start
