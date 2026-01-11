import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge Hub",
  description: "Knowledge base and documentation",
};

export default function KnowledgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <h1 className="text-lg font-semibold">Knowledge Hub</h1>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
