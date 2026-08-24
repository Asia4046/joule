@echo off
title Joule — Dev Server

echo.
echo  =============================================
echo   JOULE — JEE Preparation Platform
echo  =============================================
echo.

:: Check if .env exists
if not exist ".env" (
    echo  ERROR: .env file not found.
    echo.
    echo  Create a .env file in this folder with:
    echo.
    echo    DATABASE_URL="postgresql://user:password@localhost:5432/jeecommand"
    echo    AUTH_SECRET="your-secret-here"
    echo.
    echo  See README.md for full setup instructions.
    echo.
    pause
    exit /b 1
)

:: Check if Node.js is installed
where node >nul 2>&1
if errorlevel 1 (
    echo  ERROR: Node.js is not installed or not in PATH.
    echo  Download it from https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Check if yarn is installed, fall back to npm
where yarn >nul 2>&1
if errorlevel 1 (
    set PKG_MANAGER=npm
) else (
    set PKG_MANAGER=yarn
)

:: Install dependencies if node_modules is missing
if not exist "node_modules" (
    echo  node_modules not found. Installing dependencies with %PKG_MANAGER%...
    echo.
    call %PKG_MANAGER% install
    if errorlevel 1 (
        echo.
        echo  ERROR: Dependency installation failed.
        pause
        exit /b 1
    )
    echo.
)

echo  Starting Joule dev server...
echo  Open http://localhost:3000 in your browser.
echo  Press Ctrl+C to stop.
echo.

npm run dev
