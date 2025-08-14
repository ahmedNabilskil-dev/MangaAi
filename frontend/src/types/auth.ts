// src/types/auth.ts
export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar_url?: string;
  provider?: "google" | "email";
  emailVerified: boolean;
  credits: number;
  daily_credits_used: number;
  last_daily_reset: string;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  type: "generation" | "purchase" | "daily_bonus" | "refund";
  amount: number; // Positive for credits added, negative for credits spent
  operation:
    | "text_generation"
    | "image_generation"
    | "credit_purchase"
    | "daily_renewal"
    | "manual_adjustment";
  cost_tokens?: number; // For AI operations
  description: string;
  metadata?: {
    project_id?: string;
    entity_type?: string;
    entity_id?: string;
    purchase_session_id?: string;
    image_dimensions?: string;
    model_used?: string;
  };
  created_at: string;
}

export interface PaymentSession {
  id: string;
  user_id: string;
  type: "credits";
  status: "pending" | "completed" | "failed" | "cancelled";
  amountCents: number; // USD cents (renamed for consistency)
  credits_amount: number; // For credit purchases
  stripe_session_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface CreditUsage {
  text_generation: number; // Credits per 1000 tokens
  image_generation: number; // Credits per image
  image_generation_hd: number; // Credits per HD image
  advanced_features: number; // Credits per advanced operation
}

// Default credit costs
export const CREDIT_COSTS: CreditUsage = {
  text_generation: 1, // 1 credit per 1000 tokens
  image_generation: 5, // 5 credits per image
  image_generation_hd: 10, // 10 credits per HD image
  advanced_features: 2, // 2 credits per advanced operation
};
