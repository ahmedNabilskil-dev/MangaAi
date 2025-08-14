import { ConditionalTopNavigation } from "@/components/layout/conditional-top-navigation";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ReactQueryProvider } from "@/components/providers/react-query-provider"; // Create this provider
import { ThemeProvider } from "@/components/providers/theme-provider"; // Import the ThemeProvider
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/lib/axios-config";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster as SonnerToaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MangaVerse AI",
  description: "Create manga stories with AI",
  icons: {
    icon: [
      {
        url: "/images/ai-magic-favicon.svg",
        sizes: "32x32",
        type: "image/svg+xml",
      },
      {
        url: "/images/ai-magic-favicon.svg",
        sizes: "16x16",
        type: "image/svg+xml",
      },
    ],
    apple: {
      url: "/images/ai-magic-favicon.svg",
      sizes: "180x180",
      type: "image/svg+xml",
    },
    shortcut: { url: "/images/ai-magic-favicon.svg", type: "image/svg+xml" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* suppressHydrationWarning is recommended by next-themes */}
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <AuthProvider>
              <TooltipProvider>
                <ConditionalTopNavigation />
                {children}
              </TooltipProvider>
            </AuthProvider>
            <Toaster />
            <SonnerToaster
              position="top-right"
              expand={true}
              richColors
              closeButton
            />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
