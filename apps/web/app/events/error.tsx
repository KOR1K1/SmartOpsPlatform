"use client";

import { ErrorBoundary } from "@/components/shared/error-boundary";

export default function EventsError({
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
      title="Events Error"
      message="Failed to load events. Please try again."
      showHomeButton={true}
      context="EventsError"
    />
  );
}
