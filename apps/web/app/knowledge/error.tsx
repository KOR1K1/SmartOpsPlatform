"use client";

import { ErrorBoundary } from "@/components/shared/error-boundary";

export default function KnowledgeError({
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
      title="Knowledge Hub Error"
      message="Failed to load knowledge documents. Please try again."
      showHomeButton={true}
      context="KnowledgeError"
    />
  );
}
