"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: Array<{ id: number; title: string; slug: string }>;
  selectedCategoryId: number | null;
  onCategoryChange: (categoryId: number | null) => void;
}

export function CategoryFilter({
  categories,
  selectedCategoryId,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedCategoryId === null ? "default" : "outline"}
        size="sm"
        onClick={() => onCategoryChange(null)}
        className="h-8"
      >
        All Categories
      </Button>
      {categories.map((category) => (
        <Badge
          key={category.id}
          variant={selectedCategoryId === category.id ? "default" : "outline"}
          className={cn(
            "cursor-pointer px-3 py-1 transition-colors",
            selectedCategoryId === category.id && "bg-primary text-primary-foreground"
          )}
          onClick={() => onCategoryChange(category.id)}
        >
          {category.title}
        </Badge>
      ))}
    </div>
  );
}
