import apiClient from "@/lib/api-client";
import { create } from "zustand";

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
  cost_tokens?: number;
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

interface CreditState {
  // User credits
  credits: number;
  dailyCreditsUsed: number;
  isLoading: boolean;

  // Credit history
  transactions: CreditTransaction[];
  transactionsLoading: boolean;

  // Actions
  loadCredits: () => Promise<void>;
  loadTransactions: () => Promise<void>;

  // Utility functions (read-only calculations)
  calculateTextGenerationCost: (tokens: number) => number;
  calculateImageGenerationCost: (isHD?: boolean) => number;
  getDailyCreditsRemaining: () => number;
  canAfford: (cost: number) => boolean;

  // Reset
  reset: () => void;
}

export const useCreditStore = create<CreditState>((set, get) => ({
  // Initial state
  credits: 0,
  dailyCreditsUsed: 0,
  isLoading: false,
  transactions: [],
  transactionsLoading: false,

  // Load user credits
  loadCredits: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get("/auth/credits");
      set({
        credits: response.data.credits,
        dailyCreditsUsed: response.data.daily_credits_used || 0,
      });
    } catch (error) {
      console.error("Error loading credits:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Load credit transactions
  loadTransactions: async () => {
    set({ transactionsLoading: true });
    try {
      const response = await apiClient.get("/payments/history");
      console.log("Loading transactions response:", response.data);
      set({ transactions: response.data.data || [] });
    } catch (error) {
      console.error("Error loading transactions:", error);
      set({ transactions: [] });
    } finally {
      set({ transactionsLoading: false });
    }
  },

  // Credit calculation methods (for display purposes only)
  calculateTextGenerationCost: (tokens: number): number => {
    return Math.ceil(tokens / 1000) * CREDIT_COSTS.text_generation;
  },

  calculateImageGenerationCost: (isHD: boolean = false): number => {
    return isHD
      ? CREDIT_COSTS.image_generation_hd
      : CREDIT_COSTS.image_generation;
  },

  // Credit limit methods
  getDailyCreditsRemaining: (): number => {
    // Fixed daily credit limit for all users
    const dailyFreeCredits = 10;
    const state = get();
    return Math.max(0, dailyFreeCredits - state.dailyCreditsUsed);
  },

  canAfford: (cost: number): boolean => {
    const state = get();
    return state.credits >= cost;
  },

  // Reset store
  reset: () => {
    set({
      credits: 0,
      dailyCreditsUsed: 0,
      isLoading: false,
      transactions: [],
      transactionsLoading: false,
    });
  },
}));
