# 🎌 Manga AI - Production-Ready AI Manga Creation Platform

A comprehensive Next.js application for creating manga projects using AI, featuring authentication, credit-based payments, subscription tiers, and advanced AI integration.

## ✨ Features

### 🔐 Authentication & User Management

- **Google OAuth Integration** - One-click sign-in with Google
- **Email/Password Authentication** - Traditional registration and login
- **User Profile Management** - Avatar, settings, and account management
- **Secure Session Management** - JWT-based authentication via Supabase

### 💰 Credit-Based Payment System

- **Token-Based Credits** - Pay-per-use model for AI operations
- **Daily Free Credits** - Free tier users get daily credits (10-200 based on plan)
- **Subscription Plans** - Free, Basic ($9.99), Premium ($29.99), Enterprise ($99.99)
- **Credit Purchasing** - Buy additional credits when needed
- **Usage Tracking** - Detailed transaction history and analytics

### 🎨 AI-Powered Content Creation

- **Project Creation**: AI-powered manga project generation using MCP prompts
- **Interactive Chat Interface**: Content generation for characters, chapters, scenes, and panels
- **Real-time Credit Consumption** - Credits consumed based on text/image generation
- **Context-Aware Tools** - Different tools/prompts for project creation vs. management

### 🔗 Advanced AI Integration

- **MCP Integration**: Advanced prompt and tool management via Model Context Protocol
- **Direct Gemini SDK**: High-performance AI integration without abstraction layers
- **Multi-Modal Generation** - Text and image generation with credit tracking
- **Smart Cost Calculation** - Dynamic pricing based on token usage and image complexity

### 📱 Production Features

- **Responsive Design**: Modern UI with Framer Motion animations
- **Database Integration**: Supabase with Row Level Security (RLS)
- **Payment Ready**: Stripe integration structure for subscriptions and credits
- **Security First**: Comprehensive security policies and user data protection

## 🚀 Quick Start

### 1. **Clone & Install**

```bash
git clone <repository>
cd MangaAi
npm install
```

### 2. **Database Setup**

1.  Create a Supabase project at [supabase.com](https://supabase.com)
2.  Run the SQL migration from `database-migration.sql` in your Supabase SQL editor
3.  Enable Google OAuth in Authentication > Settings

### 3. **Environment Setup**

```bash
# Add to .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. **Start Development**

```bash
npm run dev
# Server will start on http://localhost:3000
```

### 5. **Start MCP Server** (Optional)

```bash
# In a separate terminal
cd src/mcp
npm run dev
```

For detailed setup instructions, see [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md)

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/             # React components
│   ├── auth/              # Authentication components
│   ├── credits/           # Credit system components
│   ├── chat-interface/    # Chat-related components
│   └── ui/               # Reusable UI components
├── hooks/                 # Custom React hooks
│   ├── use-auth.tsx      # Authentication hook
│   └── use-credits.tsx   # Credit management hook
├── services/             # Business logic services
│   ├── auth.service.ts   # Authentication service
│   └── data-service.ts   # Data persistence service
├── types/                # TypeScript type definitions
│   ├── auth.ts          # Auth and credit types
│   └── entities.ts      # Data model types
├── mcp/                  # Model Context Protocol integration
│   ├── server.ts        # MCP server implementation
│   ├── tools/           # AI tools and functions
│   └── prompts/         # Structured prompts
└── lib/                 # Utility functions and configs
```

## 💳 Subscription Plans

| Feature                 | Free | Basic    | Premium   | Enterprise |
| ----------------------- | ---- | -------- | --------- | ---------- |
| **Daily Credits**       | 10   | 20       | 50        | 200        |
| **Monthly Credits**     | -    | 500      | 2,000     | 10,000     |
| **Projects**            | 2    | 10       | 50        | Unlimited  |
| **Priority Generation** | ❌   | ❌       | ✅        | ✅         |
| **Advanced Tools**      | ❌   | ✅       | ✅        | ✅         |
| **API Access**          | ❌   | ❌       | ❌        | ✅         |
| **Price**               | Free | $9.99/mo | $29.99/mo | $99.99/mo  |

## 💰 Credit Costs

- **Text Generation**: 1 credit per 1,000 tokens
- **Standard Image**: 5 credits per image
- **HD Image**: 10 credits per image
- **Project Creation**: 5-15 credits (based on complexity)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Authentication**: Supabase Auth, Google OAuth
- **Database**: Supabase (PostgreSQL with RLS)
- **AI Integration**: Google Gemini SDK, Model Context Protocol
- **State Management**: React Context API
- **UI Components**: Radix UI, Lucide Icons

## 🔐 Security

- **Row Level Security (RLS)** - Database-level user data protection
- **JWT Authentication** - Secure session management
- **Google OAuth** - Industry-standard authentication
- **Credit Protection** - Server-side validation and fraud prevention
- **Audit Trail** - Complete transaction logging
  ├── hooks/ # Custom React hooks
  ├── services/ # API services (MCP, Gemini)
  ├── mcp/ # Model Context Protocol server
  └── types/ # TypeScript definitions

```

## 🔧 Architecture

- **Frontend**: Next.js 15 with TypeScript
- **AI Integration**: Direct Gemini SDK (@google/genai)
- **MCP Server**: localhost:3001 for advanced prompt management
- **Database**: Dexie (IndexedDB) for local storage
- **Styling**: Tailwind CSS with shadcn/ui components

## 📖 Documentation

- [Final Analysis Report](FINAL_ANALYSIS_REPORT.md) - Complete system analysis
- [MCP Integration Summary](MCP_INTEGRATION_SUMMARY.md) - MCP implementation details
- [Implementation Logs](docs/implementation-logs/) - Development history

## 🎯 Usage

1. **Create Project**: Use home page to generate manga concepts
2. **Manage Content**: Navigate to project chat interface for content generation
3. **AI Assistance**: Leverage context-aware prompts for different content types

## 🛠️ Development

- Built with modern React patterns and TypeScript
- Context-aware MCP integration
- Optimized bundle sizes and performance
- Comprehensive error handling and fallbacks
```
