// src/components/credits/credit-purchase-modal.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { useCreditStore } from "@/stores/credit-store";
import { usePaymentStore, type Plan } from "@/stores/payment-store";
import {
  CheckCircle,
  Coins,
  Crown,
  Gift,
  Infinity,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Enhanced icon mapping with more variety
const getIcon = (iconName?: string) => {
  switch (iconName) {
    case "coins":
      return <Coins className="w-7 h-7" />;
    case "zap":
      return <Zap className="w-7 h-7" />;
    case "star":
      return <Star className="w-7 h-7" />;
    case "crown":
      return <Crown className="w-7 h-7" />;
    case "gift":
      return <Gift className="w-7 h-7" />;
    case "infinity":
      return <Infinity className="w-7 h-7" />;
    default:
      return <Coins className="w-7 h-7" />;
  }
};

// Enhanced color schemes for packages
const getColorScheme = (color?: string) => {
  switch (color) {
    case "from-blue-500 to-cyan-500":
      return {
        gradient: "from-blue-500 to-cyan-500",
        border: "border-blue-500/30",
        glow: "shadow-blue-500/25",
        button:
          "from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
      };
    case "from-purple-500 to-pink-500":
      return {
        gradient: "from-purple-500 to-pink-500",
        border: "border-purple-500/30",
        glow: "shadow-purple-500/25",
        button:
          "from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
      };
    case "from-emerald-500 to-teal-500":
      return {
        gradient: "from-emerald-500 to-teal-500",
        border: "border-emerald-500/30",
        glow: "shadow-emerald-500/25",
        button:
          "from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600",
      };
    case "from-amber-500 to-orange-500":
      return {
        gradient: "from-amber-500 to-orange-500",
        border: "border-amber-500/30",
        glow: "shadow-amber-500/25",
        button:
          "from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
      };
    default:
      return {
        gradient: "from-gray-500 to-gray-600",
        border: "border-gray-500/30",
        glow: "shadow-gray-500/25",
        button:
          "from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700",
      };
  }
};

// Helper function to calculate total credits (credits + bonus)
const getTotalCredits = (pkg: Plan): number => {
  return (pkg.credits || 0) + (pkg.bonus || 0);
};

// Helper function to calculate price per credit
const getPricePerCredit = (pkg: Plan): number => {
  const totalCredits = getTotalCredits(pkg);
  return totalCredits > 0 ? pkg.priceCents / totalCredits : 0;
};

export function CreditPurchaseModal({
  isOpen,
  onClose,
}: CreditPurchaseModalProps) {
  const { user } = useAuthStore();
  const { loadCredits } = useCreditStore();
  const { plans, loadPlans } = usePaymentStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  // Filter to get only one-time (credit package) plans
  const creditPackages = plans.filter((plan) => plan.type === "one_time");

  // Fetch credit packages from backend
  useEffect(() => {
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen, loadPlans]);

  const handlePurchase = async (packageData: Plan) => {
    if (!user?.id) return;

    setIsLoading(true);
    setSelectedPackage(packageData.id);

    try {
      // Create Stripe checkout session via backend
      const response = await apiRequest.post<{ url: string }>(
        "/payments/create-checkout-session",
        {
          planId: packageData.id,
          type: "credits",
          packageId: packageData.id,
        }
      );

      // Redirect to Stripe Checkout
      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      // You might want to show a toast notification here
      alert(`Payment failed: ${error.message}`);
    } finally {
      setIsLoading(false);
      setSelectedPackage(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] bg-gray-900 border-gray-700 text-white overflow-hidden">
        <DialogHeader className="pb-2">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <DialogTitle className="text-3xl font-black bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Buy Credits
              </DialogTitle>
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <p className="text-gray-400 text-lg">
              Supercharge your creativity with our premium credit packages
            </p>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-8">
            {/* Loading state */}
            {creditPackages.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-400">Loading credit packages...</div>
              </div>
            ) : (
              <>
                {/* Credit Packages Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {creditPackages.map((pkg: Plan) => {
                    const colors = getColorScheme(pkg.color);
                    return (
                      <Card
                        key={pkg.id}
                        className={`relative cursor-pointer transition-all duration-300 hover:scale-105 bg-gray-800/50 border-gray-700 hover:border-gray-600 backdrop-blur-sm ${
                          pkg.isPopular
                            ? `ring-2 ring-amber-400 ${colors.glow} shadow-xl`
                            : "hover:shadow-lg"
                        }`}
                      >
                        {pkg.isPopular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                            <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-gray-900 font-bold px-4 py-1 shadow-lg">
                              <Crown className="w-3 h-3 mr-1" />
                              MOST POPULAR
                            </Badge>
                          </div>
                        )}

                        <CardContent className="p-6 text-center relative overflow-hidden">
                          {/* Background Effect */}
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-5`}
                          ></div>

                          {/* Icon */}
                          <div
                            className={`relative w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white shadow-lg`}
                          >
                            {getIcon(pkg.iconName)}
                            <div
                              className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} rounded-2xl opacity-20 animate-pulse`}
                            ></div>
                          </div>

                          {/* Credits Amount */}
                          <h3 className="text-2xl font-black text-white mb-2">
                            {(pkg.credits || 0).toLocaleString()}
                            <span className="text-sm font-normal text-gray-400 ml-1">
                              Credits
                            </span>
                          </h3>

                          {/* Bonus Badge */}
                          {(pkg.bonus || 0) > 0 && (
                            <Badge className="mb-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                              <Gift className="w-3 h-3 mr-1" />+{pkg.bonus}{" "}
                              BONUS
                            </Badge>
                          )}

                          {/* Pricing */}
                          <div className="mb-6">
                            <div className="flex items-baseline justify-center gap-1">
                              <span className="text-4xl font-black text-white">
                                ${(pkg.priceCents / 100).toFixed(2)}
                              </span>
                              <span className="text-gray-400 text-sm">USD</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              ${(getPricePerCredit(pkg) / 100).toFixed(3)} per
                              credit
                            </p>
                            {pkg.isPopular && (
                              <div className="flex items-center justify-center gap-1 mt-2">
                                <TrendingUp className="w-3 h-3 text-emerald-400" />
                                <span className="text-xs text-emerald-400 font-medium">
                                  Best Value
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Purchase Button */}
                          <Button
                            onClick={() => handlePurchase(pkg)}
                            disabled={isLoading}
                            className={`w-full h-12 font-bold text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none ${
                              selectedPackage === pkg.id
                                ? "bg-gray-600 cursor-not-allowed"
                                : `bg-gradient-to-r ${colors.button}`
                            }`}
                          >
                            {selectedPackage === pkg.id ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Processing...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Purchase Now
                              </div>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Features Section */}
                <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
                  <h4 className="font-bold text-xl text-white mb-6 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    What You Can Create With Credits
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-blue-500/20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-white">
                            Text Generation
                          </h5>
                          <p className="text-xs text-gray-400">
                            AI-powered content
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-blue-400 border-blue-400/30 w-full justify-center"
                      >
                        1 credit per 1,000 tokens
                      </Badge>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-4 border border-emerald-500/20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                          <Star className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-white">
                            Standard Images
                          </h5>
                          <p className="text-xs text-gray-400">
                            High-quality visuals
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-emerald-400 border-emerald-400/30 w-full justify-center"
                      >
                        5 credits each
                      </Badge>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <Crown className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-white">
                            HD Images
                          </h5>
                          <p className="text-xs text-gray-400">
                            Premium quality
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-purple-400 border-purple-400/30 w-full justify-center"
                      >
                        10 credits each
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Trust & Security */}
                <div className="flex items-center justify-center gap-8 py-6 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-sm">Secure payments by Stripe</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">Credits never expire</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Infinity className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">Instant delivery</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
