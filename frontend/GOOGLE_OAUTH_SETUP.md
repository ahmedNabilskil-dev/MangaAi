# Google OAuth Setup Guide

## Current Configuration

**Google Client ID**: `556626379574-jlp7ens7o6id61cc1eqg6bi291j0fnj0.apps.googleusercontent.com`  
**Callback URL**: `http://localhost:3001/auth/google/callback`  
**Frontend URL**: `http://localhost:9002`

## Required Google Cloud Console Setup

### 1. OAuth Consent Screen

- Go to [Google Cloud Console](https://console.cloud.google.com)
- Navigate to "APIs & Services" → "OAuth consent screen"
- Configure the OAuth consent screen:
  - **User Type**: External (for testing) or Internal (for organization only)
  - **App name**: MangaAI
  - **User support email**: Your email
  - **Developer contact information**: Your email
  - **Authorized domains**: `localhost` (for development)

### 2. Credentials Configuration

- Go to "APIs & Services" → "Credentials"
- Find your OAuth 2.0 Client ID or create a new one
- **Authorized JavaScript origins**:
  - `http://localhost:9002`
  - `http://localhost:3001`
- **Authorized redirect URIs**:
  - `http://localhost:3001/auth/google/callback`

### 3. Required APIs

Make sure these APIs are enabled:

- Google+ API (for profile information)
- Google Identity API

## Testing Steps

1. Visit: `http://localhost:9002/test-google-auth`
2. Click "Test Google Auth Redirect"
3. Check browser console for errors
4. Verify the redirect works

## Common Issues

1. **"This app isn't verified"**: Normal for development, click "Advanced" → "Go to MangaAI (unsafe)"
2. **"redirect_uri_mismatch"**: Check the authorized redirect URIs in Google Console
3. **"access_blocked"**: OAuth consent screen not configured properly

## Debug Information

- Backend endpoint: `http://localhost:3001/auth/google`
- Callback endpoint: `http://localhost:3001/auth/google/callback`
- Final redirect: `http://localhost:9002/auth/callback?token=...&refresh=...`
