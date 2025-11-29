@echo off
REM Automotive Service Management System - Quick Start Script for Windows
REM This script starts both backend and frontend servers automatically

title Automotive Service Management System - Startup

echo.
echo ====================================================
echo  Automotive Service Management System
echo ====================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Get the project root directory
set PROJECT_ROOT=%~dp0

echo Starting Backend Server (Port 5000)...
echo.

REM Start backend in a new window
start cmd /k "cd /d %PROJECT_ROOT%backend && npm start"

REM Wait 3 seconds for backend to initialize
echo Waiting for backend to initialize...
timeout /t 3 /nobreak

echo.
echo Starting Frontend Server (Port 3000)...
echo.

REM Start frontend in a new window
start cmd /k "cd /d %PROJECT_ROOT%frontend && npx serve -p 3000"

REM Wait 2 seconds then open browser
echo Waiting for frontend to initialize...
timeout /t 2 /nobreak

echo.
echo Attempting to open http://localhost:3000 in your default browser...
echo.

REM Open browser
start http://localhost:3000

echo.
echo ====================================================
echo  ✅ APPLICATION STARTED SUCCESSFULLY!
echo ====================================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Note: Two terminal windows will open for backend and frontend servers.
echo Close them to stop the application.
echo.
pause
