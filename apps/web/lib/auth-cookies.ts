/**
 * Cookie management utilities for authentication tokens
 * Uses Next.js cookies API for secure httpOnly cookie handling
 */

"use server";

import { cookies } from "next/headers";

const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";
const USER_COOKIE = "user";

// Cookie options for secure storage
// secure: true only when HTTPS is actually used (not in local Docker)
// sameSite: "strict" provides better CSRF protection than "lax"
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // true in production (HTTPS)
  sameSite: "strict" as const, // Strict CSRF protection - cookies only sent in same-site context
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: "/",
};

/**
 * Set authentication tokens in cookies
 */
export async function setAuthTokens(
  accessToken: string,
  refreshToken: string,
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
  }
) {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, cookieOptions);
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 30, // 30 days for refresh token
  });

  if (user) {
    cookieStore.set(USER_COOKIE, JSON.stringify(user), cookieOptions);
  }
}

/**
 * Get access token from cookies
 */
export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null;
}

/**
 * Get refresh token from cookies
 */
export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value || null;
}

/**
 * Get user data from cookies
 */
export async function getUserFromCookie(): Promise<{
  id: number;
  email: string;
  name: string;
  role: string;
} | null> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(USER_COOKIE)?.value;

  if (!userCookie) {
    return null;
  }

  try {
    return JSON.parse(userCookie);
  } catch {
    return null;
  }
}

/**
 * Clear all authentication cookies (logout)
 */
export async function clearAuthTokens() {
  const cookieStore = await cookies();

  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete(USER_COOKIE);
}

/**
 * Update access token in cookies (for token refresh)
 */
export async function updateAccessToken(accessToken: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, cookieOptions);
}
