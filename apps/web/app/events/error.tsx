"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

export default function EventsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Events error", error, "EventsError");
  }, [error]);

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-md text-center">
        <h2 className="text-2xl font-semibold">Events Error</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Failed to load events. Please try again.
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
