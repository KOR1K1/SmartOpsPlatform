"use client";

import { ErrorBoundary } from "@/components/shared/error-boundary";

export default function ProfileError({
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
      title="Profile Error"
      message="Failed to load your profile. Please try again."
      showHomeButton={true}
      context="ProfileError"
    />
  );
}
