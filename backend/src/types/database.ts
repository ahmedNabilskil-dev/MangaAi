// User Types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  credits: number;
  daily_credits_used: number;
  subscription_tier: "free" | "basic" | "premium" | "enterprise";
  subscription_expires_at?: string;
  last_daily_reset?: string;
  created_at: string;
  updated_at: string;
}

// Credit Transaction Types
export interface CreditTransaction {
  id: string;
  user_id: string;
  type: "generation" | "purchase" | "refund" | "grant";
  amount: number;
  operation: string;
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// Payment Session Types
export interface PaymentSession {
  id: string;
  user_id: string;
  type: "subscription" | "credits";
  status: "pending" | "completed" | "failed" | "cancelled";
  amount: number;
  credits_amount?: number;
  stripe_session_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// AI Operation Types
export interface AIOperation {
  id: string;
  user_id: string;
  type: "text_generation" | "image_generation";
  input: string;
  output?: string;
  credits_used: number;
  status: "pending" | "completed" | "failed";
  metadata?: Record<string, any>;
  created_at: string;
  completed_at?: string;
}
