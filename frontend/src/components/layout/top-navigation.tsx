"use client";

import { CreditDisplay } from "@/components/credits/credit-display";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { motion } from "framer-motion";
import {
  BookOpen,
  CreditCard,
  Home,
  LogOut,
  Menu,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { UserProfile } from "../auth/user-profile";

const navigation: Array<{
  name: string;
  href: string;
  icon: any;
  requireAuth?: boolean;
}> = [
  // Navigation items moved to user profile dropdown
];

const publicNavigation: Array<{
  name: string;
  href: string;
  icon: any;
  requireAuth?: boolean;
}> = [
  // Empty for home page - no need for redundant home link
];

export function TopNavigation() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter navigation based on auth state
  const currentNavigation = isAuthenticated ? navigation : publicNavigation;

  // Helper functions for mobile navigation (same as user profile)
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success("Signed out successfully");
      setMobileMenuOpen(false);
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const getUserDisplayName = () => {
    if (!user) return "User";
    if (user.name) {
      return user.name.length > 20 ? `${user.name.slice(0, 20)}...` : user.name;
    }
    const emailName = user.email.split("@")[0];
    return emailName.length > 15 ? `${emailName.slice(0, 15)}...` : emailName;
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 w-full border-b border-gray-200/20 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2"
            >
              <Link
                href="/"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Manga AI
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden md:flex items-center space-x-8"
            >
              <NavigationMenu>
                <NavigationMenuList>
                  {currentNavigation.map((item) => (
                    <NavigationMenuItem key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50",
                          pathname === item.href
                            ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50"
                            : "text-gray-600 dark:text-gray-300"
                        )}
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.name}
                      </Link>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </motion.div>

            {/* Right Side - Credits & User Profile */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4"
            >
              {isAuthenticated ? (
                <>
                  {/* Credits Display - Desktop */}
                  <div className="hidden sm:block">
                    <CreditDisplay compact={true} showActions={false} />
                  </div>

                  {/* User Profile - Desktop Only */}
                  <div className="hidden md:block">
                    <UserProfile />
                  </div>
                </>
              ) : (
                <>
                  {/* Single Auth Button - Desktop Only */}
                  <div className="hidden md:block">
                    <Button
                      asChild
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                    >
                      <Link href="/auth/signin">
                        <User className="w-4 h-4 mr-2" />
                        Get Started
                      </Link>
                    </Button>
                  </div>
                </>
              )}

              {/* Mobile Menu */}
              <div className="md:hidden">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-80 p-0 overflow-hidden"
                  >
                    <div className="flex flex-col h-full max-h-[100vh]">
                      {/* Header Section - Same as User Profile */}
                      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white flex-shrink-0">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-20">
                          {[...Array(10)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1 h-1 bg-white rounded-full"
                              style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                              }}
                              animate={{
                                scale: [0, 1, 0],
                                opacity: [0, 1, 0],
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: Math.random() * 3,
                              }}
                            />
                          ))}
                        </div>

                        {isAuthenticated && user ? (
                          <div className="relative flex items-center gap-4">
                            <Avatar className="w-16 h-16 ring-4 ring-white/30 flex-shrink-0">
                              <AvatarImage
                                src={user.avatar_url}
                                alt={user.name || user.email}
                              />
                              <AvatarFallback className="text-lg font-bold bg-white/20 text-white">
                                {getInitials(user.name, user.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg truncate">
                                {user.name || "User"}
                              </h3>
                              <p className="text-blue-100 text-sm truncate">
                                {user.email}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 flex-shrink-0">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Creator
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="relative flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg">Manga AI</h3>
                              <p className="text-blue-100 text-sm">
                                Get started to create amazing manga
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Credits Section - Only for authenticated users */}
                      {isAuthenticated && user && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Zap className="w-4 h-4 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                                  Available Credits
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  Renews daily
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {user.credits}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                credits
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Scrollable Menu Items */}
                      <div className="flex-1 overflow-y-auto min-h-0">
                        <div className="p-4 space-y-2">
                          {isAuthenticated ? (
                            <>
                              {/* Navigation Section */}
                              <div className="space-y-1">
                                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Navigation
                                </h3>

                                {/* Home Link */}
                                <Link href="/" className="block">
                                  <div
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${
                                      pathname === "/"
                                        ? "bg-indigo-50 dark:bg-indigo-950/50"
                                        : ""
                                    }`}
                                  >
                                    <div
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                        pathname === "/"
                                          ? "bg-indigo-100 dark:bg-indigo-900/30"
                                          : "bg-gray-100 dark:bg-gray-800"
                                      }`}
                                    >
                                      <Home
                                        className={`w-4 h-4 ${
                                          pathname === "/"
                                            ? "text-indigo-600 dark:text-indigo-400"
                                            : "text-gray-600 dark:text-gray-400"
                                        }`}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className={`font-medium text-sm truncate ${
                                          pathname === "/"
                                            ? "text-indigo-600 dark:text-indigo-400"
                                            : "text-gray-900 dark:text-gray-100"
                                        }`}
                                      >
                                        Home
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        Return to main page
                                      </p>
                                    </div>
                                  </div>
                                </Link>

                                {/* Projects Link */}
                                <Link href="/projects" className="block">
                                  <div
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${
                                      pathname === "/projects"
                                        ? "bg-blue-50 dark:bg-blue-950/50"
                                        : ""
                                    }`}
                                  >
                                    <div
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                        pathname === "/projects"
                                          ? "bg-blue-100 dark:bg-blue-900/30"
                                          : "bg-gray-100 dark:bg-gray-800"
                                      }`}
                                    >
                                      <BookOpen
                                        className={`w-4 h-4 ${
                                          pathname === "/projects"
                                            ? "text-blue-600 dark:text-blue-400"
                                            : "text-gray-600 dark:text-gray-400"
                                        }`}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className={`font-medium text-sm truncate ${
                                          pathname === "/projects"
                                            ? "text-blue-600 dark:text-blue-400"
                                            : "text-gray-900 dark:text-gray-100"
                                        }`}
                                      >
                                        My Projects
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        View and manage your manga
                                      </p>
                                    </div>
                                  </div>
                                </Link>

                                {/* Credits Link */}
                                <Link href="/credits" className="block">
                                  <div
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${
                                      pathname === "/credits"
                                        ? "bg-green-50 dark:bg-green-950/50"
                                        : ""
                                    }`}
                                  >
                                    <div
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                        pathname === "/credits"
                                          ? "bg-green-100 dark:bg-green-900/30"
                                          : "bg-gray-100 dark:bg-gray-800"
                                      }`}
                                    >
                                      <CreditCard
                                        className={`w-4 h-4 ${
                                          pathname === "/credits"
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-gray-600 dark:text-gray-400"
                                        }`}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className={`font-medium text-sm truncate ${
                                          pathname === "/credits"
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-gray-900 dark:text-gray-100"
                                        }`}
                                      >
                                        Credits & Billing
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        Manage your credits and subscription
                                      </p>
                                    </div>
                                  </div>
                                </Link>
                              </div>

                              <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                              {/* Sign Out */}
                              <div
                                onClick={handleSignOut}
                                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer text-red-600 dark:text-red-400"
                              >
                                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    Sign Out
                                  </p>
                                  <p className="text-xs text-red-500 dark:text-red-400 truncate">
                                    Log out of your account
                                  </p>
                                </div>
                              </div>
                            </>
                          ) : (
                            /* Guest Navigation */
                            <div className="space-y-4">
                              <Button
                                asChild
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              >
                                <Link
                                  href="/auth/signin"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  <User className="w-4 h-4 mr-2" />
                                  Get Started
                                </Link>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>
    </>
  );
}
