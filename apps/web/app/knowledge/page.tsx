import type { Metadata } from "next";
import dynamicImport from "next/dynamic";
import { fetchKnowledgeCategories } from "@/lib/api";
import { Suspense } from "react";
import { PageHeaderSkeleton } from "@/components/shared/loading-skeleton";

// Lazy load KnowledgeClient to reduce initial bundle size
const KnowledgeClient = dynamicImport(() => import("./knowledge-client").then((mod) => ({ default: mod.KnowledgeClient })), {
  ssr: true,
  loading: () => (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeaderSkeleton />
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="lg:col-span-3 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Knowledge Hub",
  description: "Access and manage your knowledge base documents",
};

// Force dynamic rendering to ensure cookies are available
export const dynamic = "force-dynamic";

/**
 * Knowledge Page - Server Component
 * Fetches categories on the server and passes them to Client Component
 */
type Category = {
  id: number;
  title: string;
  slug: string;
};

export default async function KnowledgePage() {
  // Fetch categories on the server using fetchApi (handles auth automatically)
  let categories: Category[];
  try {
    categories = await fetchKnowledgeCategories();
  } catch (error) {
    // If error indicates session expired, re-throw to trigger error boundary
    if (error instanceof Error && error.message.includes("Session expired")) {
      throw error;
    }
    // For other errors, use empty array
    categories = [];
  }

  return (
    <Suspense fallback={
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeaderSkeleton />
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="h-64 animate-pulse rounded-lg bg-muted" />
          </div>
          <div className="lg:col-span-3 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    }>
      <KnowledgeClient initialCategories={categories} />
    </Suspense>
  );
}
