#!/bin/bash

# Quick test script for local server with Supabase

echo "============================================"
echo "Cookie Auditor Server - Local Test"
echo "============================================"
echo ""
echo "Starting server with Supabase connection..."
echo ""
echo "Supabase URL: https://onxaphgsqodiqctawlzm.supabase.co"
echo "Dashboard will be at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"
echo "============================================"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
  echo ""
fi

# Load environment variables and start server
export $(cat .env | xargs) && node server.js
