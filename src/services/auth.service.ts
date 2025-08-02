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

  constructor() {
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true,
          flowType: "pkce",
        },
      }
    );
  }

  // Helper method to get auth header
  private async getAuthHeaders(): Promise<{ Authorization: string } | {}> {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
    return {};
  }

  // Authentication Methods
  async signInWithGoogle(): Promise<{ data: any; error: any }> {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
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
    try {
      // Use client-side sign in to maintain session in the browser
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  async signUpWithEmail(
    email: string,
    password: string,
    name?: string
  ): Promise<{ data: any; error: any }> {
    try {
      // Use client-side sign up
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || null,
          },
        },
      });

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  async signOut(): Promise<{ error: any }> {
    try {
      // Use client-side sign out
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch("/api/auth/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(await this.getAuthHeaders()),
        },
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      return result.user || null;
    } catch (error: any) {
      console.error("Get current user error:", error);
      return null;
    }
  }

  // Credit Management Methods
  async getUserCredits(
    userId: string
  ): Promise<{ credits: number; daily_credits_used: number }> {
    try {
      const response = await fetch("/api/credits/balance", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(await this.getAuthHeaders()),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get credits");
      }

      const result = await response.json();
      return {
        credits: result.credits,
        daily_credits_used: result.daily_credits_used,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async consumeCredits(
    userId: string,
    amount: number,
    operation: "text_generation" | "image_generation",
    description: string,
    metadata?: any
  ): Promise<{ success: boolean; remaining_credits: number; error?: string }> {
    try {
      const response = await fetch("/api/credits/consume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await this.getAuthHeaders()),
        },
        body: JSON.stringify({
          amount,
          operation,
          description,
          metadata,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          remaining_credits: 0,
          error: result.error,
        };
      }

      return result;
    } catch (error: any) {
      return {
        success: false,
        remaining_credits: 0,
        error: error.message,
      };
    }
  }

  async getCreditHistory(
    userId: string,
    limit: number = 50
  ): Promise<CreditTransaction[]> {
    try {
      const response = await fetch(`/api/credits/transactions?limit=${limit}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(await this.getAuthHeaders()),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get credit history");
      }

      const result = await response.json();
      return result.transactions.map(this.mapDbTransactionToEntity);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Payment Methods
  async createPaymentSession(
    userId: string,
    amount: number,
    creditsAmount: number
  ): Promise<PaymentSession> {
    try {
      const response = await fetch("/api/payments/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await this.getAuthHeaders()),
        },
        body: JSON.stringify({
          amount,
          creditsAmount,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to create payment session");
      }

      const result = await response.json();
      return this.mapDbPaymentSessionToEntity(result.session);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Helper Methods
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
