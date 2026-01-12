import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth-cookies";
import { getCurrentUser } from "@/lib/auth-utils";

/**
 * Get current authenticated user
 * Returns 200 with { authenticated: false } for unauthenticated users
 * to avoid browser logging 401 errors
 */
export async function GET() {
  try {
    // First try to get user from cookie (includes name)
    const userFromCookie = await getUserFromCookie();

    if (userFromCookie) {
      return NextResponse.json(userFromCookie);
    }

    // Fallback to token-based user (without name)
    const user = await getCurrentUser();

    if (!user) {
      // Return 200 with authenticated: false instead of 401
      // This prevents browser from logging it as an error
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get user" },
      { status: 500 }
    );
  }
}
