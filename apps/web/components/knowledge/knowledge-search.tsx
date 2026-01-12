"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface KnowledgeSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export function KnowledgeSearch({
  onSearch,
  placeholder = "Search documents...",
  isLoading = false
}: KnowledgeSearchProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    // Don't trigger search automatically - only on explicit action
  };

  const handleSearch = () => {
    // Search only on explicit button click or Enter
    if (query.trim()) {
      onSearch(query.trim());
    } else {
      // Clear search if query is empty
      onSearch("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
    inputRef.current?.focus();
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-9"
          aria-label="Search documents"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={handleClear}
            aria-label="Clear search"
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Button
        onClick={handleSearch}
        disabled={isLoading}
        type="button"
        aria-label="Search"
      >
        <Search className="h-4 w-4 mr-2" />
        {isLoading ? "Searching..." : "Search"}
      </Button>
    </div>
  );
}
