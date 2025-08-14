"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/auth-store";
import { useCreditStore } from "@/stores/credit-store";
import { usePaymentStore } from "@/stores/payment-store";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Calendar,
  CreditCard,
  Crown,
  History,
  Plus,
  Settings,
  Sparkles,
  Store,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PaymentHistory } from "../payments/payment-history";
import { PaymentPlans } from "../payments/payment-plans";
import { SubscriptionManager } from "../payments/subscription-manager";
import { CreditDisplay } from "./credit-display";

// Overview Components
function OverviewSubscriptionCard({
  onManageClick,
}: {
  onManageClick: () => void;
}) {
  const { subscription, subscriptionLoading, plans } = usePaymentStore();

  // Helper to get plan details from subscription
  const getCurrentPlan = () => {
    if (!subscription || !plans.length) return null;
    const planId = subscription.metadata?.planId;
    return plans.find((plan) => plan.id === planId);
  };

  const currentPlan = getCurrentPlan();

  if (subscriptionLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Crown className="w-5 h-5 text-yellow-500" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onManageClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Crown className="w-5 h-5 text-yellow-500" />
          Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {subscription ? (
          <>
            <div>
              <p className="font-semibold text-lg">Active Plan</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentPlan?.monthlyCredits || "Unlimited"} credits/month
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              {subscription.status.toUpperCase()}
            </Badge>
            <Button variant="outline" size="sm" className="w-full">
              Manage <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </>
        ) : (
          <>
            <div>
              <p className="font-medium text-gray-600 dark:text-gray-400">
                No active subscription
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Get unlimited credits
              </p>
            </div>
            <Button size="sm" className="w-full">
              View Plans <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function OverviewPurchaseCard({
  onViewPlansClick,
}: {
  onViewPlansClick: () => void;
}) {
  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-800/50"
      onClick={onViewPlansClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Plus className="w-5 h-5 text-blue-600" />
          Buy Credits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="font-semibold text-lg">One-time Purchase</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get credits instantly
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-600 dark:text-green-400 font-medium">
            Bonus credits available
          </span>
        </div>
        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
          View Plans <Store className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}

function OverviewActivityCard({
  onViewHistoryClick,
}: {
  onViewHistoryClick: () => void;
}) {
  const { paymentHistory, paymentHistoryLoading } = usePaymentStore();
  const recentPayments = paymentHistory.slice(0, 2);

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onViewHistoryClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="w-5 h-5 text-purple-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {paymentHistoryLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ) : recentPayments.length > 0 ? (
          <>
            <div className="space-y-2">
              {recentPayments.map((payment, index) => (
                <div key={index} className="text-sm">
                  <p className="font-medium">
                    ${(payment.amountCents / 100).toFixed(2)}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full">
              View All <History className="w-4 h-4 ml-1" />
            </Button>
          </>
        ) : (
          <>
            <div>
              <p className="font-medium text-gray-600 dark:text-gray-400">
                No recent activity
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Your payments will appear here
              </p>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              View History <History className="w-4 h-4 ml-1" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function OverviewRecentTransactions({
  onViewAllClick,
}: {
  onViewAllClick: () => void;
}) {
  const { transactions } = useCreditStore();
  const { paymentHistory } = usePaymentStore();
  const recentTransactions = transactions.slice(0, 5);

  if (recentTransactions.length === 0 && paymentHistory.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-600" />
          Recent Transactions
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onViewAllClick}>
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentTransactions.map((transaction, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
            >
              <div>
                <p className="font-medium text-sm">{transaction.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(transaction.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`font-semibold text-sm ${
                    transaction.amount > 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {transaction.amount > 0 ? "+" : ""}
                  {transaction.amount}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  credits
                </p>
              </div>
            </div>
          ))}

          {recentTransactions.length === 0 && (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent transactions</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface CreditPaymentDashboardProps {
  defaultTab?: "overview" | "plans" | "subscription" | "history";
  onClose?: () => void;
}

export function CreditPaymentDashboard({
  defaultTab = "overview",
  onClose,
}: CreditPaymentDashboardProps) {
  const { isAuthenticated } = useAuthStore();
  const { loadCredits, loadTransactions } = useCreditStore();
  const { loadPlans, loadSubscription, loadPaymentHistory } = usePaymentStore();

  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (isAuthenticated) {
      // Load all data
      loadCredits();
      loadTransactions();
      loadPlans();
      loadSubscription();
      loadPaymentHistory();
    }
  }, [
    isAuthenticated,
    loadCredits,
    loadTransactions,
    loadPlans,
    loadSubscription,
    loadPaymentHistory,
  ]);

  const handlePlanPurchase = () => {
    setActiveTab("plans");
  };

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <Sparkles className="w-4 h-4" />,
      description: "Credits & subscription overview",
    },
    {
      id: "plans",
      label: "Plans",
      icon: <Store className="w-4 h-4" />,
      description: "Purchase credits & subscriptions",
    },
    {
      id: "subscription",
      label: "Subscription",
      icon: <Settings className="w-4 h-4" />,
      description: "Manage your subscription",
    },
    {
      id: "history",
      label: "History",
      icon: <History className="w-4 h-4" />,
      description: "Payment & transaction history",
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <CreditCard className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Sign In Required
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please sign in to manage your credits and payments.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Credits & Billing
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your credits, subscriptions, and payment history
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as typeof defaultTab)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 mb-8">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 text-sm"
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content */}
        <TabsContent value="overview" className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Credit Display - Full Width */}
            <CreditDisplay
              onPurchaseClick={handlePlanPurchase}
              showActions={true}
              compact={false}
            />

            {/* Quick Stats & Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Subscription Status Card */}
              <OverviewSubscriptionCard
                onManageClick={() => setActiveTab("subscription")}
              />

              {/* Quick Purchase Card */}
              <OverviewPurchaseCard
                onViewPlansClick={() => setActiveTab("plans")}
              />

              {/* Recent Activity Card */}
              <OverviewActivityCard
                onViewHistoryClick={() => setActiveTab("history")}
              />
            </div>

            {/* Recent Transactions */}
            <OverviewRecentTransactions
              onViewAllClick={() => setActiveTab("history")}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PaymentPlans />
          </motion.div>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SubscriptionManager />
          </motion.div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PaymentHistory />
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
