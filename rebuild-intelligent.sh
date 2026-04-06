#!/bin/bash
# Script para reconstruir CLAWDESK Intelligent

echo "🧠 CLAWDESK INTELLIGENT REBUILD"
echo "================================"

echo "📦 Updating repository..."
git pull origin main

echo "🔨 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ Frontend built successfully"

echo ""
echo "🍎 Building macOS app..."
./build-mac-fixed.sh

echo ""
echo "🎯 INTELLIGENT FEATURES:"
echo "   1. Chat-only interface (no buttons)"
echo "   2. AI decides when to take screenshots"
echo "   3. AI decides when to click/type"
echo "   4. Configuration via chat ('configuración')"
echo "   5. Safe Mode with confirmations"
echo ""
echo "🚀 To launch: open dist/mac/CLAWDESK.app"
echo "💬 Just type what you want, AI will decide actions!"