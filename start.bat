@echo off
title Joule — Dev Server

:: Check if .env exists
if not exist ".env" (
    echo.
    echo  ERROR: .env file not found.
    echo  Create a .env file in this folder with:
    echo.
    echo    DATABASE_URL="postgresql://user:password@localhost:5432/jeecommand"
    echo    AUTH_SECRET="your-secret-here"
    echo.
    pause
    exit /b 1
)

:: Check if node_modules exists, install if not
if not exist "node_modules" (
    echo  node_modules not found. Running yarn install...
    echo.
    call yarn install
    if errorlevel 1 (
        echo.
        echo  ERROR: yarn install failed. Make sure Node.js and yarn are installed.
        pause
        exit /b 1
    )
)

echo.
echo  Starting Joule dev server...
echo  Open http://localhost:3000 in your browser.
echo  Press Ctrl+C to stop.
echo.

npm run dev
