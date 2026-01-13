"use client";

import { ErrorBoundary } from "@/components/shared/error-boundary";

export default function Error({
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
      title="Something went wrong!"
      message="An unexpected error occurred. Please try again."
      showHomeButton={true}
      context="GlobalError"
    />
  );
}
