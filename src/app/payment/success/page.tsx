// src/app/payment/success/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCredits } from "@/hooks/use-credits";
import { CheckCircle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { refreshCredits } = useCredits();
  const [isLoading, setIsLoading] = useState(true);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      verifyPayment(sessionId);
    } else {
      setIsLoading(false);
      setError("No session ID provided");
    }
  }, [sessionId, refreshCredits]);

  const verifyPayment = async (sessionId: string) => {
    try {
      console.log("Verifying payment for session:", sessionId);

      const response = await fetch("/api/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

      const result = await response.json();
      console.log("Payment verification result:", result);

      if (!response.ok) {
        throw new Error(result.error || "Payment verification failed");
      }

      setPaymentResult(result);
      setVerificationComplete(true);

      // Refresh credits to update UI
      await refreshCredits();
    } catch (error: any) {
      console.error("Payment verification error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Processing Payment
            </h2>
            <p className="text-gray-600 text-center">
              Please wait while we verify your payment and update your
              account...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
            </div>
            <CardTitle className="text-2xl text-gray-900">
              Payment Verification Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => router.push("/")} className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Thank you for your purchase!
            {paymentResult?.creditsAdded
              ? ` ${paymentResult.creditsAdded} credits have been added to your account.`
              : " Your credit purchase has been processed successfully."}
          </p>

          {verificationComplete && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">
                ✅{" "}
                {paymentResult?.creditsAdded
                  ? `${paymentResult.creditsAdded} credits added to your account`
                  : "Purchase processed successfully"}
              </p>
              {paymentResult?.newBalance && (
                <p className="text-green-700 text-sm mt-1">
                  New credit balance: {paymentResult.newBalance}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2 pt-4">
            <Button onClick={() => router.push("/")} className="w-full">
              Start Creating
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/projects")}
              className="w-full"
            >
              View My Projects
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
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
