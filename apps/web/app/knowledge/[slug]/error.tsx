"use client";

import { ErrorBoundary } from "@/components/shared/error-boundary";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function KnowledgeDocumentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/knowledge" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Knowledge Hub
          </Link>
        </Button>
      </div>

      <ErrorBoundary
        error={error}
        reset={reset}
        title="Document Error"
        message="Failed to load the knowledge document. Please try again."
        showHomeButton={true}
        context="KnowledgeDocumentError"
      />
    </div>
  );
}
