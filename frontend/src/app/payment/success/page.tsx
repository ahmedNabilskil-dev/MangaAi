// src/app/payment/success/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCreditStore } from "@/stores/credit-store";
import { usePaymentStore } from "@/stores/payment-store";
import { motion } from "framer-motion";
import { CheckCircle, Home, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyPayment } = usePaymentStore();
  const { loadCredits } = useCreditStore();

  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasVerified, setHasVerified] = useState(false);

  useEffect(() => {
    // Debug logging
    console.log("Current URL:", window.location.href);
    console.log("Search params:", searchParams.toString());
    console.log("All URL params:", Object.fromEntries(searchParams.entries()));

    const sessionId = searchParams.get("session_id");
    console.log("Session ID from params:", sessionId);

    if (!sessionId) {
      // Show more helpful error with URL details
      const currentUrl =
        typeof window !== "undefined" ? window.location.href : "Unknown";
      const allParams = Object.fromEntries(searchParams.entries());
      setError(
        `No session ID found. Current URL: ${currentUrl}. Available parameters: ${JSON.stringify(
          allParams
        )}`
      );
      setIsVerifying(false);
      return;
    }

    // SECURITY: Check if this session has already been verified in localStorage
    const verifiedKey = `payment_verified_${sessionId}`;
    const alreadyVerified = localStorage.getItem(verifiedKey);

    if (alreadyVerified && !hasVerified) {
      console.log(
        "Payment already verified for this session, showing cached result"
      );
      const cachedResult = JSON.parse(alreadyVerified);
      setVerificationResult(cachedResult);
      setHasVerified(true);
      setIsVerifying(false);
      toast.success("Payment was already verified successfully!");
      return;
    }

    // Only verify if we haven't verified this session before
    if (!hasVerified) {
      const verify = async () => {
        try {
          console.log("Starting payment verification for session:", sessionId);
          const result = await verifyPayment(sessionId);
          console.log("Payment verification result:", result);
          setVerificationResult(result);
          setHasVerified(true);

          // Cache the verification result to prevent duplicates
          localStorage.setItem(verifiedKey, JSON.stringify(result));

          // Reload credits after successful payment
          await loadCredits();
          console.log("Credits reloaded after successful payment");

          if (result.alreadyProcessed) {
            toast.success("Payment was already processed successfully!");
          } else {
            toast.success(
              "Payment successful! Credits have been added to your account."
            );
          }
        } catch (error: any) {
          console.error("Payment verification failed:", error);
          // Check if it's an authentication error
          if (error?.response?.status === 401) {
            setError("Authentication required. Please sign in again.");
          } else {
            setError("Payment verification failed");
          }
          toast.error("Payment verification failed");
        } finally {
          setIsVerifying(false);
        }
      };

      verify();
    }
  }, [searchParams, verifyPayment, hasVerified]);

  if (isVerifying) {
    return (
      <div className="main-content flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-green-950/20 dark:to-blue-950/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 mx-auto mb-4"
          >
            <Loader2 className="w-12 h-12 text-green-600" />
          </motion.div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Verifying Payment
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we confirm your payment...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-red-950/20 dark:to-pink-950/20 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error}. Please contact support if you were charged.
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild variant="outline">
                  <Link href="/support">Contact Support</Link>
                </Button>
                <Button asChild>
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="main-content flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-green-950/20 dark:to-blue-950/20 p-4">
      {/* Background Confetti Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-green-400 rounded-full opacity-70"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-10%`,
            }}
            animate={{
              y: ["0vh", "110vh"],
              rotate: [0, 360],
              opacity: [0.7, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="text-center overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center"
            >
              <CheckCircle className="w-8 h-8" />
            </motion.div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="opacity-90">
              Your purchase has been completed successfully
            </p>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Payment Details */}
            {verificationResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-green-700 dark:text-green-300">
                      Credits Added to Your Account
                    </span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 text-center">
                    You can now use your credits to create amazing manga
                    content!
                  </p>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <span className="font-medium text-green-600 dark:text-green-400 capitalize">
                      {verificationResult.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaction Type:</span>
                    <span className="font-medium capitalize">
                      {verificationResult.type?.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <Button
                asChild
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Link href="/manga-flow">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Creating
                </Link>
              </Button>

              <div className="flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/credits">View Credits</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs text-gray-500 dark:text-gray-400 pt-4 border-t"
            >
              A receipt has been sent to your email address.
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="main-content flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center p-8">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Loading...
              </h2>
            </CardContent>
          </Card>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
