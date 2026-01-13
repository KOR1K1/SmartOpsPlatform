import { PageHeaderSkeleton, EventCardSkeleton } from "@/components/shared/loading-skeleton";

export default function EventsLoading() {
  return (
    <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" role="main" aria-label="Event Feed">
      <PageHeaderSkeleton />
      {/* Search skeleton */}
      <div className="mb-6">
        <div className="h-10 w-full max-w-md animate-pulse rounded-md bg-muted" />
      </div>
      {/* Filters skeleton */}
      <div className="mb-6">
        <div className="h-10 w-64 animate-pulse rounded-md bg-muted" />
      </div>
      {/* Events list skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}
