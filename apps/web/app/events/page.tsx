import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Feed",
  description: "Real-time operational events and system events",
};

export default function EventsPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Event Feed</h2>
        <p className="text-muted-foreground">
          Monitor real-time events and system activities
        </p>
      </div>
      {/* Event feed components will be implemented later */}
      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">Event feed will be displayed here</p>
      </div>
    </div>
  );
}
