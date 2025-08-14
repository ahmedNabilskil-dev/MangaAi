import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user is authenticated (checking for auth token in cookies)
  const authToken = request.cookies.get("auth-token")?.value;
  const isAuthenticated = !!authToken;

  // Define protected routes
  const protectedRoutes = [
    "/manga-flow",
    "/manga-reader",
    "/projects",
    "/credits",
    "/payment",
  ];

  // Define auth routes (should redirect if authenticated)
  const authRoutes = ["/auth/signin", "/auth/signup"];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.includes(pathname);

  // If user is not authenticated and trying to access protected route
  if (!isAuthenticated && isProtectedRoute) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If user is authenticated and trying to access auth routes
  if (isAuthenticated && isAuthRoute) {
    const fromParam = request.nextUrl.searchParams.get("from");
    const redirectUrl = fromParam || "/";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except static files and API routes
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|api).*)"],
};
