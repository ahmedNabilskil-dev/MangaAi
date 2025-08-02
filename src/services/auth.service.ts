// src/services/auth.service.ts
import { CreditTransaction, PaymentSession, User } from "@/types/auth";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          provider: string | null;
          credits: number;
          daily_credits_used: number;
          last_daily_reset: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["users"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          amount: number;
          operation: string;
          cost_tokens: number | null;
          description: string;
          metadata: any;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["credit_transactions"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["credit_transactions"]["Insert"]
        >;
      };
      payment_sessions: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          status: string;
          amount: number;
          credits_amount: number;
          stripe_session_id: string | null;
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["payment_sessions"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["payment_sessions"]["Insert"]
        >;
      };
    };
  };
}

export class AuthService {
  public supabase: SupabaseClient<Database>;
  private readonly SUPABASE_URL = "https://zbstugrprjefmjwgtcbr.supabase.co";
  private readonly SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpic3R1Z3JwcmplZm1qd2d0Y2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MDgyNDAsImV4cCI6MjA2OTM4NDI0MH0.kV0rsqzWehTQkaFhlQR0mwG2okLIu-h3Yqe_3WGY4tw";

  constructor() {
    this.supabase = createClient<Database>(
      this.SUPABASE_URL,
      this.SUPABASE_ANON_KEY
    );
  }

  // Authentication Methods
  async signInWithGoogle(): Promise<{ data: any; error: any }> {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    return { data, error };
  }

