"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator"; // Import Separator
import {
  ArrowLeft,
  LayoutGrid,
  LogOut,
  Settings,
  UserCircle,
} from "lucide-react";
import Link from "next/link"; // Import Link
import { ThemeToggle } from "./theme-toggle"; // Import the ThemeToggle component

interface TopBarProps {
  projectTitle: string;
}

export default function TopBar({ projectTitle }: TopBarProps) {
  // Placeholder function for navigation
  const handleBack = () => {
    window.history.back(); // Simple browser back
  };

  // Placeholder functions for menu actions
  const handleProfile = () => console.log("Profile clicked");
  const handleLogout = () => console.log("Logout clicked");

  return (
    <header className="h-14 px-4 flex items-center justify-between border-b border-border bg-card shrink-0 z-20">
      {/* Left Side */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          aria-label="Go back"
          className="h-9 w-9"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Separator orientation="vertical" className="h-6 mx-1" />{" "}
        {/* Add Separator */}
        <h1
          className="text-lg font-semibold text-foreground truncate"
          title={projectTitle}
        >
          {projectTitle}
        </h1>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Add Theme Toggle Button */}
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9 border">
                {/* Replace with actual user image if available */}
                <AvatarImage
                  src="/placeholder-avatar.jpg"
                  alt="User Avatar"
                  data-ai-hint="man smiling"
                />
                <AvatarFallback>
                  <UserCircle className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">User Name</p>
                <p className="text-xs leading-none text-muted-foreground">
                  user@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfile}>
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            {/* Link to Settings Page */}
            <Link href="/settings" passHref>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem>
              <LayoutGrid className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
