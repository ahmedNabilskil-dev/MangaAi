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
import { useAuth } from "@/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";
import { CREDIT_PACKAGES, getPricePerCredit } from "@/lib/credit-packages";
import getStripe from "@/lib/stripe";
import { Coins, Crown, Star, Zap } from "lucide-react";
import { useState } from "react";

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Icon mapping helper
const getIcon = (iconName?: string) => {
  switch (iconName) {
    case "coins":
      return <Coins className="w-6 h-6" />;
    case "zap":
      return <Zap className="w-6 h-6" />;
    case "star":
      return <Star className="w-6 h-6" />;
    case "crown":
      return <Crown className="w-6 h-6" />;
    default:
      return <Coins className="w-6 h-6" />;
  }
};

export function CreditPurchaseModal({
  isOpen,
  onClose,
}: CreditPurchaseModalProps) {
  const { user } = useAuth();
  const { refreshCredits } = useCredits();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handlePurchase = async (packageData: (typeof CREDIT_PACKAGES)[0]) => {
    if (!user?.id) return;

    setIsLoading(true);
    setSelectedPackage(packageData.id);

    try {
      // Create Stripe checkout session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          type: "credits",
          packageId: packageData.id,
        }),
      });

      const { sessionId, url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        // Fallback: use Stripe.js
        const stripe = await getStripe();
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({ sessionId });
          if (error) {
            throw new Error(error.message);
          }
        } else {
          throw new Error("Stripe is not available");
        }
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
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Buy Credits
          </DialogTitle>
          <p className="text-center text-gray-600">
            Choose a credit package to power your manga creation
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative cursor-pointer transition-all hover:scale-105 ${
                pkg.popular
                  ? "ring-2 ring-blue-500 shadow-lg"
                  : "hover:shadow-md"
              }`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  Most Popular
                </Badge>
              )}

              <CardContent className="p-6 text-center">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${pkg.color} flex items-center justify-center text-white`}
                >
                  {getIcon(pkg.iconName)}
                </div>

                <h3 className="text-xl font-bold mb-2">
                  {pkg.credits.toLocaleString()} Credits
                </h3>

                {pkg.bonus > 0 && (
                  <Badge variant="secondary" className="mb-3">
                    +{pkg.bonus} Bonus
                  </Badge>
                )}

                <div className="mb-4">
                  <span className="text-3xl font-bold">${pkg.price}</span>
                  <p className="text-sm text-gray-500">
                    ${getPricePerCredit(pkg).toFixed(3)} per credit
                  </p>
                </div>

                <Button
                  onClick={() => handlePurchase(pkg)}
                  disabled={isLoading}
                  className={`w-full ${
                    selectedPackage === pkg.id
                      ? "bg-gray-400 cursor-not-allowed"
                      : pkg.popular
                      ? "bg-blue-600 hover:bg-blue-700"
                      : ""
                  }`}
                >
                  {selectedPackage === pkg.id ? "Processing..." : "Purchase"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">What can you do with credits?</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Generate text content (1 credit per 1000 tokens)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Create images (5 credits each)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>HD images (10 credits each)</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Secure payment processing by Stripe. Credits never expire.
        </p>
      </DialogContent>
    </Dialog>
  );
}