  async signInWithEmail(
    email: string,
    password: string
  ): Promise<{ data: any; error: any }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  async signUpWithEmail(
    email: string,
    password: string,
    name?: string
  ): Promise<{ data: any; error: any }> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || "",
        },
      },
    });
    return { data, error };
  }

  async signOut(): Promise<{ error: any }> {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  async getCurrentUser(): Promise<User | null> {
    const { data } = await this.supabase.auth.getUser();
    if (!data.user) return null;

    // Get user profile from our users table
    const { data: profile, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (error || !profile) {
      // Try to create user profile via API
      try {
        const response = await fetch("/api/create-user-profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: data.user.id }),
        });

        if (response.ok) {
          // Retry getting the profile
          const { data: newProfile, error: retryError } = await this.supabase
            .from("users")
            .select("*")
            .eq("id", data.user.id)
            .single();

          if (!retryError && newProfile) {
            return this.mapDbUserToEntity(newProfile);
          }
        }
      } catch (createError) {
        console.error("Failed to create user profile:", createError);
      }

      // Fallback: create user profile directly
      const newUser = await this.createUserProfile(data.user);
      return newUser;
    }

    return this.mapDbUserToEntity(profile);
  }

  async createUserProfile(authUser: any): Promise<User> {
    const now = new Date().toISOString();
    const userProfile = {
      id: authUser.id,
      email: authUser.email,
      name:
        authUser.user_metadata?.name ||
        authUser.user_metadata?.full_name ||
        null,
      avatar_url: authUser.user_metadata?.avatar_url || null,
      provider: authUser.app_metadata?.provider || "email",
      credits: 0,
      daily_credits_used: 0,
      last_daily_reset: now,
    };

    const { data, error } = await this.supabase
      .from("users")
      .insert(userProfile)
      .select()
      .single();

    if (error) throw error;

    // Grant initial daily credits
    await this.grantDailyCredits(authUser.id);

    return this.mapDbUserToEntity(data);
  }

  // Credit Management Methods
  async getUserCredits(
    userId: string
  ): Promise<{ credits: number; daily_credits_used: number }> {
    const { data, error } = await this.supabase
      .from("users")
      .select("credits, daily_credits_used, last_daily_reset")
      .eq("id", userId)
      .single();

    if (error) throw error;

    // Check if daily credits should be reset
    await this.checkAndResetDailyCredits(userId);

    return {
      credits: data.credits,
      daily_credits_used: data.daily_credits_used,
    };
  }

  async checkAndResetDailyCredits(userId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from("users")
      .select("last_daily_reset, daily_credits_used")
      .eq("id", userId)
      .single();

    if (error || !data) return;

    const lastReset = new Date(data.last_daily_reset);
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    // Check if 24 hours have passed since last reset
    if (now.getTime() - lastReset.getTime() >= oneDay) {
      await this.resetDailyCredits(userId);
    }
  }

  async resetDailyCredits(userId: string): Promise<void> {
    const now = new Date().toISOString();

    const { error } = await this.supabase
      .from("users")
      .update({
        daily_credits_used: 0,
        last_daily_reset: now,
      })
      .eq("id", userId);

    if (error) throw error;

    // Grant daily free credits
    await this.grantDailyCredits(userId);
  }

  async grantDailyCredits(userId: string): Promise<void> {
    const { data: user, error: userError } = await this.supabase
      .from("users")
      .select("credits")
      .eq("id", userId)
      .single();

    if (userError || !user) return;

    // For now, give everyone 10 daily free credits
    const dailyFreeCredits = 10;

    // Add daily credits
    const newCredits = user.credits + dailyFreeCredits;

    const { error: updateError } = await this.supabase
      .from("users")
      .update({ credits: newCredits })
      .eq("id", userId);

    if (updateError) throw updateError;

    // Record transaction
    await this.recordCreditTransaction({
      user_id: userId,
      type: "daily_bonus",
      amount: dailyFreeCredits,
      operation: "daily_renewal",
      description: "Daily free credits",
      metadata: { model_used: "free" },
    });
  }

  async consumeCredits(
    userId: string,
    amount: number,
    operation: "text_generation" | "image_generation",
    description: string,
    metadata?: any
  ): Promise<{ success: boolean; remaining_credits: number; error?: string }> {
    // Check if user has enough credits
    const { credits, daily_credits_used } = await this.getUserCredits(userId);

    if (credits < amount) {
      return {
        success: false,
        remaining_credits: credits,
        error: "Insufficient credits",
      };
    }

    // Deduct credits
    const newCredits = credits - amount;
    const newDailyUsed = daily_credits_used + amount;

    const { error } = await this.supabase
      .from("users")
      .update({
        credits: newCredits,
        daily_credits_used: newDailyUsed,
      })
      .eq("id", userId);

    if (error) {
      return {
        success: false,
        remaining_credits: credits,
        error: error.message,
      };
    }

    // Record transaction
    await this.recordCreditTransaction({
      user_id: userId,
      type: "generation",
      amount: -amount,
      operation,
      description,
      metadata,
    });

    return {
      success: true,
      remaining_credits: newCredits,
    };
  }

  async addCredits(
    userId: string,
    amount: number,
    type: "purchase" | "refund",
    description: string,
    metadata?: any
  ): Promise<void> {
    const { data: user, error: userError } = await this.supabase
      .from("users")
      .select("credits")
      .eq("id", userId)
      .single();

    if (userError || !user) throw userError;

    const newCredits = user.credits + amount;

    const { error } = await this.supabase
      .from("users")
      .update({ credits: newCredits })
      .eq("id", userId);

    if (error) throw error;

    // Record transaction
    await this.recordCreditTransaction({
      user_id: userId,
      type,
      amount,
      operation: type === "purchase" ? "credit_purchase" : "manual_adjustment",
      description,
      metadata,
    });
  }

  async recordCreditTransaction(
    transaction: Omit<CreditTransaction, "id" | "created_at">
  ): Promise<void> {
    const { error } = await this.supabase.from("credit_transactions").insert({
      user_id: transaction.user_id,
      type: transaction.type,
      amount: transaction.amount,
      operation: transaction.operation,
      cost_tokens: transaction.cost_tokens || null,
      description: transaction.description,
      metadata: transaction.metadata || {},
    });

    if (error) throw error;
  }

  async getCreditHistory(
    userId: string,
    limit: number = 50
  ): Promise<CreditTransaction[]> {
    const { data, error } = await this.supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.map(this.mapDbTransactionToEntity);
  }

  // Payment Methods
  async createPaymentSession(
    userId: string,
    amount: number,
    creditsAmount: number
  ): Promise<PaymentSession> {
    const sessionData = {
      user_id: userId,
      type: "credits",
      status: "pending",
      amount,
      credits_amount: creditsAmount,
      stripe_session_id: null,
      metadata: {},
    };

    const { data, error } = await this.supabase
      .from("payment_sessions")
      .insert(sessionData)
      .select()
      .single();

    if (error) throw error;

    return this.mapDbPaymentSessionToEntity(data);
  }

  // Helper Methods
  private mapDbUserToEntity(
    dbUser: Database["public"]["Tables"]["users"]["Row"]
  ): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name || undefined,
      avatar_url: dbUser.avatar_url || undefined,
      provider: dbUser.provider as any,
      credits: dbUser.credits,
      daily_credits_used: dbUser.daily_credits_used,
      last_daily_reset: dbUser.last_daily_reset,
      created_at: dbUser.created_at,
      updated_at: dbUser.updated_at,
    };
  }

  private mapDbTransactionToEntity(
    dbTransaction: Database["public"]["Tables"]["credit_transactions"]["Row"]
  ): CreditTransaction {
    return {
      id: dbTransaction.id,
      user_id: dbTransaction.user_id,
      type: dbTransaction.type as any,
      amount: dbTransaction.amount,
      operation: dbTransaction.operation as any,
      cost_tokens: dbTransaction.cost_tokens || undefined,
      description: dbTransaction.description,
      metadata: dbTransaction.metadata || undefined,
      created_at: dbTransaction.created_at,
    };
  }

  private mapDbPaymentSessionToEntity(
    dbSession: Database["public"]["Tables"]["payment_sessions"]["Row"]
  ): PaymentSession {
    return {
      id: dbSession.id,
      user_id: dbSession.user_id,
      type: dbSession.type as any,
      status: dbSession.status as any,
      amount: dbSession.amount,
      credits_amount: dbSession.credits_amount || 0,
      stripe_session_id: dbSession.stripe_session_id || undefined,
      metadata: dbSession.metadata || undefined,
      created_at: dbSession.created_at,
      updated_at: dbSession.updated_at,
    };
  }
}

export const authService = new AuthService();
