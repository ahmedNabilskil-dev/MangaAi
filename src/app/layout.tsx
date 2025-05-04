
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ReactQueryProvider } from '@/components/providers/react-query-provider'; // Create this provider
import { ThemeProvider } from '@/components/providers/theme-provider'; // Import the ThemeProvider


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MangaVerse AI',
  description: 'Create manga stories with AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning> {/* suppressHydrationWarning is recommended by next-themes */}
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
              {children}
              <Toaster />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
