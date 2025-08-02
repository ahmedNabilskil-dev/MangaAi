// src/app/auth/auth-code-error/page.tsx
import Link from "next/link";

export default function AuthCodeError() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">
          Authentication Error
        </h1>
        <p className="text-muted-foreground mb-6">
          Sorry, we couldn't sign you in. Please try again.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
