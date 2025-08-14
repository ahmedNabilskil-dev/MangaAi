"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";
import { motion } from "framer-motion";
import {
  BookOpen,
  Crown,
  Lock,
  Palette,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFeatures?: boolean;
}

export function AuthGuard({
  children,
  fallback,
  showFeatures = true,
}: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Redirect to signin if not authenticated and not loading
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 mx-auto mb-4"
          >
            <Sparkles className="w-12 h-12 text-blue-600" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 dark:text-gray-400 font-medium"
          >
            Loading your manga universe...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Show authentication required page if not authenticated
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/10 dark:bg-white/5"
              style={{
                width: Math.random() * 300 + 50,
                height: Math.random() * 300 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-lg"
        >
          <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl">
            <CardHeader className="text-center pb-4">
              {/* Logo/Icon */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                <Sparkles className="w-10 h-10 text-white relative z-10" />

                {/* Floating sparkles around logo */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Welcome to Manga AI
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Create stunning manga stories with the power of AI
                </p>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Features Grid */}
              {showFeatures && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-2 gap-4 mb-6"
                >
                  <FeatureCard
                    icon={<Palette className="w-5 h-5" />}
                    title="AI Art Generation"
                    description="Create manga panels"
                    color="from-blue-500 to-cyan-500"
                    delay={0.1}
                  />
                  <FeatureCard
                    icon={<BookOpen className="w-5 h-5" />}
                    title="Story Creation"
                    description="Interactive storytelling"
                    color="from-purple-500 to-pink-500"
                    delay={0.2}
                  />
                  <FeatureCard
                    icon={<Users className="w-5 h-5" />}
                    title="Character Dev"
                    description="Rich character creation"
                    color="from-green-500 to-emerald-500"
                    delay={0.3}
                  />
                  <FeatureCard
                    icon={<Crown className="w-5 h-5" />}
                    title="Pro Templates"
                    description="Professional layouts"
                    color="from-yellow-500 to-orange-500"
                    delay={0.4}
                  />
                </motion.div>
              )}

              {/* Sign In Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  asChild
                  className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <Link href="/auth/signin">
                    <Zap className="w-5 h-5 mr-2" />
                    Start Creating - It's Free!
                  </Link>
                </Button>
              </motion.div>

              {/* Free Tier Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center space-y-2"
              >
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Start with 10 free credits daily</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  No credit card required • Cancel anytime
                </p>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Lock className="w-3 h-3" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Zap className="w-3 h-3" />
                  <span>Fast</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Sparkles className="w-3 h-3" />
                  <span>AI-Powered</span>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
}

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay: number;
}

function FeatureCard({
  icon,
  title,
  description,
  color,
  delay,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 group cursor-default"
    >
      <div
        className={`inline-flex p-2 rounded-lg bg-gradient-to-r ${color} text-white mb-2 group-hover:scale-110 transition-transform duration-200`}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
        {title}
      </h3>
      <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
    </motion.div>
  );
}
