# 📝 Environment Variables Reference

## Overview

Your MangaAI project requires several environment variables for different services:

- **Database**: Supabase for data storage
- **AI/Chat**: Google Gemini for AI conversations and image generation
- **Payments**: Stripe for subscription and credit purchases
- **MCP Server**: Model Context Protocol server configuration
- **Application**: General app configuration

## 🔧 Complete Environment Variables List

### Database Configuration

```bash
# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=         # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Public anonymous key
SUPABASE_SERVICE_ROLE_KEY=        # Service role key (server-side only)
```

### AI Model Configuration

```bash
# Google Gemini AI
GEMINI_API_KEY=                   # Google Gemini API key for chat and image generation
```

### Payment Processing

```bash
# Stripe Payment Processing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=  # Stripe publishable key (client-side)
STRIPE_SECRET_KEY=                   # Stripe secret key (server-side)
STRIPE_WEBHOOK_SECRET=               # Stripe webhook endpoint secret
```

### Application Configuration

```bash
# Application URLs
NEXT_PUBLIC_APP_URL=              # Your application URL (e.g., http://localhost:9002)

# MCP Server Configuration
MCP_SERVER_PORT=                  # Port for MCP server (default: 3010)
MCP_SERVER_HOST=                  # Host for MCP server (default: localhost)
NEXT_PUBLIC_MCP_SERVER_URL=       # Complete MCP server URL
```

### Optional Configuration

```bash
# Debug and Development
NEXT_PUBLIC_DEBUG=                # Enable debug mode (true/false)
SUPABASE_DEBUG=                   # Enable Supabase debug logs (true/false)

# Security (Optional)
JWT_SECRET=                       # JWT secret for enhanced security
SESSION_SECRET=                   # Session secret for enhanced security

# Additional Image Generation Services (Optional)
REPLICATE_API_TOKEN=              # Replicate API token
HUGGINGFACE_API_KEY=              # Hugging Face API key
STABILITY_API_KEY=                # Stability AI API key
```

## 🚀 Quick Setup Instructions

1. **Copy the template**:

   ```bash
   cp .env.example .env.local
   ```

2. **Get your API keys**:

   - **Supabase**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - **Gemini**: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
   - **Stripe**: [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)

3. **Update `.env.local`** with your actual values

4. **Restart your development server**:
   ```bash
   npm run dev
   ```

## 🔍 Testing Your Configuration

### Test the main application:

```bash
npm run dev
# Visit: http://localhost:9002
```

### Test the MCP server:

```bash
npm run mcp:http
# Visit: http://localhost:3010/health
```

### Test the build:

```bash
npm run build
```

## ⚠️ Security Best Practices

- **Never commit `.env.local`** to version control
- **Keep server-side keys secret** (anything without `NEXT_PUBLIC_`)
- **Use test keys for development**, production keys for production
- **Regularly rotate your API keys**
- **Use environment-specific URLs** (localhost for dev, your domain for production)

## 🐛 Troubleshooting

### Common Issues:

**"API key not found"**

```bash
# Make sure the environment variable is set correctly
echo $GEMINI_API_KEY  # Should show your key
```

**"Database connection failed"**

```bash
# Check your Supabase configuration
curl -I "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/"
```

**"Build failing"**

```bash
# Ensure all required environment variables are set
npm run typecheck  # Check for TypeScript errors
```

**"MCP server not starting"**

```bash
# Check if port is available
lsof -i :3010
# Try a different port
MCP_SERVER_PORT=3011 npm run mcp:http
```

For more detailed setup instructions, see [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md).
