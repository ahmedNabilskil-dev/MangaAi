// src/components/credits/credit-display.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";
import { Coins, Plus, RefreshCw, Sparkles, Timer, Zap } from "lucide-react";
import { useState } from "react";
import { CreditPurchaseModal } from "./credit-purchase-modal";

export function CreditDisplay() {
  const { user } = useAuth();
  const {
    credits,
    dailyCreditsUsed,
    getDailyCreditsRemaining,
    refreshCredits,
  } = useCredits();

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const dailyRemaining = getDailyCreditsRemaining();
  const dailyFreeCredits = 10; // Fixed daily credits for all users
  const dailyProgress =
    dailyFreeCredits > 0 ? (dailyCreditsUsed / dailyFreeCredits) * 100 : 0;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshCredits();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (!user) return null;

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-gray-900 hover:bg-gray-800 border-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <Coins className="w-4 h-4 text-amber-400" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              </div>
              <span className="font-bold text-white">
                {credits.toLocaleString()}
              </span>
              {dailyRemaining > 0 && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs px-2 py-0.5">
                  +{dailyRemaining}
                </Badge>
              )}
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="w-96 bg-gray-900 border-gray-700 shadow-2xl backdrop-blur-xl"
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-xl text-white">Credit Balance</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>

            {/* Main Credits Display */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 rounded-xl"></div>
              <div className="relative text-center py-6 px-4 border border-amber-500/20 rounded-xl backdrop-blur-sm">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="relative">
                    <Coins className="w-8 h-8 text-amber-400" />
                    <div className="absolute inset-0 w-8 h-8 bg-amber-400/20 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-4xl font-black text-white tracking-tight">
                    {credits.toLocaleString()}
                  </span>
                </div>
                <p className="text-amber-200 font-medium">Available Credits</p>
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-semibold text-white">Premium Plan</span>
                  <p className="text-xs text-gray-400">Active subscription</p>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-semibold">
                ACTIVE
              </Badge>
            </div>

            {/* Daily Credits Progress */}
            <div className="space-y-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-blue-400" />
                  <span className="text-white font-medium">
                    Daily Free Credits
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white text-lg">
                    {dailyRemaining}
                  </span>
                  <span className="text-gray-400 text-sm">
                    /{dailyFreeCredits}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Progress
                  value={Math.min(dailyProgress, 100)}
                  className="h-3 bg-gray-700"
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Resets in 8h 32m</span>
                  <span className="text-blue-400 font-medium">
                    {Math.round(100 - dailyProgress)}% remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={() => setShowPurchaseModal(true)}
              className="w-full h-12 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 text-gray-900 font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] border-0"
            >
              <Plus className="w-5 h-5 mr-2" />
              Buy More Credits
            </Button>

            {/* Usage Information */}
            <div className="space-y-3 pt-4 border-t border-gray-700/50">
              <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Credit Usage Guide
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300">Text Generation</span>
                  <Badge
                    variant="outline"
                    className="text-blue-400 border-blue-400/30"
                  >
                    1 credit/1k tokens
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300">Standard Images</span>
                  <Badge
                    variant="outline"
                    className="text-emerald-400 border-emerald-400/30"
                  >
                    5 credits each
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300">HD Images</span>
                  <Badge
                    variant="outline"
                    className="text-purple-400 border-purple-400/30"
                  >
                    10 credits each
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Purchase Modal */}
      <CreditPurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
      />
    </>
  );
}
