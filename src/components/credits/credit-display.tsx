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
import { Clock, Coins, Plus, Zap } from "lucide-react";
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

  const dailyRemaining = getDailyCreditsRemaining();
  const dailyFreeCredits = 10; // Fixed daily credits for all users
  const dailyProgress =
    dailyFreeCredits > 0 ? (dailyCreditsUsed / dailyFreeCredits) * 100 : 0;

  if (!user) return null;

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-white hover:bg-gray-50 border-gray-200"
          >
            <Coins className="w-4 h-4 text-yellow-600" />
            <span className="font-semibold">{credits.toLocaleString()}</span>
            {dailyRemaining > 0 && (
              <Badge variant="secondary" className="text-xs">
                +{dailyRemaining}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-80">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Credit Balance</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshCredits}
                className="text-xs"
              >
                Refresh
              </Button>
            </div>

            {/* Main Credits */}
            <div className="text-center py-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coins className="w-6 h-6 text-yellow-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {credits.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-600">Available Credits</p>
            </div>

            {/* Current Plan */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3" />
                <span className="font-medium">Credits Plan</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                ACTIVE
              </Badge>
            </div>

            {/* Daily Credits */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Daily Free Credits</span>
                </div>
                <span className="font-medium">
                  {dailyRemaining} / {dailyFreeCredits}
                </span>
              </div>
              <Progress value={Math.min(dailyProgress, 100)} className="h-2" />
              <p className="text-xs text-gray-500">Resets every 24 hours</p>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t">
              <Button
                onClick={() => setShowPurchaseModal(true)}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Buy Credits
              </Button>
            </div>

            {/* Credit Usage Info */}
            <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
              <p>• Text generation: 1 credit per 1000 tokens</p>
              <p>• Image generation: 5 credits per image</p>
              <p>• HD image generation: 10 credits per image</p>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Modals */}
      <CreditPurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
      />
    </>
  );
}
