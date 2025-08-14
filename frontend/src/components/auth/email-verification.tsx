"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import { motion } from "framer-motion";
import { CheckCircle, Mail, RefreshCw, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function EmailVerification() {
  const { user, logout } = useAuthStore();
  const [isResending, setIsResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResendVerification = async () => {
    if (!user?.email) return;

    setIsResending(true);
    try {
      // Call backend to resend verification email
      await authService.resendVerificationEmail?.(user.email);
      setEmailSent(true);
      toast.success("Verification email sent! Please check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification email");
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="main-content bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center p-4">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10 dark:bg-white/5"
            style={{
              width: Math.random() * 200 + 100,
              height: Math.random() * 200 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 50 - 25],
              y: [0, Math.random() * 50 - 25],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-2xl">
          <CardHeader className="text-center">
            {/* Email icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <Mail className="w-8 h-8 text-white" />
            </motion.div>

            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Verify Your Email
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400">
              Please verify your email address to continue
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Email info */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                We sent a verification email to:
              </p>
              <p className="font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                {user?.email}
              </p>
            </div>

            {/* Instructions */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Check your email inbox (and spam folder)</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Click the verification link in the email</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Return to this page and refresh</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              {/* Resend button */}
              <Button
                onClick={handleResendVerification}
                disabled={isResending || emailSent}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : emailSent ? (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Email Sent!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              {/* Logout button */}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full"
              >
                Use Different Account
              </Button>
            </div>

            {/* Help text */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Having trouble? The verification link expires in 24 hours.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
