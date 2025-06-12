#!/bin/bash

# Medicine Shop Application Startup Script
# Ensures all dependencies and upload directories are properly configured

echo "🚀 Starting Medicine Shop Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Setup upload directories
echo "🔧 Setting up upload directories..."
node setup-uploads.js

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Push database schema
echo "🗄️ Setting up database..."
npm run db:push

# Start the development server
echo "🌟 Starting development server..."
npm run dev