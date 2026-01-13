"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchKnowledgeDocuments } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KnowledgeSearch } from "@/components/knowledge/knowledge-search";
import { CategoryFilter } from "@/components/knowledge/category-filter";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { PageHeaderSkeleton, DocumentCardSkeleton } from "@/components/shared/loading-skeleton";

type Document = {
  id: number;
  title: string;
  slug: string;
  content: string;
  categoryId: number;
  category?: {
    id: number;
    title: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
};

const ITEMS_PER_PAGE = 20;

type Category = {
  id: number;
  title: string;
  slug: string;
};

interface KnowledgeClientProps {
  initialCategories: Category[];
}

export function KnowledgeClient({ initialCategories }: KnowledgeClientProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories] = useState<Category[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Load documents when filters change (no debounce - only explicit search)
  useEffect(() => {
    async function loadDocuments() {
      try {
        setLoading(true);
        // Use larger limit when searching to find more results
        const limit = searchQuery ? 150 : ITEMS_PER_PAGE;
        const response = await fetchKnowledgeDocuments(
          limit,
          0,
          selectedCategoryId,
          searchQuery.trim() || undefined
        );
        setDocuments(response.data || []);
        // Show "Load More" when we got full page and no search is active
        setHasMore(response.pagination?.hasMore ?? false);
      } catch (error) {
        setDocuments([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }
    loadDocuments();
  }, [selectedCategoryId, searchQuery]); // Reload when category filter or explicit search changes

  async function loadMoreDocuments() {
    if (loadingMore || !hasMore || searchQuery) return; // Don't load more when searching
    
    try {
      setLoadingMore(true);
      const response = await fetchKnowledgeDocuments(
        ITEMS_PER_PAGE,
        documents.length,
        selectedCategoryId,
        searchQuery.trim() || undefined
      );
      if (response.data.length === 0) {
        setHasMore(false);
      } else {
        setDocuments((prev) => [...prev, ...response.data]);
        setHasMore(response.pagination?.hasMore ?? false);
      }
    } catch (error) {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }

  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Only filter by search query on client (category filtering is done on server)
    if (searchQuery) {
      const query = searchQuery.trim().toLowerCase();
      // Split query into words for better search
      const searchWords = query.split(/\s+/).filter(word => word.length > 0);
      
      // Check if query is a number (for ID search)
      const isNumericQuery = /^\d+$/.test(query.trim());
      const numericId = isNumericQuery ? parseInt(query.trim(), 10) : null;
      
      filtered = filtered.filter((doc) => {
        // Check ID if query is numeric
        if (numericId !== null && doc.id === numericId) {
          return true;
        }
        
        // Search by words (all words must be found - AND logic)
        if (searchWords.length > 0) {
          const searchableText = [
            doc.title,
            doc.content,
            doc.category?.title || "",
            doc.slug,
            doc.id.toString(), // Also search by ID as string
          ]
            .join(" ")
            .toLowerCase();
          
          // All words must be present
          return searchWords.every(word => searchableText.includes(word));
        }
        
        // Fallback to simple substring search
        const searchableText = [
          doc.title,
          doc.content,
          doc.category?.title || "",
          doc.slug,
          doc.id.toString(),
        ]
          .join(" ")
          .toLowerCase();
        
        return searchableText.includes(query);
      });
    }

    // Category filtering is done on server, but keep this for consistency
    // (in case selectedCategoryId changes but documents haven't reloaded yet)
    if (selectedCategoryId !== null) {
      filtered = filtered.filter((doc) => doc.categoryId === selectedCategoryId);
    }

    return filtered;
  }, [documents, searchQuery, selectedCategoryId]);

  const recentDocuments = useMemo(() => {
    return [...documents]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [documents]);

  if (loading) {
    return (
      <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" role="main" aria-label="Knowledge Hub">
        <PageHeaderSkeleton />
        <div className="mb-6">
          <div className="h-10 w-full max-w-md animate-pulse rounded-md bg-muted" />
        </div>
        <div className="grid gap-6 lg:grid-cols-4">
          <aside className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <div className="h-6 w-32 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-8 w-full animate-pulse rounded bg-muted" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>
          <div className="lg:col-span-3 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <DocumentCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" role="main" aria-label="Knowledge Hub">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Hub</h1>
        <p className="text-muted-foreground" role="doc-subtitle">
          Access and manage your knowledge base documents
        </p>
      </header>

      {/* Search */}
      <div className="mb-6">
        <KnowledgeSearch 
          onSearch={setSearchQuery}
          isLoading={loading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar with categories and recent */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryFilter
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onCategoryChange={setSelectedCategoryId}
              />
            </CardContent>
          </Card>

          {/* Recent Documents */}
          {recentDocuments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recently Updated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentDocuments.map((doc) => (
                    <Link
                      key={doc.id}
                      href={`/knowledge/${doc.slug}`}
                      className="block p-2 rounded-md hover:bg-accent transition-colors"
                      aria-label={`View ${doc.title} document`}
                    >
                      <p className="text-sm font-medium line-clamp-2">{doc.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </aside>

        {/* Main content */}
        <div className="lg:col-span-3">
          {filteredDocuments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery || selectedCategoryId
                      ? "No documents match your filters"
                      : "No knowledge documents available"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-4">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{doc.category?.title || "Uncategorized"}</Badge>
                          </div>
                          <CardTitle className="text-lg mb-2">
                            <Link 
                              href={`/knowledge/${doc.slug}`}
                              className="hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                            >
                              {doc.title}
                            </Link>
                          </CardTitle>
                          <p className="text-sm text-muted-foreground line-clamp-2">{doc.content}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <time className="text-xs text-muted-foreground whitespace-nowrap" dateTime={doc.updatedAt}>
                            {new Date(doc.updatedAt).toLocaleDateString()}
                          </time>
                          <Button variant="outline" size="sm" asChild>
                            <Link 
                              href={`/knowledge/${doc.slug}`}
                              aria-label={`Read full article: ${doc.title}`}
                            >
                              <span className="sr-only">Read full article: </span>
                              <span aria-hidden="true">Read More</span>
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
              {!searchQuery && hasMore && (
                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={loadMoreDocuments}
                    disabled={loadingMore}
                    variant="outline"
                  >
                    {loadingMore ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
