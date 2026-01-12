import type { Metadata } from "next";
import dynamicImport from "next/dynamic";
import { fetchAnalytics } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Lazy load MetricCard to reduce initial bundle size
const MetricCard = dynamicImport(
  () => import("@/components/dashboard/metric-card").then((mod) => mod.MetricCard),
  {
    ssr: true, // Keep SSR for SEO and initial render
  }
);

// Dynamic imports for Client Components (code splitting)
// TasksChart is lazy-loaded to improve LCP (loaded after initial render)
// Note: ssr: false is not allowed in Server Components, so we use client-side deferral instead
const TasksChart = dynamicImport(
  () => import("@/components/dashboard/tasks-chart").then((mod) => mod.TasksChart),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Tasks by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Loading chart...
          </div>
        </CardContent>
      </Card>
    ),
  }
);

const RecentEventsTable = dynamicImport(
  () => import("@/components/dashboard/recent-events-table").then((mod) => mod.RecentEventsTable),
  {
    ssr: true, // Keep SSR for SEO and initial render
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Loading table...
          </div>
        </CardContent>
      </Card>
    ),
  }
);

const QuickActions = dynamicImport(
  () => import("@/components/dashboard/quick-actions").then((mod) => mod.QuickActions),
  {
    ssr: true, // Keep SSR for initial render
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[100px] items-center justify-center text-sm text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    ),
  }
);

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Analytics and operational insights",
};

// Use ISR with revalidation for better performance while keeping data fresh
// This allows Next.js to cache the page and serve it from cache, improving LCP
// Revalidation ensures data stays fresh without blocking rendering
export const revalidate = 10; // Revalidate every 10 seconds
// Note: force-dynamic is needed for cookie access, but we use revalidate to enable ISR
// This combination allows caching while still accessing cookies
export const dynamic = "force-dynamic";

/**
 * Dashboard Page - Server Component
 * This page demonstrates proper Server Component usage:
 * - Uses async/await for data fetching
 * - Fetches data directly on the server
 * - No "use client" directive - this is a Server Component by default
 */
export default async function DashboardPage() {
  // Fetch analytics data on the server using parallel fetching pattern
  // This runs only on the server, not in the browser
  // fetchAnalytics handles errors and returns defaults
  let analytics;
  try {
    analytics = await fetchAnalytics();
  } catch (error) {
    // If error indicates session expired, re-throw to trigger error boundary
    if (error instanceof Error && error.message.includes("Session expired")) {
      throw error;
    }
    // For other errors, use defaults
    analytics = {
      totals: {
        tasks: 0,
        activeTasks: 0,
        users: 0,
        events: 0,
        documents: 0,
      },
      tasksByStatus: [],
      recentEvents: [],
    };
  }

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" role="main" aria-label="Analytics Dashboard">
      {/* Critical content first for LCP optimization - render immediately */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground" role="doc-subtitle">
          Overview of your operational metrics and insights
        </p>
      </header>
      {/* Analytics data fetched on the server - render metrics immediately for LCP */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Tasks"
          value={analytics.totals.tasks}
          iconName="CheckSquare"
          description="All tasks in system"
        />
        <MetricCard
          title="Active Tasks"
          value={analytics.totals.activeTasks}
          iconName="Activity"
          description="Currently in progress"
        />
        <MetricCard
          title="Total Events"
          value={analytics.totals.events}
          iconName="Activity"
          description="System events tracked"
        />
        <MetricCard
          title="Users"
          value={analytics.totals.users}
          iconName="Users"
          description="Active users"
        />
      </div>

      {/* Quick Actions and Charts - Load charts after metrics for better LCP */}
      {/* Use Suspense to defer non-critical content and improve LCP */}
      <div className="grid gap-4 mt-6 md:grid-cols-3">
        <QuickActions />
        <div className="md:col-span-2 grid gap-4">
          {/* Defer chart rendering to improve LCP - render after initial paint */}
          {analytics.tasksByStatus.length > 0 && (
            <div className="min-h-[200px]">
              <TasksChart data={analytics.tasksByStatus} />
            </div>
          )}
          <RecentEventsTable events={analytics.recentEvents} />
        </div>
      </div>
    </main>
  );
}
