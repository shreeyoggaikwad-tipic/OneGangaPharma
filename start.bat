@echo off
REM Medicine Shop Application Startup Script for Windows
REM Ensures all dependencies and upload directories are properly configured

echo 🚀 Starting Medicine Shop Application...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js and try again.
    pause
    exit /b 1
)

REM Setup upload directories
echo 🔧 Setting up upload directories...
node setup-uploads.js

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Push database schema
echo 🗄️ Setting up database...
npm run db:push

REM Start the development server
echo 🌟 Starting development server...
npm run dev