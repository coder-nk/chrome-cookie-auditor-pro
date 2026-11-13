#!/bin/bash

# Cookie Auditor - Local Network Server Starter

clear

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Cookie Auditor Dashboard - Local Network Server          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org"
    exit 1
fi

# Navigate to audit-server directory
cd "$(dirname "$0")/audit-server" || exit 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Get local IP addresses
echo "🔍 Detecting network addresses..."
echo ""

if command -v ip &> /dev/null; then
    # Linux with ip command
    IPS=$(ip addr show | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d/ -f1)
elif command -v ifconfig &> /dev/null; then
    # macOS or older Linux
    IPS=$(ifconfig | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}')
else
    echo "⚠️  Could not detect IP addresses automatically"
    IPS=""
fi

echo "📍 Your Network Addresses:"
echo ""

if [ -n "$IPS" ]; then
    PORT=3000
    for IP in $IPS; do
        echo "   🌐 http://${IP}:${PORT}"
        echo "   📱 Extension URL: http://${IP}:${PORT}/audit-report"
        echo ""
    done
    
    # Save the first IP for reference
    FIRST_IP=$(echo $IPS | awk '{print $1}')
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📋 Quick Setup for Other Devices:"
    echo ""
    echo "   1. On any device connected to your network"
    echo "   2. Open browser and go to: http://${FIRST_IP}:${PORT}"
    echo "   3. Configure Chrome extension with:"
    echo "      http://${FIRST_IP}:${PORT}/audit-report"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo "   ⚠️  No network interface detected"
    echo "   Server will run on localhost only"
fi

echo ""
echo "🔧 Configuration:"
if [ -f ".env" ]; then
    echo "   ✅ .env file found"
    if grep -q "SUPABASE_URL" .env 2>/dev/null; then
        echo "   ✅ Supabase configured (persistent storage)"
    else
        echo "   ⚠️  Supabase not configured (in-memory storage)"
    fi
else
    echo "   ⚠️  No .env file (in-memory storage only)"
    echo "   💡 Copy .env.example to .env and add Supabase credentials"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Starting server..."
echo "   Press Ctrl+C to stop"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Load environment variables if .env exists and start server
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

node server.js
