"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  CreditCard,
  Home,
  LogOut,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function UserProfile() {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  if (!user) return null;

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
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const getUserDisplayName = () => {
    if (user.name) {
      return user.name.length > 20 ? `${user.name.slice(0, 20)}...` : user.name;
    }
    const emailName = user.email.split("@")[0];
    return emailName.length > 15 ? `${emailName.slice(0, 15)}...` : emailName;
  };

  return (
    <div className="flex items-center gap-3">
      {/* User Menu */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-10 gap-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <Avatar className="w-7 h-7 ring-2 ring-gray-200 dark:ring-gray-700">
              <AvatarImage
                src={user.avatar_url}
                alt={user.name || user.email}
              />
              <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:block font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
              {getUserDisplayName()}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </motion.div>
          </Button>
        </DropdownMenuTrigger>

        <AnimatePresence>
          {isOpen && (
            <DropdownMenuContent
              align="end"
              className="w-80 max-h-[80vh] p-0 border-0 shadow-2xl bg-white dark:bg-gray-900 rounded-xl overflow-hidden"
              asChild
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col max-h-[80vh]"
              >
                {/* Header Section */}
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
                </div>

                {/* Credits Section */}
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

                {/* Scrollable Menu Items */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  <div className="p-2">
                    <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Navigation
                    </DropdownMenuLabel>

                    {/* Home Link */}
                    <Link href="/" className="block">
                      <DropdownMenuItem
                        className={`px-3 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg mx-1 my-1 transition-colors ${
                          pathname === "/"
                            ? "bg-indigo-50 dark:bg-indigo-950/50"
                            : ""
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex items-center gap-3 w-full min-w-0">
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
                      </DropdownMenuItem>
                    </Link>

                    {/* Projects Link */}
                    <Link href="/projects" className="block">
                      <DropdownMenuItem
                        className={`px-3 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg mx-1 my-1 transition-colors ${
                          pathname === "/projects"
                            ? "bg-blue-50 dark:bg-blue-950/50"
                            : ""
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex items-center gap-3 w-full min-w-0">
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
                      </DropdownMenuItem>
                    </Link>

                    {/* Credits Link */}
                    <Link href="/credits" className="block">
                      <DropdownMenuItem
                        className={`px-3 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg mx-1 my-1 transition-colors ${
                          pathname === "/credits"
                            ? "bg-green-50 dark:bg-green-950/50"
                            : ""
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex items-center gap-3 w-full min-w-0">
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
                      </DropdownMenuItem>
                    </Link>

                    <DropdownMenuSeparator className="my-2" />

                    {/* Sign Out */}
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="px-3 py-3 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg mx-1 my-1 transition-colors text-red-600 dark:text-red-400"
                    >
                      <div className="flex items-center gap-3 w-full min-w-0">
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
                    </DropdownMenuItem>
                  </div>
                </div>
              </motion.div>
            </DropdownMenuContent>
          )}
        </AnimatePresence>
      </DropdownMenu>
    </div>
  );
}
