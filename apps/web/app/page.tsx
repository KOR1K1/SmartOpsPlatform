import Link from "next/link";
import type { Metadata } from "next";

// Route segment config for performance optimization
export const dynamic = "force-static"; // Force static generation for home page

export const metadata: Metadata = {
  title: "Home",
  description: "SmartOps Platform - Operational analytics and knowledge management",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            SmartOps Platform
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Operational analytics, event management, and knowledge management
            platform
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/dashboard"
            className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/events"
            className="rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            View Events
          </Link>
          <Link
            href="/knowledge"
            className="rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Knowledge Hub
          </Link>
        </div>
      </main>
    </div>
  );
}
