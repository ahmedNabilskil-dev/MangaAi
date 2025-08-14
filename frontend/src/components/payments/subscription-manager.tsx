"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreditStore } from "@/stores/credit-store";
import {
  Plan,
  usePaymentStore,
  type Subscription,
} from "@/stores/payment-store";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  CreditCard,
  Crown,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function SubscriptionManager() {
  const {
    subscription,
    plans,
    loadSubscription,
    loadPlans,
    cancelSubscription,
    changeSubscriptionPlan,
    canSubscribeToPlan,
    subscriptionLoading,
    plansLoading,
  } = usePaymentStore();

  const { credits, dailyCreditsUsed } = useCreditStore();

  const [showPlanChangeDialog, setShowPlanChangeDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [planChangeLoading, setPlanChangeLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [eligibilityCheck, setEligibilityCheck] = useState<any>(null);

  useEffect(() => {
    loadSubscription();
    loadPlans();
  }, [loadSubscription, loadPlans]);

  // Helper functions to work with Stripe subscription format
  const getSubscriptionPlanId = (subscription: Subscription | null) => {
    return subscription?.metadata?.planId || "";
  };

  const getCurrentPeriodStart = (subscription: Subscription | null) => {
    console.log("getCurrentPeriodStart called with:", subscription);
    if (
      !subscription ||
      typeof subscription.current_period_start !== "number"
    ) {
      console.log("No valid current_period_start found");
      return null;
    }
    return new Date(subscription.current_period_start * 1000).toISOString();
  };

  const getCurrentPeriodEnd = (subscription: Subscription | null) => {
    if (!subscription || typeof subscription.current_period_end !== "number") {
      console.log("No valid current_period_end found");
      return null;
    }
    return new Date(subscription.current_period_end * 1000).toISOString();
  };

  const currentPlan = subscription
    ? plans.find((plan) => plan.id === getSubscriptionPlanId(subscription))
    : null;
  const subscriptionPlans = plans.filter((plan) => plan.type !== "one_time");

  const handlePlanChange = async (newPlan: Plan) => {
    try {
      console.log("handlePlanChange called with:", {
        newPlan: newPlan.name,
        currentSubscription: subscription,
        currentPlanId: getSubscriptionPlanId(subscription),
        newPlanId: newPlan.id,
      });

      // For existing subscribers, skip eligibility check and go straight to plan change
      if (subscription && subscription.status === "active") {
        console.log(
          "User has active subscription, proceeding with plan change"
        );

        // Check if it's the same plan
        if (getSubscriptionPlanId(subscription) === newPlan.id) {
          toast.error("You're already subscribed to this plan");
          return;
        }

        // For different plans, show the change dialog directly
        setSelectedPlan(newPlan);
        setShowPlanChangeDialog(true);
        return;
      }

      console.log("No active subscription found, checking eligibility");

      // For new subscribers, check eligibility
      const eligibility = await canSubscribeToPlan(newPlan.id);
      setEligibilityCheck(eligibility);

      if (!eligibility.canSubscribe) {
        toast.error(eligibility.reason || "Cannot change to this plan");
        return;
      }

      setSelectedPlan(newPlan);
      setShowPlanChangeDialog(true);
    } catch (error) {
      console.error("Error checking plan eligibility:", error);
      toast.error("Failed to check plan eligibility");
    }
  };

  const confirmPlanChange = async () => {
    if (!selectedPlan) return;

    setPlanChangeLoading(true);
    try {
      const result = await changeSubscriptionPlan(selectedPlan.id);

      toast.success(
        `Successfully changed to ${selectedPlan.name}! ${
          result.creditAdjustment > 0
            ? `+${result.creditAdjustment} credits added`
            : result.creditAdjustment < 0
            ? `${Math.abs(result.creditAdjustment)} credits adjusted`
            : "Credits unchanged"
        }`
      );

      setShowPlanChangeDialog(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error("Error changing plan:", error);
      toast.error("Failed to change subscription plan");
    } finally {
      setPlanChangeLoading(false);
    }
  };

  const handleCancelSubscription = async (immediate: boolean) => {
    setCancelLoading(true);
    try {
      await cancelSubscription(!immediate);

      toast.success(
        immediate
          ? "Subscription cancelled immediately. You'll keep access until the end of your billing period."
          : "Subscription will be cancelled at the end of your billing period."
      );

      setShowCancelDialog(false);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Failed to cancel subscription");
    } finally {
      setCancelLoading(false);
    }
  };

  const getPlanComparison = (newPlan: Plan) => {
    if (!currentPlan) return null;

    const priceDiff = newPlan.priceCents - currentPlan.priceCents;
    const creditDiff =
      (newPlan.monthlyCredits || 0) - (currentPlan.monthlyCredits || 0);

    return {
      isUpgrade: priceDiff > 0,
      isDowngrade: priceDiff < 0,
      priceDiff: Math.abs(priceDiff),
      creditDiff: Math.abs(creditDiff),
      creditIncrease: creditDiff > 0,
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getBadgeColor = (plan: Plan) => {
    if (plan.isPopular) return "bg-purple-500";
    if (plan.type === "yearly") return "bg-green-500";
    return "bg-blue-500";
  };

  if (subscriptionLoading || plansLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <CardTitle>Loading Subscription...</CardTitle>
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            No Active Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You don't have an active subscription. Choose a plan to get started.
          </p>
          <Button onClick={() => (window.location.href = "/payment/plans")}>
            View Plans
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Current Subscription Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Crown className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Your Subscription
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your current plan and billing
              </p>
            </div>
          </div>
          <Badge
            className={`px-3 py-1 ${
              subscription.status === "active"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
            }`}
          >
            {subscription.status.toUpperCase()}
          </Badge>
        </div>

        {currentPlan && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Plan
              </p>
              <p className="font-semibold text-lg">{currentPlan.name}</p>
            </div>
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Price
              </p>
              <p className="font-semibold text-lg">
                ${(currentPlan.priceCents / 100).toFixed(2)}
                <span className="text-sm font-normal">
                  /{currentPlan.type === "monthly" ? "mo" : "yr"}
                </span>
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Credits
              </p>
              <p className="font-semibold text-lg">
                {currentPlan.monthlyCredits}/month
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Usage
              </p>
              <p className="font-semibold text-lg">{credits} total credits</p>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Billing Period
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getCurrentPeriodStart(subscription) &&
                getCurrentPeriodEnd(subscription) ? (
                  <>
                    {formatDate(getCurrentPeriodStart(subscription)!)} -{" "}
                    {formatDate(getCurrentPeriodEnd(subscription)!)}
                  </>
                ) : (
                  "No active subscription"
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Next billing
              </p>
              <p className="font-medium">
                {getCurrentPeriodEnd(subscription)
                  ? formatDate(getCurrentPeriodEnd(subscription)!)
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {subscription.cancel_at_period_end && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Subscription Ending
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Your subscription will end on{" "}
                  {getCurrentPeriodEnd(subscription)
                    ? formatDate(getCurrentPeriodEnd(subscription)!)
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowCancelDialog(true)}
            className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel Subscription
          </Button>
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Change Your Plan
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Switch to a different plan with immediate effect and prorated
            billing. All changes take effect immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {subscriptionPlans.map((plan) => {
            const comparison = getPlanComparison(plan);
            const isCurrent = plan.id === getSubscriptionPlanId(subscription);

            return (
              <motion.div
                key={plan.id}
                whileHover={{ scale: isCurrent ? 1 : 1.02 }}
                transition={{ duration: 0.2 }}
                className={`relative rounded-xl border-2 p-8 ${
                  isCurrent
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer hover:shadow-lg transition-all"
                }`}
                onClick={() => !isCurrent && handlePlanChange(plan)}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 text-sm font-medium">
                      ⭐ Most Popular
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                    {plan.name}
                  </h4>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                      ${(plan.priceCents / 100).toFixed(0)}
                    </span>
                    <span className="text-lg text-gray-600 dark:text-gray-400 ml-2">
                      /{plan.type === "monthly" ? "month" : "year"}
                    </span>
                  </div>

                  {comparison && !isCurrent && (
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                        comparison.isUpgrade
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                      }`}
                    >
                      {comparison.isUpgrade ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {comparison.isUpgrade ? "Upgrade" : "Downgrade"}:{" "}
                      {comparison.creditIncrease ? "+" : "-"}
                      {comparison.creditDiff} credits
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="font-semibold text-lg">
                      {plan.monthlyCredits} credits per month
                    </span>
                  </div>

                  {plan.features?.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 text-gray-600 dark:text-gray-400"
                    >
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {isCurrent ? (
                  <div className="text-center">
                    <Badge className="w-full justify-center py-3 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-lg font-medium">
                      ✓ Current Plan
                    </Badge>
                  </div>
                ) : (
                  <Button
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlanChange(plan);
                    }}
                  >
                    {comparison?.isUpgrade
                      ? "🚀 Upgrade to This Plan"
                      : "🔄 Switch to This Plan"}
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Plan Change Confirmation Dialog */}
      <Dialog
        open={showPlanChangeDialog}
        onOpenChange={setShowPlanChangeDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              You're about to change your subscription plan. This will take
              effect immediately.
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && currentPlan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="font-medium">Current Plan</p>
                  <div className="border rounded p-3 bg-gray-50 dark:bg-gray-800">
                    <p className="font-semibold">{currentPlan.name}</p>
                    <p className="text-sm text-gray-600">
                      ${(currentPlan.priceCents / 100).toFixed(2)}/
                      {currentPlan.type}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">New Plan</p>
                  <div className="border rounded p-3 bg-blue-50 dark:bg-blue-900/20">
                    <p className="font-semibold">{selectedPlan.name}</p>
                    <p className="text-sm text-gray-600">
                      ${(selectedPlan.priceCents / 100).toFixed(2)}/
                      {selectedPlan.type}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  What happens next:
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Your plan changes immediately</li>
                  <li>• You'll be charged/credited the prorated difference</li>
                  <li>
                    • Your credit allowance adjusts for the remaining billing
                    period
                  </li>
                  <li>• Next billing cycle will be at the new plan rate</li>
                </ul>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowPlanChangeDialog(false)}
                  disabled={planChangeLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmPlanChange}
                  disabled={planChangeLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {planChangeLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Confirm Change
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Choose how you'd like to cancel your subscription.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => handleCancelSubscription(false)}
                disabled={cancelLoading}
              >
                <div className="text-left">
                  <p className="font-medium">Cancel at period end</p>
                  <p className="text-sm text-gray-600">
                    Keep access until{" "}
                    {getCurrentPeriodEnd(subscription)
                      ? formatDate(getCurrentPeriodEnd(subscription)!)
                      : "N/A"}
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => handleCancelSubscription(true)}
                disabled={cancelLoading}
              >
                <div className="text-left">
                  <p className="font-medium">Cancel immediately</p>
                  <p className="text-sm text-red-600">
                    End subscription now (keep access until period end)
                  </p>
                </div>
              </Button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 border rounded-lg p-4">
              <h4 className="font-medium mb-2">Cancellation Policy</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• You'll keep all unused credits until your period ends</li>
                <li>• No refunds for partial months</li>
                <li>• You can reactivate anytime before period end</li>
                <li>• All data and projects remain accessible</li>
              </ul>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                disabled={cancelLoading}
              >
                Keep Subscription
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
