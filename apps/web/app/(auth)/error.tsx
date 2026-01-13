"use client";

import { ErrorBoundary } from "@/components/shared/error-boundary";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorBoundary
      error={error}
      reset={reset}
      title="Authentication Error"
      message="An error occurred during authentication. Please try again."
      context="AuthError"
    />
  );
}
