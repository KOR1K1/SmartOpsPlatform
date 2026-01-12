import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <FileQuestion className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Document Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            The document you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild className="w-full">
            <Link href="/knowledge" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Knowledge Hub
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
