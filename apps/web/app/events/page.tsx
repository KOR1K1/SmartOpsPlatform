"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchEventsClient } from "@/lib/api";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventsSearch } from "@/components/events/events-search";
import { EventsFilters } from "@/components/events/events-filters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Archive, Activity, Search } from "lucide-react";
import { PageHeaderSkeleton, EventCardSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime, getDateRanges } from "@/lib/date-utils";
import { toast } from "@/lib/toast";

type Event = {
  id: number;
  type: string;
  message: string;
  createdAt: string;
  task?: {
    id: number;
    title: string;
    status: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
};

const ITEMS_PER_PAGE = 20;

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Load events when filters change (no debounce - only explicit search)
  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        // Use much larger limit when searching to find results across more events
        // For numeric searches (like "25000"), we need to search through more data
        const isNumericSearch = /^\d+$/.test(searchQuery.trim());
        const limit = searchQuery 
          ? (isNumericSearch ? 500 : 200) // Search more for numeric queries
          : (selectedType ? 100 : ITEMS_PER_PAGE);
        const response = await fetchEventsClient(limit, 0, searchQuery.trim() || undefined, selectedType || undefined);
        setEvents(response.data || []);
        // Only show "Load More" when no filters/search are active
        setHasMore(response.pagination?.hasMore ?? false);
      } catch (error) {
        setEvents([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, [selectedType, searchQuery]); // Reload when filters or explicit search change

  async function loadMoreEvents() {
    if (loadingMore || !hasMore || searchQuery || selectedType) return; // Don't load more when filtering
    
    try {
      setLoadingMore(true);
      const response = await fetchEventsClient(
        ITEMS_PER_PAGE,
        events.length,
        searchQuery.trim() || undefined,
        selectedType || undefined
      );
      if (response.data.length === 0) {
        setHasMore(false);
      } else {
        setEvents((prev) => [...prev, ...response.data]);
        setHasMore(response.pagination?.hasMore ?? false);
      }
    } catch (error) {
      setHasMore(false);
      toast.error("Failed to load more events", "Please try again.");
    } finally {
      setLoadingMore(false);
    }
  }

  const eventTypes = useMemo(() => {
    const types = new Set(events.map((e) => e.type));
    return Array.from(types).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (searchQuery) {
      const query = searchQuery.trim().toLowerCase();
      // Split query into words for better search
      const searchWords = query.split(/\s+/).filter(word => word.length > 0);
      
      // Check if query contains a number (for ID search)
      const numericMatch = query.match(/\d+/);
      const numericId = numericMatch ? parseInt(numericMatch[0], 10) : null;
      
      filtered = filtered.filter((event) => {
        // Check ID if query contains a number
        if (numericId !== null && event.id === numericId) {
          return true;
        }
        
        // Search by words (all words must be found - AND logic)
        if (searchWords.length > 0) {
          const searchableText = [
            event.message || "",
            event.type || "",
            event.task?.title || "",
            event.user?.name || "",
            event.id.toString(), // Also search by ID as string
          ]
            .join(" ")
            .toLowerCase();
          
          // All words must be present
          return searchWords.every(word => searchableText.includes(word));
        }
        
        // Fallback to simple substring search
        const searchableText = [
          event.message || "",
          event.type || "",
          event.task?.title || "",
          event.user?.name || "",
          event.id.toString(),
        ]
          .join(" ")
          .toLowerCase();
        
        return searchableText.includes(query);
      });
    }

    if (selectedType) {
      filtered = filtered.filter((event) => event.type === selectedType);
    }

    return filtered;
  }, [events, searchQuery, selectedType]);

  const groupedEvents = useMemo(() => {
    const { today, yesterday, weekAgo } = getDateRanges();

    const todayEvents: Event[] = [];
    const yesterdayEvents: Event[] = [];
    const weekEvents: Event[] = [];
    const olderEvents: Event[] = [];

    filteredEvents.forEach((event) => {
      const eventDate = new Date(event.createdAt);
      if (eventDate >= today) {
        todayEvents.push(event);
      } else if (eventDate >= yesterday) {
        yesterdayEvents.push(event);
      } else if (eventDate >= weekAgo) {
        weekEvents.push(event);
      } else {
        olderEvents.push(event);
      }
    });

    return { todayEvents, yesterdayEvents, weekEvents, olderEvents };
  }, [filteredEvents]);

  if (loading) {
    return (
      <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeaderSkeleton />
        <div className="mb-6">
          <div className="h-10 w-full max-w-md animate-pulse rounded-md bg-muted" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" role="main" aria-label="Event Feed">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Event Feed</h1>
        <p className="text-muted-foreground" role="doc-subtitle">
          Monitor real-time events and system activities
        </p>
      </header>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <EventsSearch 
          onSearch={setSearchQuery}
          isLoading={loading}
        />
        {eventTypes.length > 0 && (
          <EventsFilters
            eventTypes={eventTypes}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
          />
        )}
      </div>

      {/* Events grouped by time */}
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Today ({groupedEvents.todayEvents.length})
          </TabsTrigger>
          <TabsTrigger value="yesterday" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Yesterday ({groupedEvents.yesterdayEvents.length})
          </TabsTrigger>
          <TabsTrigger value="week" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            This Week ({groupedEvents.weekEvents.length})
          </TabsTrigger>
          <TabsTrigger value="older" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Older ({groupedEvents.olderEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-6">
          <EventsList events={groupedEvents.todayEvents} searchQuery={searchQuery} selectedType={selectedType} />
        </TabsContent>
        <TabsContent value="yesterday" className="mt-6">
          <EventsList events={groupedEvents.yesterdayEvents} searchQuery={searchQuery} selectedType={selectedType} />
        </TabsContent>
        <TabsContent value="week" className="mt-6">
          <EventsList events={groupedEvents.weekEvents} searchQuery={searchQuery} selectedType={selectedType} />
        </TabsContent>
        <TabsContent value="older" className="mt-6">
          <EventsList events={groupedEvents.olderEvents} searchQuery={searchQuery} selectedType={selectedType} />
        </TabsContent>
      </Tabs>

      {/* Load More button - shown when no filters applied and more events available */}
      {!searchQuery && selectedType === null && hasMore && (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={loadMoreEvents}
            disabled={loadingMore}
            variant="outline"
          >
            {loadingMore ? "Loading..." : "Load More Events"}
          </Button>
        </div>
      )}
    </main>
  );
}

function EventsList({ events, searchQuery, selectedType }: { events: Event[]; searchQuery: string; selectedType: string | null }) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={searchQuery || selectedType ? Search : Activity}
        title={searchQuery || selectedType ? "No events found" : "No events available"}
        description={
          searchQuery || selectedType
            ? "Try adjusting your search or filter criteria to find events."
            : "There are no events in the system yet. Events will appear here as they occur."
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{event.type}</Badge>
                  {event.task && (
                    <Badge variant="secondary" className="text-xs">
                      {event.task.status}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base mb-2">{event.message}</CardTitle>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {event.task && (
                    <span>
                      <span className="font-medium">Task:</span> {event.task.title}
                    </span>
                  )}
                  {event.user && (
                    <span>
                      <span className="font-medium">User:</span> {event.user.name}
                    </span>
                  )}
                </div>
              </div>
              <time className="text-xs text-muted-foreground whitespace-nowrap" dateTime={event.createdAt}>
                {formatDateTime(event.createdAt)}
              </time>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
