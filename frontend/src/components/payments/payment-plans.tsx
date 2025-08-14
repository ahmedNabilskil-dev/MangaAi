"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePaymentStore, type Plan } from "@/stores/payment-store";
import { motion } from "framer-motion";
import { Check, Crown, Gift, Loader2, Sparkles, Star, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PaymentPlansProps {
  onPlanSelect?: (plan: Plan) => void;
  defaultTab?: "one_time" | "monthly" | "yearly";
}

export function PaymentPlans({
  onPlanSelect,
  defaultTab = "one_time",
}: PaymentPlansProps) {
  const {
    plans,
    plansLoading,
    checkoutLoading,
    createCheckoutSession,
    canSubscribeToPlan,
    subscription,
  } = usePaymentStore();

  const [activeTab, setActiveTab] = useState<"one_time" | "monthly" | "yearly">(
    defaultTab
  );
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  const filteredPlans = plans.filter((plan) => plan.type === activeTab);

  const handlePlanPurchase = async (plan: Plan) => {
    if (onPlanSelect) {
      onPlanSelect(plan);
      return;
    }

    setProcessingPlanId(plan.id);
    try {
      // Check if this is a subscription plan and if user can subscribe
      if (plan.type !== "one_time") {
        const eligibility = await canSubscribeToPlan(plan.id);

        if (!eligibility.canSubscribe) {
          if (eligibility.reason?.includes("existing subscription")) {
            toast.error(
              "You already have an active subscription. Please manage your subscription in the Subscription tab to change plans.",
              { duration: 5000 }
            );
          } else if (eligibility.reason?.includes("Already subscribed")) {
            toast.error("You're already subscribed to this plan.");
          } else {
            toast.error(eligibility.reason || "Cannot subscribe to this plan");
          }
          return;
        }
      }

      console.log("Creating checkout session for plan:", plan.id);
      const result = await createCheckoutSession(plan.id);
      console.log("Checkout session created:", result);

      if (result.url) {
        console.log("Redirecting to:", result.url);
        window.location.href = result.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to start checkout process");
    } finally {
      setProcessingPlanId(null);
    }
  };

  const getPlanIcon = (iconName?: string) => {
    switch (iconName) {
      case "crown":
        return <Crown className="w-6 h-6" />;
      case "star":
        return <Star className="w-6 h-6" />;
      case "gift":
        return <Gift className="w-6 h-6" />;
      case "zap":
        return <Zap className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(price / 100);
  };

  const getTabLabel = (type: string) => {
    switch (type) {
      case "one_time":
        return "Buy Credits";
      case "monthly":
        return "Monthly Plans";
      case "yearly":
        return "Yearly Plans";
      default:
        return type;
    }
  };

  const getTabDescription = (type: string) => {
    switch (type) {
      case "one_time":
        return "One-time credit purchases";
      case "monthly":
        return "Monthly subscription with credits";
      case "yearly":
        return "Yearly subscription with savings";
      default:
        return "";
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Choose Your Plan
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Get the perfect amount of credits for your creative projects
        </p>
      </motion.div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "one_time" | "monthly" | "yearly")
        }
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="one_time" className="text-sm">
            Buy Credits
          </TabsTrigger>
          <TabsTrigger value="monthly" className="text-sm">
            Monthly
          </TabsTrigger>
          <TabsTrigger value="yearly" className="text-sm">
            Yearly
          </TabsTrigger>
        </TabsList>

        {["one_time", "monthly", "yearly"].map((tabType) => (
          <TabsContent key={tabType} value={tabType} className="space-y-6">
            {/* Tab Description */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <p className="text-gray-600 dark:text-gray-400">
                {getTabDescription(tabType)}
              </p>
            </motion.div>

            {/* Plans Grid */}
            {plansLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="relative">
                    <CardHeader>
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-16 w-full mb-4" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : filteredPlans.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No plans available
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {tabType === "one_time"
                    ? "Credit packages will be available soon"
                    : "Subscription plans will be available soon"}
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlans.map((plan, index) => {
                  const isCurrentPlan =
                    subscription?.metadata?.planId === plan.id &&
                    subscription?.status === "active";

                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className={`relative h-full ${
                          plan.isPopular && !isCurrentPlan
                            ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900"
                            : isCurrentPlan
                            ? "ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-900 bg-green-50 dark:bg-green-900/10"
                            : ""
                        }`}
                      >
                        {/* Current Plan Badge */}
                        {isCurrentPlan ? (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-green-600 text-white px-3 py-1">
                              <Crown className="w-3 h-3 mr-1" />
                              Current Plan
                            </Badge>
                          </div>
                        ) : plan.isPopular ? (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1">
                              <Star className="w-3 h-3 mr-1" />
                              Most Popular
                            </Badge>
                          </div>
                        ) : null}

                        <CardHeader className="text-center">
                          {/* Plan Icon */}
                          <div
                            className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center ${
                              plan.color
                                ? `bg-gradient-to-br ${plan.color}`
                                : "bg-gradient-to-br from-blue-500 to-purple-600"
                            } text-white mb-4`}
                          >
                            {getPlanIcon(plan.iconName)}
                          </div>

                          <CardTitle className="text-xl">{plan.name}</CardTitle>

                          {plan.description && (
                            <CardDescription>
                              {plan.description}
                            </CardDescription>
                          )}

                          {/* Price */}
                          <div className="pt-4">
                            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                              {formatPrice(plan.priceCents, plan.currency)}
                            </div>
                            {plan.type !== "one_time" && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                per {plan.type === "monthly" ? "month" : "year"}
                              </div>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* Credits Info */}
                          <div className="text-center space-y-2">
                            {plan.type === "one_time" && (
                              <>
                                <div className="flex items-center justify-center gap-2">
                                  <Sparkles className="w-4 h-4 text-yellow-500" />
                                  <span className="font-medium">
                                    {plan.credits} credits
                                  </span>
                                </div>
                                {plan.bonus && plan.bonus > 0 && (
                                  <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                                    <Gift className="w-4 h-4" />
                                    <span className="text-sm">
                                      +{plan.bonus} bonus credits
                                    </span>
                                  </div>
                                )}
                              </>
                            )}

                            {plan.type !== "one_time" &&
                              plan.monthlyCredits && (
                                <div className="flex items-center justify-center gap-2">
                                  <Sparkles className="w-4 h-4 text-yellow-500" />
                                  <span className="font-medium">
                                    {plan.monthlyCredits} credits/month
                                  </span>
                                </div>
                              )}
                          </div>

                          {/* Features */}
                          {plan.features && plan.features.length > 0 && (
                            <div className="space-y-2">
                              {plan.features.map((feature, featureIndex) => (
                                <div
                                  key={featureIndex}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>

                        <CardFooter>
                          <Button
                            onClick={() => handlePlanPurchase(plan)}
                            disabled={
                              checkoutLoading ||
                              processingPlanId === plan.id ||
                              isCurrentPlan
                            }
                            className={`w-full ${
                              plan.isPopular && !isCurrentPlan
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                : isCurrentPlan
                                ? "bg-green-600 hover:bg-green-700"
                                : ""
                            }`}
                          >
                            {processingPlanId === plan.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : isCurrentPlan ? (
                              <>
                                <Crown className="w-4 h-4 mr-2" />
                                Current Plan
                              </>
                            ) : (
                              <>
                                {plan.type === "one_time"
                                  ? "Buy Now"
                                  : "Subscribe"}
                              </>
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
