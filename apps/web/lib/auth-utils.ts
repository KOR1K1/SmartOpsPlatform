/**
 * Server-side authentication utilities
 * For token verification and user data retrieval in Server Components
 */

"use server";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

/**
 * Get JWT secret from environment
 */
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || "your-secret-key-change-in-production";
  return new TextEncoder().encode(secret);
}

/**
 * Verify and decode JWT token
 */
async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify<JwtPayload>(token, secret);
    return payload;
  } catch {
    return null;
  }
}

/**
 * Get current authenticated user from token
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return null;
  }

  const payload = await verifyToken(accessToken);
  if (!payload) {
    return null;
  }

  return {
    id: payload.sub,
    email: payload.email,
    name: "", // Name not in token, will need to fetch from user cookie or API
    role: payload.role,
  };
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: string): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(roles: string[]): Promise<boolean> {
  const user = await getCurrentUser();
  return user ? roles.includes(user.role) : false;
}
