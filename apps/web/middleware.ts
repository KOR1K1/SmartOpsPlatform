import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { logger } from "./lib/logger";

// Protected routes that require authentication
const protectedRoutes = ["/dashboard", "/events", "/knowledge", "/profile"];

// Public auth routes (redirect to dashboard if already authenticated)
const publicAuthRoutes = ["/login", "/register"];

/**
 * Get JWT secret from environment variable
 * CRITICAL: Never use fallback values or NEXT_PUBLIC_* for secrets
 * JWT_SECRET must be set in environment variables
 * 
 * @throws Error if JWT_SECRET is not set
 */
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    // Fail fast with clear error message
    throw new Error(
      "JWT_SECRET environment variable is required. " +
      "Please set it in your .env file or environment variables. " +
      "This is a critical security requirement."
    );
  }
  
  // Validate secret is not empty
  if (secret.trim().length === 0) {
    throw new Error(
      "JWT_SECRET cannot be empty. Please provide a valid secret."
    );
  }
  
  // Warn if using default/weak secret (but don't fail in development)
  if (process.env.NODE_ENV === "production" && 
      (secret === "your-secret-key-change-in-production" || 
       secret.length < 32)) {
    logger.warn(
      "SECURITY WARNING: JWT_SECRET appears to be weak or default. Please use a strong, randomly generated secret (minimum 32 characters).",
      "Middleware",
      undefined,
      { secretLength: secret.length }
    );
  }
  
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if route is public auth route
  const isPublicAuthRoute = publicAuthRoutes.includes(pathname);

  // Get access token from cookies
  // Note: cookies() is async in Next.js 15+, but middleware runs synchronously
  // We need to read cookies from request headers directly
  const accessToken = request.cookies.get("accessToken")?.value;

  // Verify token if present
  let isAuthenticated = false;
  if (accessToken) {
    try {
      const secret = getJwtSecret();
      await jwtVerify(accessToken, secret);
      isAuthenticated = true;
    } catch {
      // Token invalid or expired
      isAuthenticated = false;
    }
  }

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing auth routes while authenticated
  if (isPublicAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
