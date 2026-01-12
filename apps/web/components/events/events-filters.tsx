"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface EventsFiltersProps {
  eventTypes: string[];
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
}

export function EventsFilters({
  eventTypes,
  selectedType,
  onTypeChange,
}: EventsFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={selectedType || "all"} onValueChange={(value) => onTypeChange(value === "all" ? null : value)}>
        <SelectTrigger className="w-[180px]" aria-label="Filter events by type">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {eventTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedType && (
        <Badge variant="secondary" className="gap-2 px-3 py-1">
          {selectedType}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onTypeChange(null)}
            aria-label="Remove filter"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}
    </div>
  );
}
