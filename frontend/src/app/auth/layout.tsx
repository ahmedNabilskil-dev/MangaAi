import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Manga AI",
  description:
    "Sign in or create an account to start creating amazing manga with AI",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {children}
    </div>
  );
}
