import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "../config/config";
import { CreditTransaction, PaymentSession, User } from "../types/database";
import { logger } from "../utils/logger";

export class DatabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceRoleKey || config.supabaseAnonKey
    );
  }

  // User operations
  async getUser(userId: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw error;
      }

      return data;
    } catch (error) {
      logger.error("Error fetching user:", { error, userId });
      throw error;
    }
  }

  async updateUserCredits(userId: string, credits: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("users")
        .update({ credits, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;
    } catch (error) {
      logger.error("Error updating user credits:", { error, userId, credits });
      throw error;
    }
  }

  async getUserCredits(
    userId: string
  ): Promise<{ credits: number; daily_credits_used: number }> {
    try {
      const { data, error } = await this.supabase
        .from("users")
        .select("credits, daily_credits_used, last_daily_reset")
        .eq("id", userId)
        .single();

      if (error) throw error;

      // Check if daily credits should be reset
      await this.checkAndResetDailyCredits(userId);

      return {
        credits: data.credits || 0,
        daily_credits_used: data.daily_credits_used || 0,
      };
    } catch (error) {
      logger.error("Error fetching user credits:", { error, userId });
      throw error;
    }
  }

  private async checkAndResetDailyCredits(userId: string): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from("users")
        .select("last_daily_reset")
        .eq("id", userId)
        .single();

      if (error) return;

      const lastReset = data.last_daily_reset
        ? new Date(data.last_daily_reset)
        : null;
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (!lastReset || lastReset < today) {
        await this.supabase
          .from("users")
          .update({
            daily_credits_used: 0,
            last_daily_reset: now.toISOString(),
          })
          .eq("id", userId);
      }
    } catch (error) {
      logger.error("Error checking/resetting daily credits:", {
        error,
        userId,
      });
    }
  }

  // Credit transaction operations
  async createCreditTransaction(
    transaction: Omit<CreditTransaction, "id" | "created_at">
  ): Promise<CreditTransaction> {
    try {
      const { data, error } = await this.supabase
        .from("credit_transactions")
        .insert({
          ...transaction,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error("Error creating credit transaction:", {
        error,
        transaction,
      });
      throw error;
    }
  }

  async getCreditHistory(
    userId: string,
    limit: number = 50
  ): Promise<CreditTransaction[]> {
    try {
      const { data, error } = await this.supabase
        .from("credit_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error("Error fetching credit history:", { error, userId });
      throw error;
    }
  }

  // Payment session operations
  async createPaymentSession(
    session: Omit<PaymentSession, "id" | "created_at" | "updated_at">
  ): Promise<PaymentSession> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await this.supabase
        .from("payment_sessions")
        .insert({
          ...session,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error("Error creating payment session:", { error, session });
      throw error;
    }
  }

  async updatePaymentSession(
    sessionId: string,
    updates: Partial<PaymentSession>
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("payment_sessions")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (error) throw error;
    } catch (error) {
      logger.error("Error updating payment session:", {
        error,
        sessionId,
        updates,
      });
      throw error;
    }
  }

  async getPaymentSessionByStripeId(
    stripeSessionId: string
  ): Promise<PaymentSession | null> {
    try {
      const { data, error } = await this.supabase
        .from("payment_sessions")
        .select("*")
        .eq("stripe_session_id", stripeSessionId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw error;
      }

      return data;
    } catch (error) {
      logger.error("Error fetching payment session by Stripe ID:", {
        error,
        stripeSessionId,
      });
      throw error;
    }
  }

  // Credit operations (atomic)
  async deductCredits(
    userId: string,
    amount: number,
    operation: string,
    description: string,
    metadata?: any
  ): Promise<{ success: boolean; remainingCredits: number; error?: string }> {
    try {
      // Start a transaction by getting current credits first
      const user = await this.getUser(userId);
      if (!user) {
        return { success: false, remainingCredits: 0, error: "User not found" };
      }

      if (user.credits < amount) {
        return {
          success: false,
          remainingCredits: user.credits,
          error: "Insufficient credits",
        };
      }

      const newCredits = user.credits - amount;

      // Update user credits
      await this.updateUserCredits(userId, newCredits);

      // Record transaction
      await this.createCreditTransaction({
        user_id: userId,
        type: "generation",
        amount: -amount,
        operation,
        description,
        metadata,
      });

      return {
        success: true,
        remainingCredits: newCredits,
      };
    } catch (error) {
      logger.error("Error deducting credits:", { error, userId, amount });
      return {
        success: false,
        remainingCredits: 0,
        error: "Failed to deduct credits",
      };
    }
  }

  async addCredits(
    userId: string,
    amount: number,
    type: "purchase" | "refund" | "grant",
    description: string,
    metadata?: any
  ): Promise<void> {
    try {
      const user = await this.getUser(userId);
      if (!user) throw new Error("User not found");

      const newCredits = user.credits + amount;
      await this.updateUserCredits(userId, newCredits);

      // Record transaction
      await this.createCreditTransaction({
        user_id: userId,
        type,
        amount,
        operation:
          type === "purchase" ? "credit_purchase" : "manual_adjustment",
        description,
        metadata,
      });
    } catch (error) {
      logger.error("Error adding credits:", { error, userId, amount });
      throw error;
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
