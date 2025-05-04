import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ReactQueryProvider } from '@/components/providers/react-query-provider'; // Create this provider


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
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ReactQueryProvider>
            {children}
            <Toaster />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
