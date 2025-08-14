"use client";

import { useAuthStore } from "@/stores/auth-store";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { toast } from "sonner";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { initialize } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get("token");
        const refreshToken = searchParams.get("refresh");

        if (token && refreshToken) {
          // Store tokens
          localStorage.setItem("authToken", token);
          localStorage.setItem("refreshToken", refreshToken);

          // Initialize auth store to refresh user data
          await initialize();

          toast.success("Successfully signed in!");

          // Redirect to home
          router.replace("/");
        } else {
          // Handle error case
          const error = searchParams.get("error");
          if (error) {
            toast.error(`Authentication failed: ${error}`);
          } else {
            toast.error("Authentication failed");
          }
          router.replace("/");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        toast.error("Authentication failed");
        router.replace("/");
      }
    };

    handleCallback();
  }, [searchParams, router, initialize]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Completing sign in...
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
