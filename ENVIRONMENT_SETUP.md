# 🔧 Environment Setup Guide

This guide will help you set up all the required environment variables for your MangaAI project.

## 📋 Required Environment Variables

### 1. 🗄️ Database (Supabase)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select your existing project
3. Go to **Settings** → **API**
4. Copy the values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 2. 🤖 AI Model (Gemini)

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated key:

```bash
GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. 💳 Payments (Stripe)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Sign in or create a Stripe account
3. Copy the keys from the **"Standard keys"** section:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key-here
STRIPE_SECRET_KEY=sk_test_your-secret-key-here
```

4. For webhooks, go to **Developers** → **Webhooks** → **Add endpoint**:
   - Endpoint URL: `http://localhost:9002/api/webhooks/stripe`
   - Events: Select `checkout.session.completed` and `payment_intent.succeeded`
   - Copy the webhook secret:

```bash
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here
```

## 🚀 Quick Setup

1. Copy the template:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` and replace all placeholder values with your actual keys

3. Set your application URL:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:9002
```

## 🧪 Testing Your Setup

1. Start the development server:

```bash
npm run dev
```

2. Test the MCP server:

```bash
npm run mcp:http
```

3. Check if all services are working by visiting:
   - Main app: http://localhost:9002
   - MCP Health: http://localhost:3010/health

## 🔒 Security Notes

- **Never commit `.env.local`** to version control
- Keep your `SUPABASE_SERVICE_ROLE_KEY` secret
- Use test keys for development, production keys for production
- Regularly rotate your API keys for security

## 🆘 Troubleshooting

### Common Issues:

1. **"API key not found"** - Make sure environment variables are set correctly
2. **"Database connection failed"** - Check your Supabase URL and keys
3. **"Payment processing failed"** - Verify your Stripe configuration
4. **"MCP server not starting"** - Check if port 3010 is available

### Need Help?

- Check the console for detailed error messages
- Verify all environment variables are set in `.env.local`
- Make sure you've restarted the development server after changing environment variables
