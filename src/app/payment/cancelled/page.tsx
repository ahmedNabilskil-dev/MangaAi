// src/app/payment/cancelled/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaymentCancelledPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">
            Payment Cancelled
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Your payment was cancelled. No charges were made to your account.
            You can try again anytime or continue using your free credits.
          </p>

          <div className="space-y-2 pt-4">
            <Button onClick={() => router.push("/")} className="w-full">
              Continue with Free Credits
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full"
            >
              Try Payment Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
