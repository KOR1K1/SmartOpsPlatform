import { Card, CardHeader } from "@/components/ui/card";

export default function EventsLoading() {
  return (
    <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" role="main" aria-label="Event Feed">
      <header className="mb-8">
        <div className="h-9 w-64 animate-pulse rounded bg-muted mb-2" />
        <div className="h-5 w-96 animate-pulse rounded bg-muted" />
      </header>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="h-5 w-20 animate-pulse rounded bg-muted mb-2" />
                  <div className="h-6 w-full animate-pulse rounded bg-muted" />
                </div>
                <div className="h-4 w-24 animate-pulse rounded bg-muted ml-4" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </main>
  );
}
