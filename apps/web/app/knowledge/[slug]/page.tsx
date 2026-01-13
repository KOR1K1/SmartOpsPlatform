import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchKnowledgeDocumentBySlug } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, FileText, Tag } from "lucide-react";
import Link from "next/link";
import { formatDateLong, formatDateOnly } from "@/lib/date-utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const document = await fetchKnowledgeDocumentBySlug(slug);

  if (!document) {
    return {
      title: "Document Not Found",
    };
  }

  return {
    title: document.title,
    description: document.content.slice(0, 160),
  };
}

export default async function KnowledgeDocumentPage({ params }: Props) {
  const { slug } = await params;
  const document = await fetchKnowledgeDocumentBySlug(slug);

  if (!document) {
    notFound();
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8" role="main" aria-label="Knowledge Document">
      {/* Back button */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/knowledge" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Knowledge Hub
          </Link>
        </Button>
      </div>

      {/* Document header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {document.category?.title || "Uncategorized"}
          </Badge>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">{document.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <time dateTime={document.updatedAt}>
              Updated {formatDateLong(document.updatedAt)}
            </time>
          </div>
        </div>
      </header>

      {/* Document content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-foreground leading-relaxed">
              {document.content}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Document metadata */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Document Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Category:</span>{" "}
              <span>{document.category?.title || "Uncategorized"}</span>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Created:</span>{" "}
              <time dateTime={document.createdAt}>
                {formatDateOnly(document.createdAt)}
              </time>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Last Updated:</span>{" "}
              <time dateTime={document.updatedAt}>
                {formatDateOnly(document.updatedAt)}
              </time>
            </div>
          </CardContent>
        </Card>

        {document.versions && document.versions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Version History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {document.versions.map((version) => (
                  <div key={version.id} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Version {version.version}</span>
                      <time className="text-muted-foreground text-xs" dateTime={version.createdAt}>
                        {formatDateOnly(version.createdAt)}
                      </time>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
