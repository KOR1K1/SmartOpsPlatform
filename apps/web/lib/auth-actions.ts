/**
 * Server Actions for authentication
 * These can be called from Client Components
 */

"use server";

import { redirect } from "next/navigation";
import { setAuthTokens as setCookies, clearAuthTokens } from "./auth-cookies";

/**
 * Server Action: Set authentication tokens after login/register and redirect
 */
export async function setAuthTokensAction(
  accessToken: string,
  refreshToken: string,
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  },
  redirectTo: string = "/dashboard"
) {
  await setCookies(accessToken, refreshToken, user);
  redirect(redirectTo);
}

/**
 * Server Action: Clear authentication tokens (logout)
 */
export async function clearAuthTokensAction() {
  await clearAuthTokens();
}
