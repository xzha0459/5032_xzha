@echo off
REM Deploy script for Firebase Functions (Windows)

echo 🚀 Deploying Firebase Functions...

REM Check if we're in the functions directory
if not exist "package.json" (
    echo ❌ Please run this script from the functions directory
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  .env file not found. Please create one with your API keys.
    echo See README.md for instructions.
    pause
    exit /b 1
)

echo ✅ Environment file found

REM Deploy functions
echo 🚀 Deploying functions...
firebase deploy --only functions

echo ✅ Deployment complete!
echo Your chatbot function is available at:
echo https://australia-southeast2-assignment-1313c.cloudfunctions.net/chatbot

pause
