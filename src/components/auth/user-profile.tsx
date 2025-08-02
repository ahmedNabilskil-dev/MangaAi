// src/components/auth/user-profile.tsx
"use client";

import { CreditDisplay } from "@/components/credits/credit-display";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { CreditCard, Crown, LogOut, Settings, User, Zap } from "lucide-react";

export function UserProfile() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case "premium":
      case "enterprise":
        return <Crown className="w-4 h-4" />;
      case "basic":
        return <Zap className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getPlanColor = (tier: string) => {
    switch (tier) {
      case "free":
        return "bg-gray-100 text-gray-800";
      case "basic":
        return "bg-blue-100 text-blue-800";
      case "premium":
        return "bg-purple-100 text-purple-800";
      case "enterprise":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex items-center gap-3">
      {/* Credit Display */}
      <CreditDisplay />

      {/* User Menu */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage
                src={user.avatar_url}
                alt={user.name || user.email}
              />
              <AvatarFallback className="text-xs">
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:block font-medium">
              {user.name || user.email.split("@")[0]}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-80">
          <div className="space-y-4">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={user.avatar_url}
                  alt={user.name || user.email}
                />
                <AvatarFallback>
                  {getInitials(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{user.name || "User"}</p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
            </div>

            {/* Plan Info */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="font-medium">Credits Plan</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                ACTIVE
              </Badge>
            </div>

            <Separator />

            {/* Menu Items */}
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-left"
                disabled
              >
                <User className="w-4 h-4" />
                Profile Settings
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-left"
                disabled
              >
                <CreditCard className="w-4 h-4" />
                Billing & Payments
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-left"
                disabled
              >
                <Settings className="w-4 h-4" />
                Preferences
              </Button>
            </div>

            <Separator />

            {/* Sign Out */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
