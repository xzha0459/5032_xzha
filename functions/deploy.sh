#!/bin/bash

# Deploy script for Firebase Functions
echo "🚀 Deploying Firebase Functions..."

# Check if we're in the functions directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the functions directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please create one with your API keys."
    echo "See README.md for instructions."
    exit 1
fi

# Load environment variables
source .env

# Check if required environment variables are set
if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ GEMINI_API_KEY not set in .env file"
    exit 1
fi

echo "✅ Environment variables loaded"

# Set Firebase config
echo "🔧 Setting Firebase configuration..."
firebase functions:config:set gemini.api_key="$GEMINI_API_KEY"

if [ ! -z "$SENDGRID_API_KEY" ]; then
    firebase functions:config:set sendgrid.api_key="$SENDGRID_API_KEY"
fi

if [ ! -z "$GOOGLE_MAPS_API_KEY" ]; then
    firebase functions:config:set google.maps_api_key="$GOOGLE_MAPS_API_KEY"
fi

# Deploy functions
echo "🚀 Deploying functions..."
firebase deploy --only functions

echo "✅ Deployment complete!"
echo "Your chatbot function is available at:"
echo "https://australia-southeast2-assignment-1313c.cloudfunctions.net/chatbot"
