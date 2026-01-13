import { PageHeaderSkeleton, DocumentCardSkeleton } from "@/components/shared/loading-skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function KnowledgeLoading() {
  return (
    <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" role="main" aria-label="Knowledge Hub">
      <PageHeaderSkeleton />
      {/* Search skeleton */}
      <div className="mb-6">
        <div className="h-10 w-full max-w-md animate-pulse rounded-md bg-muted" />
      </div>
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar skeleton */}
        <aside className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-8 w-full animate-pulse rounded bg-muted" />
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
        {/* Main content skeleton */}
        <div className="lg:col-span-3 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <DocumentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
