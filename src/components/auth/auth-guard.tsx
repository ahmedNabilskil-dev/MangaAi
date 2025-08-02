// src/components/auth/auth-guard.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Crown, Loader2, Lock, Star, Zap } from "lucide-react";
import { useState } from "react";
import { AuthModal } from "./auth-modal";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication required page if not authenticated
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Welcome to Manga AI</CardTitle>
            <p className="text-gray-600">
              Sign in to start creating amazing manga content with AI
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Zap className="w-5 h-5 text-blue-500" />
                <span>AI-powered manga creation</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Star className="w-5 h-5 text-purple-500" />
                <span>Advanced character development</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Crown className="w-5 h-5 text-yellow-500" />
                <span>Professional templates</span>
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              onClick={() => setShowAuthModal(true)}
              className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Get Started - It's Free!
            </Button>

            {/* Free Tier Info */}
            <div className="text-center text-sm text-gray-500">
              <p>🎉 Start with 10 free credits daily</p>
              <p>No credit card required</p>
            </div>
          </CardContent>
        </Card>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultMode="signup"
        />
      </div>
    );
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
}
