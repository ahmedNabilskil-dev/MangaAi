"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error") || "unknown";

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode.toLowerCase()) {
      case "configuration":
        return {
          title: "Configuration Error",
          description:
            "There's an issue with the authentication setup. Please try again later.",
        };
      case "accessdenied":
        return {
          title: "Access Denied",
          description: "You don't have permission to access this resource.",
        };
      case "verification":
        return {
          title: "Email Verification Required",
          description:
            "Please check your email and click the verification link.",
        };
      case "callback":
        return {
          title: "Authentication Failed",
          description: "Something went wrong during the sign-in process.",
        };
      case "oauthsignin":
        return {
          title: "OAuth Sign-in Error",
          description:
            "There was an error signing in with your social account.",
        };
      case "oauthcallback":
        return {
          title: "OAuth Callback Error",
          description: "The social sign-in process was interrupted.",
        };
      case "oauthcreateaccount":
        return {
          title: "Account Creation Failed",
          description:
            "Unable to create your account with the social provider.",
        };
      case "emailcreateaccount":
        return {
          title: "Email Account Creation Failed",
          description: "Unable to create your account with this email address.",
        };
      case "signin":
        return {
          title: "Sign-in Failed",
          description:
            "Unable to sign you in. Please check your credentials and try again.",
        };
      case "sessionrequired":
        return {
          title: "Session Required",
          description: "You need to be signed in to access this page.",
        };
      default:
        return {
          title: "Authentication Error",
          description: "An unexpected error occurred. Please try again.",
        };
    }
  };

  const { title, description } = getErrorMessage(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </motion.div>

        {/* Error Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
        </motion.div>

        {/* Error Code */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-8"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono">
            Error Code: {error}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <Button
            onClick={() => router.back()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold h-12 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Try Again
          </Button>

          <div className="flex gap-3">
            <Button
              asChild
              variant="outline"
              className="flex-1 h-12 border-2 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500"
            >
              <Link href="/auth/signin">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sign In
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="flex-1 h-12 border-2 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If you continue to experience issues, please{" "}
            <a
              href="mailto:support@mangaai.com"
              className="text-purple-600 dark:text-purple-400 hover:underline"
            >
              contact support
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
