"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  redirectTo?: string;
}

/**
 * Protected Route Component
 * Wraps content that requires authentication and/or specific roles
 */
export function ProtectedRoute({
  children,
  roles,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Check authentication
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // Check role authorization
      if (roles && roles.length > 0 && !roles.includes(user.role)) {
        router.push("/dashboard"); // Redirect to dashboard if no permission
        return;
      }
    }
  }, [user, isLoading, roles, redirectTo, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  // Don't render if role check fails
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
