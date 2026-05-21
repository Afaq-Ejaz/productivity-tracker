# Productivity Tracker

Visualize your Google Calendar + Tasks productivity with AI insights from Gemini.

## Setup

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/productivity-tracker
cd productivity-tracker
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root:
```
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run Locally
```bash
npm run dev
```

### 4. Deploy to Vercel
1. Push to GitHub
2. Import repo on vercel.com
3. Add environment variables in Vercel dashboard
4. Deploy

### 5. Update Google OAuth Redirect URI
After deploy, go to Google Cloud Console → Credentials → your OAuth client
Add your Vercel URL to Authorized redirect URIs.

## Switching Gmail Accounts
Just click "Sign out" and sign in with a different Google account.
No configuration needed.
