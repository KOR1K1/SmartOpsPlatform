import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DocumentLoading() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="h-9 w-32 animate-pulse rounded bg-muted" />
      </div>
      <header className="mb-8">
        <div className="h-6 w-24 animate-pulse rounded bg-muted mb-4" />
        <div className="h-10 w-full animate-pulse rounded bg-muted mb-4" />
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
      </header>
      <Card>
        <CardHeader>
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
