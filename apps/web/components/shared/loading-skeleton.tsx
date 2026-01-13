import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Reusable loading skeleton components
 * Provides consistent loading states across the application
 */

export function PageHeaderSkeleton() {
  return (
    <header className="mb-8">
      <div className="h-9 w-64 animate-pulse rounded bg-muted mb-2" />
      <div className="h-5 w-96 animate-pulse rounded bg-muted" />
    </header>
  );
}

export function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-16 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

export function EventCardSkeleton() {
  return (
    <Card>
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
  );
}

export function DocumentCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="h-5 w-24 animate-pulse rounded bg-muted mb-2" />
            <div className="h-6 w-full animate-pulse rounded bg-muted mb-2" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        </div>
      </CardHeader>
    </Card>
  );
}

export function TableRowSkeleton() {
  return (
    <tr>
      <td className="py-4">
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
      </td>
      <td className="py-4">
        <div className="h-4 w-full max-w-md animate-pulse rounded bg-muted" />
      </td>
      <td className="py-4">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      </td>
      <td className="py-4">
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
      </td>
      <td className="py-4">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </td>
    </tr>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export function LoadingText({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4">
        <Spinner />
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
