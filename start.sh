#!/usr/bin/env bash
set -e

echo ""
echo "============================================="
echo " JOULE — JEE Preparation Platform"
echo "============================================="
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo " ERROR: .env file not found."
    echo ""
    echo " Create a .env file in this folder with:"
    echo ""
    echo '   DATABASE_URL="postgresql://user:password@localhost:5432/jeecommand"'
    echo '   AUTH_SECRET="your-secret-here"'
    echo ""
    echo " See README.md for full setup instructions."
    echo ""
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo " ERROR: Node.js is not installed."
    echo " Install it from https://nodejs.org or via your package manager:"
    echo ""
    echo "   macOS:  brew install node"
    echo "   Ubuntu: sudo apt install nodejs npm"
    echo ""
    exit 1
fi

# Pick yarn or fall back to npm
if command -v yarn &> /dev/null; then
    PKG_MANAGER="yarn"
else
    PKG_MANAGER="npm"
fi

# Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo " node_modules not found. Installing dependencies with $PKG_MANAGER..."
    echo ""
    $PKG_MANAGER install
    echo ""
fi

echo " Starting Joule dev server..."
echo " Open http://localhost:3000 in your browser."
echo " Press Ctrl+C to stop."
echo ""

npm run dev
