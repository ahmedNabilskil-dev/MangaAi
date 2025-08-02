// src/hooks/use-credits.tsx
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth.service";
import { CREDIT_COSTS, CreditTransaction } from "@/types/auth";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface CreditContextType {
  credits: number;
  dailyCreditsUsed: number;
  isLoading: boolean;
  transactions: CreditTransaction[];

  // Credit operations
  consumeCredits: (
    amount: number,
    operation: "text_generation" | "image_generation",
    description: string,
    metadata?: any
  ) => Promise<{ success: boolean; remaining: number; error?: string }>;

  refreshCredits: () => Promise<void>;
  getCreditHistory: () => Promise<void>;

  // Credit calculations
  calculateTextGenerationCost: (tokens: number) => number;
  calculateImageGenerationCost: (isHD?: boolean) => number;

  // Credit information
  getDailyCreditsRemaining: () => number;
  canAfford: (cost: number) => boolean;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export function CreditProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [credits, setCredits] = useState(0);
  const [dailyCreditsUsed, setDailyCreditsUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);

  const refreshCredits = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const creditData = await authService.getUserCredits(user.id);
      setCredits(creditData.credits);
      setDailyCreditsUsed(creditData.daily_credits_used);
    } catch (error: any) {
      console.error("Error refreshing credits:", error);
      toast({
        title: "Error",
        description: "Failed to refresh credit balance.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCreditHistory = async () => {
    if (!user?.id) return;

    try {
      const history = await authService.getCreditHistory(user.id);
      setTransactions(history);
    } catch (error: any) {
      console.error("Error fetching credit history:", error);
    }
  };

  const consumeCredits = async (
    amount: number,
    operation: "text_generation" | "image_generation",
    description: string,
    metadata?: any
  ): Promise<{ success: boolean; remaining: number; error?: string }> => {
    if (!user?.id) {
      return {
        success: false,
        remaining: credits,
        error: "User not authenticated",
      };
    }

    try {
      const result = await authService.consumeCredits(
        user.id,
        amount,
        operation,
        description,
        metadata
      );

      if (result.success) {
        setCredits(result.remaining_credits);
        setDailyCreditsUsed((prev) => prev + amount);

        // Refresh credit history
        await getCreditHistory();

        toast({
          title: "Credits Used",
          description: `${amount} credits used for ${description}`,
        });
      } else {
        toast({
          title: "Insufficient Credits",
          description:
            result.error || "Not enough credits to perform this operation.",
          variant: "destructive",
        });
      }

      return {
        success: result.success,
        remaining: result.remaining_credits,
        error: result.error,
      };
    } catch (error: any) {
      console.error("Error consuming credits:", error);
      const errorMessage = "Failed to process credit transaction.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      return {
        success: false,
        remaining: credits,
        error: errorMessage,
      };
    }
  };

  // Credit calculation methods
  const calculateTextGenerationCost = (tokens: number): number => {
    return Math.ceil(tokens / 1000) * CREDIT_COSTS.text_generation;
  };

  const calculateImageGenerationCost = (isHD: boolean = false): number => {
    return isHD
      ? CREDIT_COSTS.image_generation_hd
      : CREDIT_COSTS.image_generation;
  };

  // Credit limit methods
  const getDailyCreditsRemaining = (): number => {
    // Fixed daily credit limit for all users
    const dailyFreeCredits = 10;
    return Math.max(0, dailyFreeCredits - dailyCreditsUsed);
  };

  const canAfford = (cost: number): boolean => {
    return credits >= cost;
  };

  // Initialize credits when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      refreshCredits();
      getCreditHistory();
    } else {
      setCredits(0);
      setDailyCreditsUsed(0);
      setTransactions([]);
    }
  }, [isAuthenticated, user?.id]);

  // Set up periodic credit refresh (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refreshCredits();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const value: CreditContextType = {
    credits,
    dailyCreditsUsed,
    isLoading,
    transactions,
    consumeCredits,
    refreshCredits,
    getCreditHistory,
    calculateTextGenerationCost,
    calculateImageGenerationCost,
    getDailyCreditsRemaining,
    canAfford,
  };

  return (
    <CreditContext.Provider value={value}>{children}</CreditContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error("useCredits must be used within a CreditProvider");
  }
  return context;
}
