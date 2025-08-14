"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { CreditPaymentDashboard } from "@/components/credits/credit-payment-dashboard";

export default function CreditsPage() {
  return (
    <AuthGuard>
      <div className="main-content bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <CreditPaymentDashboard defaultTab="overview" />
        </div>
      </div>
    </AuthGuard>
  );
}
