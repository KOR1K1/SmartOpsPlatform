import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge Hub",
  description: "Browse and search knowledge documents",
};

export default function KnowledgePage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Knowledge Hub</h2>
        <p className="text-muted-foreground">
          Access and manage your knowledge base documents
        </p>
      </div>
      {/* Knowledge hub components will be implemented later */}
      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">Knowledge documents will be displayed here</p>
      </div>
    </div>
  );
}
