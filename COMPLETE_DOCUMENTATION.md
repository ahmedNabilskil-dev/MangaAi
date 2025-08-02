# 🎌 Manga AI - Complete Documentation & Implementation Guide

> **Last Updated**: August 2, 2025  
> **Status**: Production Ready with Dynamic Credit System

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Credits System Implementation](#credits-system-implementation)
3. [Payment Integration](#payment-integration)
4. [Authentication Setup](#authentication-setup)
5. [Technical Architecture](#technical-architecture)
6. [API Documentation](#api-documentation)
7. [Implementation Logs](#implementation-logs)
8. [User Guide](#user-guide)

---

# Project Overview

## 🎌 Manga AI - Production-Ready AI Manga Creation Platform

A comprehensive Next.js application for creating manga projects using AI, featuring authentication, dynamic credit-based payments, and advanced AI integration.

## ✨ Features

### 🔐 Authentication & User Management

- **Google OAuth Integration** - One-click sign-in with Google
- **Email/Password Authentication** - Traditional registration and login
- **User Profile Management** - Avatar, settings, and account management
- **Secure Session Management** - JWT-based authentication via Supabase

### 💰 Dynamic Credit-Based Payment System

- **Usage-Based Credits** - Pay for actual AI operations (tokens, image dimensions)
- **Daily Free Credits** - 10 free credits per day for all users
- **Real Stripe Integration** - Secure payment processing with webhooks
- **Dynamic Pricing** - Credits calculated based on computational cost
- **Usage Tracking** - Detailed transaction history and analytics

### 🎨 AI-Powered Content Creation

- **Project Creation**: AI-powered manga project generation using MCP prompts
- **Interactive Chat Interface**: Content generation for characters, chapters, scenes, and panels
- **Real-time Credit Consumption** - Credits consumed based on actual usage
- **Context-Aware Tools** - Different tools/prompts for project creation vs. management

### 🔗 Advanced AI Integration

- **MCP Integration**: Advanced prompt and tool management via Model Context Protocol
- **Direct Gemini SDK**: High-performance AI integration without abstraction layers
- **Multi-Modal Generation** - Text and image generation with dynamic credit tracking
- **Smart Cost Calculation** - Dynamic pricing based on token usage and image complexity

---

# Credits System Implementation

## Credits-Only System Implementation Complete 🎉

### 1. **Removed All Subscription Logic** ✅

- Eliminated `SUBSCRIPTION_PLANS` from types
- Removed subscription tiers, expiration dates, and plan management
- Deleted subscription modal component
- Simplified user interface to show only credits
- Updated database queries to remove subscription fields

### 2. **Implemented Dynamic Credit Pricing** 🚀

**Old System:** Fixed static costs (5 credits per image, 1 credit per text)  
**New System:** Dynamic pricing based on actual usage

#### Text Generation Pricing:

```typescript
// Token-based: 1 credit per 1000 tokens
calculateTextCost(2500 tokens) = 3 credits
// Character-based fallback: 0.5 credits per 1000 characters
calculateTextCost(undefined, 3000 chars) = 2 credits
```

#### Image Generation Pricing:

```typescript
// Base rate: 2 credits + megapixel cost + quality multiplier
calculateImageCost(1024, 1024, 'hd') = (2 + 3) * 2 = 10 credits
calculateImageCost(512, 512, 'standard') = (2 + 1) * 1 = 3 credits
```

### 3. **Enhanced Credit Deduction API** 💳

The `/api/deduct-credits` endpoint now accepts dynamic parameters:

```typescript
// Text generation with token count
POST /api/deduct-credits
{
  "userId": "user-123",
  "operation": "textGeneration",
  "tokens": 2500,
  "description": "Story generation"
}

// Image generation with dimensions and quality
POST /api/deduct-credits
{
  "userId": "user-123",
  "operation": "imageGeneration",
  "width": 1024,
  "height": 1024,
  "quality": "hd",
  "description": "Character portrait"
}
```

### 4. **Comprehensive Credit Management** 📊

#### Core Functions:

- `calculateTextCost(tokens?, characters?)` - Dynamic text pricing
- `calculateImageCost(width, height, quality)` - Dynamic image pricing
- `estimateOperationCost(operation, params)` - Pre-operation cost estimation
- `calculateTotalCredits(operations[])` - Bulk operation costing

#### Integration Ready:

- Transaction logging with usage parameters
- Audit trail for cost calculations
- Backward compatibility with existing code

## Benefits of Dynamic Pricing

### 🎯 **Fair & Transparent**

- Users pay for what they actually use
- Small operations cost less, complex operations cost more
- Clear pricing based on computational resources

### 📈 **Scalable Business Model**

- Costs align with actual AI service expenses
- Automatic pricing adjustments for different operation types
- Revenue optimization based on usage patterns

### 🔍 **Detailed Analytics**

- Track exact usage patterns (tokens, image sizes, quality preferences)
- Cost breakdown for each operation
- Usage optimization opportunities

---

# Payment Integration

## Real Stripe Payment Integration Complete 🎉

### What We Accomplished

#### 1. **Real Stripe Integration** 💳

- Replaced fake payment system with actual Stripe checkout
- Implemented secure payment sessions with webhooks
- Added manual payment verification fallback
- PCI-compliant payment processing

#### 2. **Centralized Credit Packages** 📦

**Location**: `/src/lib/credit-packages.ts`

```typescript
export const CREDIT_PACKAGES = [
  { id: "starter", name: "Starter Pack", credits: 100, price: 9.99 },
  { id: "creator", name: "Creator Pack", credits: 500, price: 39.99 },
  {
    id: "professional",
    name: "Professional Pack",
    credits: 1200,
    price: 79.99,
  },
  { id: "enterprise", name: "Enterprise Pack", credits: 3000, price: 149.99 },
  { id: "unlimited", name: "Unlimited Pack", credits: 10000, price: 399.99 },
];
```

#### 3. **Complete Payment Flow** 🔄

1. **Checkout Creation**: `/api/create-checkout-session`
2. **Webhook Processing**: `/api/webhooks/stripe`
3. **Manual Verification**: `/api/verify-payment`
4. **Success Handling**: Automatic credit addition and user profile creation

#### 4. **Enhanced Security** 🔒

- Webhook signature verification
- User profile auto-creation for new users
- Comprehensive error handling and logging
- Secure environment variable management

### Payment APIs

#### Create Checkout Session

```typescript
POST /api/create-checkout-session
{
  "packageId": "creator",
  "userId": "user-123"
}
```

#### Webhook Handler

```typescript
POST / api / webhooks / stripe;
// Stripe webhook payload with signature verification
```

#### Manual Verification

```typescript
POST /api/verify-payment
{
  "sessionId": "cs_test_...",
  "userId": "user-123"
}
```

---

# Authentication Setup

## 🔐 Complete Authentication System

### Supabase Configuration

#### 1. **Google OAuth Setup**

1. Create Google Cloud Project
2. Configure OAuth consent screen
3. Create OAuth 2.0 credentials
4. Add to Supabase Auth settings

#### 2. **Database Schema**

```sql
-- Users table with credit system
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  provider TEXT DEFAULT 'email',
  credits INTEGER DEFAULT 10,
  daily_credits_used INTEGER DEFAULT 0,
  last_daily_reset TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Credit transactions for audit trail
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'generation', 'purchase', 'daily_bonus', 'refund'
  amount INTEGER NOT NULL, -- Positive for additions, negative for deductions
  operation TEXT NOT NULL, -- 'text_generation', 'image_generation', etc.
  cost_tokens INTEGER,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payment sessions for tracking purchases
CREATE TABLE payment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'credits',
  status TEXT NOT NULL, -- 'pending', 'completed', 'failed', 'cancelled'
  amount INTEGER NOT NULL, -- USD cents
  credits_amount INTEGER NOT NULL,
  stripe_session_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. **Row Level Security (RLS)**

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Transaction policies
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Payment session policies
CREATE POLICY "Users can view own payment sessions" ON payment_sessions
  FOR SELECT USING (auth.uid() = user_id);
```

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI Integration
NEXT_PUBLIC_GOOGLE_API_KEY=your_gemini_api_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

# Technical Architecture

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   │   ├── create-checkout-session/ # Payment creation
│   │   ├── webhooks/stripe/         # Webhook handler
│   │   ├── verify-payment/          # Manual verification
│   │   └── deduct-credits/          # Dynamic credit deduction
│   ├── payment/           # Payment success/cancel pages
│   └── manga-flow/        # Main manga creation interface
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── credits/          # Credit system components
│   ├── chat-interface/   # Chat-related components
│   └── ui/              # Reusable UI components
├── hooks/                # Custom React hooks
│   ├── use-auth.tsx     # Authentication hook
│   └── use-credits.tsx  # Credit management hook
├── lib/                  # Utility libraries
│   ├── credit-manager.ts     # Dynamic pricing system
│   ├── credit-packages.ts    # Centralized packages
│   └── stripe.ts            # Stripe configuration
├── services/             # Business logic services
│   ├── auth.service.ts   # Authentication service
│   └── supabase.service.ts # Database service
├── mcp/                  # Model Context Protocol
│   ├── server.ts        # MCP server implementation
│   ├── tools/           # AI tools and prompts
│   └── prompts/         # Structured prompts
└── types/               # TypeScript definitions
    ├── auth.ts          # Authentication types
    └── schemas.ts       # Data schemas
```

## 🔧 Core Technologies

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Authentication**: Supabase Auth with Google OAuth
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe with webhooks
- **AI Integration**: Google Gemini API, Model Context Protocol (MCP)
- **State Management**: React hooks and context
- **UI Components**: Radix UI, Framer Motion

---

# API Documentation

## Credit Management APIs

### Dynamic Credit Deduction

```typescript
POST /api/deduct-credits
Content-Type: application/json

{
  "userId": "uuid",
  "operation": "textGeneration" | "imageGeneration",
  "count": 1,
  "description": "Operation description",

  // For text operations
  "tokens": 2500,
  "characters": 10000,

  // For image operations
  "width": 1024,
  "height": 1024,
  "quality": "standard" | "hd" | "ultra"
}

Response:
{
  "success": true,
  "creditsDeducted": 3,
  "remainingCredits": 47,
  "operation": "Text Generation",
  "count": 1
}
```

### Payment APIs

#### Create Checkout Session

```typescript
POST /api/create-checkout-session
Content-Type: application/json

{
  "packageId": "creator",
  "userId": "uuid"
}

Response:
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

#### Verify Payment

```typescript
POST /api/verify-payment
Content-Type: application/json

{
  "sessionId": "cs_test_...",
  "userId": "uuid"
}

Response:
{
  "success": true,
  "creditsAdded": 500,
  "totalCredits": 547
}
```

## Authentication APIs

All authenticated routes require the `Authorization` header:

```
Authorization: Bearer <supabase_jwt_token>
```

User data is automatically included in the request context via Supabase middleware.

---

# Implementation Logs

## System Evolution Timeline

### Phase 1: Foundation (Completed)

- ✅ Next.js 14 setup with TypeScript
- ✅ Supabase integration with authentication
- ✅ Basic UI components with Tailwind CSS
- ✅ Google OAuth integration

### Phase 2: Payment System (Completed)

- ✅ Replaced fake payment system with real Stripe
- ✅ Implemented secure webhook handling
- ✅ Added manual payment verification
- ✅ Centralized credit package management

### Phase 3: Credits Revolution (Completed)

- ✅ Removed all subscription logic
- ✅ Implemented dynamic, usage-based pricing
- ✅ Token-based text generation costs
- ✅ Size/quality-based image generation costs
- ✅ Enhanced credit deduction API

### Phase 4: AI Integration (In Progress)

- 🔄 MCP server integration
- 🔄 Dynamic cost integration with AI operations
- 🔄 Real-time usage tracking
- 🔄 Advanced analytics dashboard

## Key Decisions Made

### 1. **Credits-Only Model**

**Decision**: Remove subscription tiers, focus purely on credits
**Rationale**: Simpler user experience, fairer pricing, better alignment with AI costs

### 2. **Dynamic Pricing**

**Decision**: Usage-based pricing instead of fixed costs
**Rationale**: More transparent, scalable business model, better user value

### 3. **Real Payment Integration**

**Decision**: Implement actual Stripe instead of mock system
**Rationale**: Production readiness, security compliance, user trust

### 4. **Comprehensive Audit Trail**

**Decision**: Log all credit transactions with detailed metadata
**Rationale**: Debugging, analytics, user transparency, business intelligence

---

# User Guide

## Getting Started

### 1. **Account Creation**

1. Visit the application
2. Click "Sign in with Google" or create email account
3. Complete profile setup
4. Receive 10 free daily credits

### 2. **Buying Credits**

1. Click on credits display in top navigation
2. Choose from 5 credit packages (100-10,000 credits)
3. Complete Stripe checkout
4. Credits added automatically after payment

### 3. **Creating Manga Projects**

1. Click "Create New Project"
2. Enter project details (consumes ~3-5 credits)
3. Use chat interface for content generation
4. Generate characters, scenes, and panels

### 4. **Understanding Costs**

#### Text Generation:

- Short text (500 tokens): **1 credit**
- Medium text (2000 tokens): **2 credits**
- Long text (5000 tokens): **5 credits**

#### Image Generation:

- Small image (512x512): **3 credits**
- Medium image (768x768): **4 credits**
- Large HD image (1024x1024): **10 credits**
- Ultra quality (1536x1536): **19 credits**

### 5. **Daily Free Credits**

- Every user gets **10 free credits daily**
- Resets every 24 hours
- No rollover to next day
- Available regardless of purchased credits

## Troubleshooting

### Payment Issues

1. **Payment succeeded but no credits**: Use manual verification in user profile
2. **Checkout failed**: Check card details and try again
3. **Credits not showing**: Refresh page or check transaction history

### Credit Issues

1. **Unexpected charges**: Check transaction history for detailed breakdown
2. **Daily credits not resetting**: Contact support (resets every 24 hours)
3. **Operations failing**: Ensure sufficient credits before starting

### Technical Issues

1. **Login problems**: Clear browser cache and cookies
2. **Chat not working**: Check internet connection and refresh
3. **Images not generating**: Verify credit balance and try smaller dimensions

---

## 🚀 Quick Start Guide

### 1. **Clone & Install**

```bash
git clone <repository>
cd MangaAi
npm install
```

### 2. **Environment Setup**

Create `.env.local` with all required environment variables (see Authentication Setup section)

### 3. **Database Setup**

1. Create Supabase project
2. Run SQL migrations
3. Configure authentication providers

### 4. **Start Development**

```bash
npm run dev
# Application: http://localhost:3000
```

### 5. **Start MCP Server** (Optional)

```bash
cd src/mcp
npm run dev
# MCP Server: http://localhost:3001
```

---

## 📊 System Status

- **Authentication**: ✅ Production Ready
- **Payment Processing**: ✅ Production Ready
- **Credit System**: ✅ Production Ready
- **AI Integration**: 🔄 In Development
- **Analytics Dashboard**: 🔄 Planned
- **Mobile App**: 🔄 Planned

---

## 🔮 Future Roadmap

### Short Term (1-2 months)

- [ ] Advanced analytics dashboard
- [ ] Bulk credit purchase discounts
- [ ] Usage optimization suggestions
- [ ] Enhanced mobile experience

### Medium Term (3-6 months)

- [ ] API access for developers
- [ ] Webhook support for integrations
- [ ] Advanced user management
- [ ] Multi-language support

### Long Term (6+ months)

- [ ] Mobile applications (iOS/Android)
- [ ] Enterprise features and SSO
- [ ] White-label solutions
- [ ] Advanced AI model integrations

---

_Last updated: August 2, 2025_  
_System Status: Production Ready with Dynamic Credit System_ 🚀
