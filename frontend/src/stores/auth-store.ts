// Global Auth Store using Zustand
import { authService } from "@/services/auth.service";
import type { User } from "@/types/auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  // Authentication actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;

  // Google OAuth
  signInWithGoogle: () => Promise<void>;

  // User management
  refreshUser: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;

  // Password management
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;

  // State management
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.login(email, password);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || "Login failed",
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (email: string, password: string, name?: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.signup(email, password, name);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || "Registration failed",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          await authService.logout();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          console.error("Logout error:", error);
          // Still clear the user even if logout fails
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      signInWithGoogle: async () => {
        try {
          set({ isLoading: true, error: null });
          // Redirect to Google OAuth endpoint
          window.location.href = `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
          }/auth/google`;
        } catch (error: any) {
          set({
            error: error.message || "Google sign-in failed",
            isLoading: false,
          });
          throw error;
        }
      },

      refreshUser: async () => {
        try {
          set({ isLoading: true });
          const user = await authService.getCurrentUser();
          if (user) {
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error: any) {
          console.error("Refresh user error:", error);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: "Session expired",
          });
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        const { user } = get();
        if (!user) throw new Error("No user logged in");

        try {
          set({ isLoading: true, error: null });
          const updatedUser = await authService.updateProfile(user.id, updates);
          set({
            user: updatedUser,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || "Profile update failed",
            isLoading: false,
          });
          throw error;
        }
      },

      forgotPassword: async (email: string) => {
        try {
          set({ isLoading: true, error: null });
          await authService.forgotPassword(email);
          set({ isLoading: false });
        } catch (error: any) {
          set({
            error: error.message || "Failed to send reset email",
            isLoading: false,
          });
          throw error;
        }
      },

      resetPassword: async (token: string, newPassword: string) => {
        try {
          set({ isLoading: true, error: null });
          await authService.resetPassword(token, newPassword);
          set({ isLoading: false });
        } catch (error: any) {
          set({
            error: error.message || "Password reset failed",
            isLoading: false,
          });
          throw error;
        }
      },

      // State setters
      setUser: (user: User | null) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setLoading: (isLoading: boolean) => set({ isLoading }),

      setError: (error: string | null) => set({ error }),

      clearError: () => set({ error: null }),

      // Initialize auth state
      initialize: async () => {
        try {
          set({ isLoading: true });
          const user = await authService.getCurrentUser();
          set({
            user,
            isAuthenticated: !!user,
            isLoading: false,
          });
        } catch (error) {
          console.error("Auth initialization error:", error);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
