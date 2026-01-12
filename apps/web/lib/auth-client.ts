/**
 * Client-side authentication utilities
 * For client components that need to interact with auth state
 */

"use client";

/**
 * Client-side logout function
 * Calls server action to clear cookies and redirects to login
 */
export async function clientLogout() {
  try {
    // Call server action to clear cookies
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (response.ok) {
      window.location.href = "/login";
    }
  } catch (error) {
    console.error("Logout error:", error);
    // Force redirect even if API call fails
    window.location.href = "/login";
  }
}
