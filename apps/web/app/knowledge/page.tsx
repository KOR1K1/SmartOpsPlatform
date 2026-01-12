import type { Metadata } from "next";
import { fetchKnowledgeCategories } from "@/lib/api";
import { KnowledgeClient } from "./knowledge-client";

export const metadata: Metadata = {
  title: "Knowledge Hub",
  description: "Access and manage your knowledge base documents",
};

// Force dynamic rendering to ensure cookies are available
export const dynamic = "force-dynamic";

/**
 * Knowledge Page - Server Component
 * Fetches categories on the server and passes them to Client Component
 */
type Category = {
  id: number;
  title: string;
  slug: string;
};

export default async function KnowledgePage() {
  // Fetch categories on the server using fetchApi (handles auth automatically)
  let categories: Category[];
  try {
    categories = await fetchKnowledgeCategories();
  } catch (error) {
    // If error indicates session expired, re-throw to trigger error boundary
    if (error instanceof Error && error.message.includes("Session expired")) {
      throw error;
    }
    // For other errors, use empty array
    categories = [];
  }

  return <KnowledgeClient initialCategories={categories} />;
}
