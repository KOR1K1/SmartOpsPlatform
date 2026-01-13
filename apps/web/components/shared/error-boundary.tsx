"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { logger } from "@/lib/logger";
import Link from "next/link";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  context?: string;
}

/**
 * Reusable error boundary component for consistent error handling
 * Provides logging, user-friendly UI, and recovery options
 */
export function ErrorBoundary({
  error,
  reset,
  title = "Something went wrong",
  message,
  showHomeButton = false,
  context,
}: ErrorBoundaryProps) {
  useEffect(() => {
    // Log error to monitoring service
    logger.error(
      message || "An error occurred",
      error,
      context || "ErrorBoundary"
    );
  }, [error, message, context]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            {message || "An unexpected error occurred. Please try again."}
          </p>
          {error.message && (
            <details className="text-left">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground mb-2">
                Error details
              </summary>
              <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded break-all">
                {error.message}
              </p>
            </details>
          )}
          <div className="flex flex-col gap-2">
            <Button onClick={reset} className="w-full" variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Button>
            {showHomeButton && (
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
