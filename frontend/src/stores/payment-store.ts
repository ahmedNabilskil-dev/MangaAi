import apiClient from "@/lib/api-client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Plan {
  id: string;
  name: string;
  description?: string;
  priceCents: number; // Changed to match backend schema (price in cents)
  currency: string;
  type: "one_time" | "monthly" | "yearly";
  credits?: number;
  bonus?: number;
  monthlyCredits?: number;
  features?: string[];
  isPopular?: boolean;
  iconName?: string;
  color?: string;
  isActive: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  planId: string;
  amountCents: number; // Changed to match backend schema (cents)
  currency: string;
  type: "one_time" | "subscription";
  status: "pending" | "completed" | "failed" | "cancelled";
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string; // Added for subscription tracking
  creditsAwarded?: number; // Number of credits awarded
  creditsGranted: boolean; // Boolean flag for idempotency
  createdAt: string;
  completedAt?: string;
}

export interface Subscription {
  id: string;
  object: "subscription";
  cancel_at_period_end: boolean;
  canceled_at?: number;
  current_period_start: number;
  current_period_end: number;
  customer: string;
  status:
    | "active"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "past_due"
    | "trialing"
    | "unpaid";
  trial_start?: number;
  trial_end?: number;
  metadata: {
    userId?: string;
    planId?: string;
  };
  items: {
    data: Array<{
      id: string;
      price: {
        id: string;
        unit_amount: number;
        currency: string;
        recurring?: {
          interval: "month" | "year";
        };
      };
    }>;
  };
}

interface PaymentState {
  // Plans
  plans: Plan[];
  plansLoading: boolean;

  // Subscription
  subscription: Subscription | null;
  subscriptionLoading: boolean;

  // Payment history
  paymentHistory: Payment[];
  paymentHistoryLoading: boolean;

  // Checkout
  checkoutLoading: boolean;

  // Actions
  loadPlans: (type?: "one_time" | "monthly" | "yearly") => Promise<void>;
  loadSubscription: () => Promise<void>;
  loadPaymentHistory: () => Promise<void>;
  createCheckoutSession: (
    planId: string
  ) => Promise<{ url: string; sessionId: string }>;
  verifyPayment: (sessionId: string) => Promise<any>;
  cancelSubscription: (cancelAtPeriodEnd?: boolean) => Promise<void>;
  changeSubscriptionPlan: (planId: string) => Promise<any>;
  canSubscribeToPlan: (planId: string) => Promise<{
    canSubscribe: boolean;
    reason?: string;
    currentSubscription?: Subscription;
  }>;

  // Reset
  reset: () => void;
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      // Initial state
      plans: [],
      plansLoading: false,
      subscription: null,
      subscriptionLoading: false,
      paymentHistory: [],
      paymentHistoryLoading: false,
      checkoutLoading: false,

      // Load available plans
      loadPlans: async (type) => {
        set({ plansLoading: true });
        try {
          const url = type ? `/payments/plans?type=${type}` : `/payments/plans`;
          const response = await apiClient.get(url);
          console.log({ response });
          if (response.data.success) {
            set({ plans: response.data.data });
          }
        } catch (error) {
          console.error("Error loading plans:", error);
          set({ plans: [] });
        } finally {
          set({ plansLoading: false });
        }
      },

      // Load user subscription
      loadSubscription: async () => {
        set({ subscriptionLoading: true });
        try {
          const response = await apiClient.get("/payments/subscription");
          console.log("Loading subscription response:", response.data);
          if (response.data.success) {
            set({ subscription: response.data.data });
          }
        } catch (error) {
          console.error("Error loading subscription:", error);
          set({ subscription: null });
        } finally {
          set({ subscriptionLoading: false });
        }
      },

      // Load payment history
      loadPaymentHistory: async () => {
        set({ paymentHistoryLoading: true });
        try {
          const response = await apiClient.get("/payments/history");
          console.log("Loading payment history response:", response.data);
          if (response.data.success) {
            set({ paymentHistory: response.data.data });
          }
        } catch (error) {
          console.error("Error loading payment history:", error);
          set({ paymentHistory: [] });
        } finally {
          set({ paymentHistoryLoading: false });
        }
      },

      // Create checkout session
      createCheckoutSession: async (planId: string) => {
        set({ checkoutLoading: true });
        try {
          const response = await apiClient.post(
            "/payments/create-checkout-session",
            {
              planId,
              successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
              cancelUrl: `${window.location.origin}/payment/cancelled`,
            }
          );
          console.log("Create checkout session response:", response.data);
          if (response.data.success) {
            return response.data.data;
          } else {
            throw new Error("Failed to create checkout session");
          }
        } catch (error) {
          console.error("Error creating checkout session:", error);
          throw error;
        } finally {
          set({ checkoutLoading: false });
        }
      },

      // Verify payment
      verifyPayment: async (sessionId: string) => {
        try {
          const response = await apiClient.post("/payments/verify-payment", {
            sessionId,
          });
          console.log("Verify payment response:", response.data);
          if (response.data.success) {
            // Refresh data after successful payment
            await get().loadSubscription();
            await get().loadPaymentHistory();
            return response.data.data;
          } else {
            throw new Error("Payment verification failed");
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          throw error;
        }
      },

      // Cancel subscription
      cancelSubscription: async (cancelAtPeriodEnd = true) => {
        try {
          const response = await apiClient.put(
            "/payments/subscription/cancel",
            {
              cancelAtPeriodEnd,
            }
          );
          console.log("Cancel subscription response:", response.data);
          if (response.data.success) {
            // Refresh subscription data
            await get().loadSubscription();
          } else {
            throw new Error("Failed to cancel subscription");
          }
        } catch (error) {
          console.error("Error cancelling subscription:", error);
          throw error;
        }
      },

      // Change subscription plan
      changeSubscriptionPlan: async (planId: string) => {
        try {
          const response = await apiClient.put(
            "/payments/subscription/change-plan",
            { planId }
          );
          console.log("Change subscription plan response:", response.data);
          if (response.data.success) {
            // Refresh subscription and plans data
            await get().loadSubscription();
            await get().loadPaymentHistory();
            return response.data.data;
          } else {
            throw new Error("Failed to change subscription plan");
          }
        } catch (error) {
          console.error("Error changing subscription plan:", error);
          throw error;
        }
      },

      // Check if user can subscribe to plan
      canSubscribeToPlan: async (planId: string) => {
        try {
          const response = await apiClient.get(
            `/payments/subscription/can-subscribe/${planId}`
          );
          console.log("Can subscribe to plan response:", response.data);
          if (response.data.success) {
            return response.data.data;
          } else {
            throw new Error("Failed to check subscription eligibility");
          }
        } catch (error) {
          console.error("Error checking subscription eligibility:", error);
          throw error;
        }
      },

      // Reset store
      reset: () => {
        set({
          plans: [],
          plansLoading: false,
          subscription: null,
          subscriptionLoading: false,
          paymentHistory: [],
          paymentHistoryLoading: false,
          checkoutLoading: false,
        });
      },
    }),
    {
      name: "payment-store",
      partialize: (state) => ({
        // Only persist plans to avoid stale subscription data
        plans: state.plans,
      }),
    }
  )
);
