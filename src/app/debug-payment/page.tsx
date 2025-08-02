// src/app/debug-payment/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

export default function DebugPaymentPage() {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkUserStatus = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch("/api/debug-user-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const result = await response.json();
      setDebugInfo(result);
    } catch (error) {
      console.error("Debug error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardContent className="p-8 text-center">
            Please sign in to debug your payment status.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={checkUserStatus} disabled={loading}>
            {loading ? "Loading..." : "Check My Status"}
          </Button>

          {debugInfo && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">User Profile:</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(debugInfo.user, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold text-lg">Recent Payments:</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(debugInfo.recentPayments, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold text-lg">Recent Transactions:</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(debugInfo.recentTransactions, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
