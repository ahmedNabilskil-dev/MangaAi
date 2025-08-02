-- Database Schema Migration for Authentication and Credit System
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing triggers and functions to avoid conflicts
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_payment_sessions_updated_at ON public.payment_sessions;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  provider TEXT DEFAULT 'email',
  credits INTEGER DEFAULT 0,
  daily_credits_used INTEGER DEFAULT 0,
  last_daily_reset TIMESTAMPTZ DEFAULT NOW(),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise')),
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('generation', 'purchase', 'daily_bonus', 'refund')),
  amount INTEGER NOT NULL, -- Positive for credits added, negative for credits spent
  operation TEXT NOT NULL CHECK (operation IN ('text_generation', 'image_generation', 'credit_purchase', 'daily_renewal', 'manual_adjustment')),
  cost_tokens INTEGER,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payment_sessions table
CREATE TABLE IF NOT EXISTS public.payment_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credits', 'subscription')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  amount INTEGER NOT NULL, -- USD cents
  credits_amount INTEGER,
  subscription_plan_id TEXT,
  stripe_session_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update manga_projects table to include user ownership
ALTER TABLE public.manga_projects 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON public.users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_user_id ON public.payment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_status ON public.payment_sessions(status);
CREATE INDEX IF NOT EXISTS idx_manga_projects_user_id ON public.manga_projects(user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_sessions_updated_at ON public.payment_sessions;
CREATE TRIGGER update_payment_sessions_updated_at 
  BEFORE UPDATE ON public.payment_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own data
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Credit transactions policies
DROP POLICY IF EXISTS "Users can view own credit transactions" ON public.credit_transactions;
CREATE POLICY "Users can view own credit transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can insert credit transactions" ON public.credit_transactions;
CREATE POLICY "Service can insert credit transactions" ON public.credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payment sessions policies
DROP POLICY IF EXISTS "Users can view own payment sessions" ON public.payment_sessions;
CREATE POLICY "Users can view own payment sessions" ON public.payment_sessions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can manage payment sessions" ON public.payment_sessions;
CREATE POLICY "Service can manage payment sessions" ON public.payment_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Update manga_projects RLS if it exists
DROP POLICY IF EXISTS "Users can view own projects" ON public.manga_projects;
CREATE POLICY "Users can view own projects" ON public.manga_projects
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can modify own projects" ON public.manga_projects;
CREATE POLICY "Users can modify own projects" ON public.manga_projects
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  initial_credits INTEGER := 10; -- Free tier gets 10 credits to start
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url, provider, credits)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    initial_credits
  );
  
  -- Record the initial credit grant
  INSERT INTO public.credit_transactions (
    user_id, type, amount, operation, description, metadata
  ) VALUES (
    NEW.id, 
    'daily_bonus', 
    initial_credits, 
    'daily_renewal',
    'Welcome bonus - initial free credits',
    jsonb_build_object('welcome_bonus', true)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to grant daily credits
CREATE OR REPLACE FUNCTION public.grant_daily_credits(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  user_record RECORD;
  daily_credits INTEGER;
BEGIN
  -- Get user info
  SELECT * INTO user_record FROM public.users WHERE id = user_uuid;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Determine daily credits based on subscription tier
  daily_credits := CASE user_record.subscription_tier
    WHEN 'free' THEN 10
    WHEN 'basic' THEN 20
    WHEN 'premium' THEN 50
    WHEN 'enterprise' THEN 200
    ELSE 10
  END;
  
  -- Check if 24 hours have passed since last reset
  IF user_record.last_daily_reset < NOW() - INTERVAL '24 hours' THEN
    -- Reset daily usage and grant credits
    UPDATE public.users 
    SET 
      credits = credits + daily_credits,
      daily_credits_used = 0,
      last_daily_reset = NOW()
    WHERE id = user_uuid;
    
    -- Record the transaction
    INSERT INTO public.credit_transactions (
      user_id, type, amount, operation, description, metadata
    ) VALUES (
      user_uuid, 
      'daily_bonus', 
      daily_credits, 
      'daily_renewal',
      'Daily free credits (' || user_record.subscription_tier || ' plan)',
      jsonb_build_object('plan_tier', user_record.subscription_tier)
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and reset daily credits automatically
CREATE OR REPLACE FUNCTION public.check_daily_credit_reset()
RETURNS VOID AS $$
BEGIN
  -- Grant daily credits to all users who are due
  PERFORM public.grant_daily_credits(id) 
  FROM public.users 
  WHERE last_daily_reset < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled function to run daily credit reset (if using pg_cron extension)
-- SELECT cron.schedule('daily-credit-reset', '0 0 * * *', 'SELECT public.check_daily_credit_reset();');

-- Create chat_messages table for storing conversation history
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image')),
  image_url TEXT,
  image_data TEXT, -- Base64 encoded image data for user uploads
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_project_id ON public.chat_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON public.chat_messages(timestamp);

-- Enable RLS on chat_messages table
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat messages policies
DROP POLICY IF EXISTS "Users can view own chat messages" ON public.chat_messages;
CREATE POLICY "Users can view own chat messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert own chat messages" ON public.chat_messages;
CREATE POLICY "Users can insert own chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Service can manage chat messages" ON public.chat_messages;
CREATE POLICY "Service can manage chat messages" ON public.chat_messages
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Note: Demo users will be created automatically when they first sign up
-- through the handle_new_user() trigger function
