# Firebase Functions Setup

## Environment Variables

Create a `.env` file in the `functions` directory with the following variables:

```bash
# SendGrid Email Service
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_SENDER=your_email@example.com

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Google Gemini AI API (Required for Chatbot)
GEMINI_API_KEY=your_gemini_api_key_here
```

## Getting Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Add it to your `.env` file as `GEMINI_API_KEY`

## Deploying Functions

### Method 1: Using the deploy script (Recommended)

**For Windows:**
```bash
cd functions
deploy.bat
```

**For Linux/Mac:**
```bash
cd functions
chmod +x deploy.sh
./deploy.sh
```

### Method 2: Manual deployment

1. Install dependencies:
   ```bash
   cd functions
   npm install
   ```

2. Set environment variables in Firebase:
   ```bash
   firebase functions:config:set gemini.api_key="your_gemini_api_key_here"
   firebase functions:config:set sendgrid.api_key="your_sendgrid_api_key_here"
   firebase functions:config:set google.maps_api_key="your_google_maps_api_key_here"
   ```

3. Deploy functions:
   ```bash
   firebase deploy --only functions
   ```

### Testing the Chatbot

After deployment, you can test the chatbot function:

```bash
# Test locally (requires .env file)
node test-chatbot.js

# Test deployed function
curl -X POST https://australia-southeast2-assignment-1313c.cloudfunctions.net/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, I need some mental health support."}'
```

## Available Functions

- `chatbot`: Mental health support chatbot using Gemini AI
- `emailsender`: Send emails using SendGrid
- `searchMentalHealthServices`: Search for mental health services using Google Maps API
