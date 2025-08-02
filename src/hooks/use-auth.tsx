// src/hooks/use-auth.tsx
"use client";

import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth.service";
import { AuthState, User } from "@/types/auth";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    name?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: (showLoading?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const refreshUser = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }

      // First check if we have a valid session
      const {
        data: { session },
        error: sessionError,
      } = await authService.supabase.auth.getSession();

      if (sessionError || !session) {
        console.log("No valid session found:", sessionError?.message);
        setUser(null);
        return;
      }

      // If we have a session, get the user data
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error: any) {
      console.error("Error refreshing user:", error);
      setUser(null);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await authService.signInWithGoogle();

      if (error) {
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // User will be set via the auth state change listener
      toast({
        title: "Welcome!",
        description: "Successfully signed in with Google.",
      });
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast({
        title: "Authentication Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await authService.signInWithEmail(
        email,
        password
      );

      if (error) {
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // User will be set via the auth state change listener
      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });
    } catch (error: any) {
      console.error("Email sign in error:", error);
      toast({
        title: "Authentication Error",
        description: "Failed to sign in. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    name?: string
  ) => {
    try {
      setIsLoading(true);
      const { data, error } = await authService.signUpWithEmail(
        email,
        password,
        name
      );

      if (error) {
        toast({
          title: "Registration Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Registration Successful!",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      console.error("Email sign up error:", error);
      toast({
        title: "Registration Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await authService.signOut();

      if (error) {
        toast({
          title: "Sign Out Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setUser(null);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign Out Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for existing session first
        const {
          data: { session },
        } = await authService.supabase.auth.getSession();

        if (session) {
          // If we have a session, get the user data
          await refreshUser(false);
        } else {
          // No session, set user to null and stop loading
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setUser(null);
        setIsLoading(false);
      }
    };

    // Initialize auth state
    initializeAuth();

    // Set up auth state listener
    const {
      data: { subscription },
    } = authService.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, !!session);

      if (event === "SIGNED_IN" && session) {
        // User signed in - refresh user data
        await refreshUser(false);
      } else if (event === "SIGNED_OUT") {
        // User signed out - clear user data
        setUser(null);
        setIsLoading(false);
      } else if (event === "TOKEN_REFRESHED" && session) {
        // Token refreshed - silently update user data
        await refreshUser(false);
      } else if (event === "INITIAL_SESSION") {
        // Handle initial session
        if (session) {
          await refreshUser(false);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Remove user dependency to avoid infinite loop

  // Separate effect for visibility change handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user) {
        // Silently refresh user data when page becomes visible
        // Only if we already have a user (don't show loading)
        refreshUser(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]); // This effect can depend on user since it's separate

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
