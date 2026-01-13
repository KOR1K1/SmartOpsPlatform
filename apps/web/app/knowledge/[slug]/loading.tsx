import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DocumentLoading() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button skeleton */}
      <div className="mb-6">
        <div className="h-9 w-32 animate-pulse rounded bg-muted" />
      </div>
      {/* Header skeleton */}
      <header className="mb-8">
        <div className="h-6 w-24 animate-pulse rounded bg-muted mb-4" />
        <div className="h-10 w-full animate-pulse rounded bg-muted mb-4" />
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
      </header>
      {/* Content skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`h-4 animate-pulse rounded bg-muted ${
                  i === 2 ? "w-3/4" : i === 5 ? "w-5/6" : "w-full"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Metadata skeleton */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-40 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-4 w-full animate-pulse rounded bg-muted" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
