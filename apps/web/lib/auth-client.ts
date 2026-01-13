/**
 * Client-side authentication utilities
 * For client components that need to interact with auth state
 */

"use client";

import { logger } from "./logger";
import { fetchWithTimeout } from "./http";

/**
 * Client-side logout function
 * Calls server action to clear cookies and redirects to login
 */
export async function clientLogout() {
  try {
    // Call server action to clear cookies
    const response = await fetchWithTimeout("/api/auth/logout", {
      method: "POST",
    });

    if (response.ok) {
      window.location.href = "/login";
    }
  } catch (error) {
    logger.error("Logout error", error, "AuthClient");
    // Force redirect even if API call fails
    window.location.href = "/login";
  }
}
