"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useCreditStore } from "@/stores/credit-store";
import React, { useEffect, useState } from "react";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { initialize, refreshUser, isAuthenticated } = useAuthStore();
  const { loadCredits } = useCreditStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if we have a stored token
        const token = localStorage.getItem("authToken");

        if (token) {
          // If we have a token, try to refresh user data
          await refreshUser();
          // Load user credits after successful authentication
          await loadCredits();
        } else {
          // No token, initialize as logged out
          await initialize();
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear any invalid tokens
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        await initialize();
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [initialize, refreshUser]);

  // Load credits whenever authentication state changes
  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      console.log("User is authenticated, loading credits...");
      loadCredits();
    }
  }, [isAuthenticated, isInitialized, loadCredits]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          {/* AI Magic Loading Animation */}
          <div className="relative w-16 h-16 mx-auto mb-6">
            {/* Outer ring with sparkles */}
            <div className="absolute inset-0 border-2 border-purple-500/30 rounded-full animate-spin">
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-purple-400 rounded-full"></div>
              <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"></div>
              <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
            </div>

            {/* Inner magic core */}
            <div className="absolute inset-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <div className="text-white text-lg">✨</div>
            </div>

            {/* Floating sparkles */}
            <div className="absolute -top-2 -right-2 text-yellow-400 text-xs animate-pulse">
              ✦
            </div>
            <div className="absolute -bottom-2 -left-2 text-blue-400 text-xs animate-pulse delay-300">
              ✧
            </div>
          </div>

          {/* Loading text */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              MangaVerse AI
            </h3>
            <p className="text-slate-400 text-sm">
              Preparing your creative workspace...
            </p>
          </div>

          {/* Progress indicator */}
          <div className="mt-6 w-48 mx-auto">
            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
