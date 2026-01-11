import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Analytics and operational insights",
};

export default function DashboardPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your operational metrics and insights
        </p>
      </div>
      {/* Analytics components will be implemented later */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
          <p className="text-2xl font-bold">-</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Active Events</p>
          <p className="text-2xl font-bold">-</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Knowledge Docs</p>
          <p className="text-2xl font-bold">-</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Users</p>
          <p className="text-2xl font-bold">-</p>
        </div>
      </div>
    </div>
  );
}
