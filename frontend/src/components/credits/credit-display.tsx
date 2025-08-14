"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth-store";
import { useCreditStore } from "@/stores/credit-store";
import { motion } from "framer-motion";
import { Gift, Plus, RefreshCw, Sparkles, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface CreditDisplayProps {
  onPurchaseClick?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

export function CreditDisplay({
  onPurchaseClick,
  showActions = true,
  compact = false,
}: CreditDisplayProps) {
  const { isAuthenticated } = useAuthStore();
  const {
    credits,
    dailyCreditsUsed,
    isLoading,
    loadCredits,
    getDailyCreditsRemaining,
  } = useCreditStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadCredits();
    }
  }, [isAuthenticated, loadCredits]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCredits();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const dailyRemaining = getDailyCreditsRemaining();
  const creditStatus = credits > 50 ? "high" : credits > 10 ? "medium" : "low";

  if (!isAuthenticated) {
    return null;
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800">
            <Sparkles className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
              {credits}
            </span>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950/30 dark:to-blue-950/30 border-0 shadow-lg">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Your Credits
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI generation power
              </p>
            </div>
          </div>

          {showActions && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          )}
        </div>

        {/* Credit Stats */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Credits */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-1"
          >
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-2xl font-bold ${
                    creditStatus === "high"
                      ? "text-green-600 dark:text-green-400"
                      : creditStatus === "medium"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {credits}
                </span>
                <Sparkles className="w-4 h-4 text-gray-400" />
              </div>
            )}
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Total credits
            </p>
          </motion.div>

          {/* Daily Remaining */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-1"
          >
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {dailyRemaining}
                </span>
                <Gift className="w-4 h-4 text-gray-400" />
              </div>
            )}
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Daily free left
            </p>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Daily usage</span>
            <span>{dailyCreditsUsed}/10</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(dailyCreditsUsed / 10) * 100}%` }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            />
          </div>
        </motion.div>

        {/* Credit Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`p-3 rounded-lg border ${
            creditStatus === "high"
              ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
              : creditStatus === "medium"
              ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800"
              : "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {creditStatus === "high" ? (
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : creditStatus === "medium" ? (
              <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            ) : (
              <Plus className="w-4 h-4 text-red-600 dark:text-red-400" />
            )}
            <span
              className={`text-sm font-medium ${
                creditStatus === "high"
                  ? "text-green-700 dark:text-green-300"
                  : creditStatus === "medium"
                  ? "text-yellow-700 dark:text-yellow-300"
                  : "text-red-700 dark:text-red-300"
              }`}
            >
              {creditStatus === "high"
                ? "You're all set!"
                : creditStatus === "medium"
                ? "Running low"
                : "Need more credits"}
            </span>
          </div>
          <p
            className={`text-xs mt-1 ${
              creditStatus === "high"
                ? "text-green-600 dark:text-green-400"
                : creditStatus === "medium"
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {creditStatus === "high"
              ? "Plenty of credits for your projects"
              : creditStatus === "medium"
              ? "Consider getting more credits soon"
              : "Get more credits to continue creating"}
          </p>
        </motion.div>

        {/* Actions */}
        {showActions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-2"
          >
            <Button
              onClick={onPurchaseClick}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Get Credits
            </Button>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
