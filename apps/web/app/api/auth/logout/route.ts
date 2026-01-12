import { NextResponse } from "next/server";
import { clearAuthTokens } from "@/lib/auth-cookies";

/**
 * Logout API route
 * Clears authentication cookies
 */
export async function POST() {
  await clearAuthTokens();

  return NextResponse.json({ success: true });
}
