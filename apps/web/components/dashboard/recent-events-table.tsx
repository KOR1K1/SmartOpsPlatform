"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/date-utils";

interface RecentEventsTableProps {
  events: Array<{
    id: number;
    type: string;
    message: string;
    createdAt: string;
    task?: { id: number; title: string };
    user?: { id: number; name: string };
  }>;
}

export function RecentEventsTable({ events }: RecentEventsTableProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDate = (dateString: string) => {
    if (!mounted) {
      // During SSR, return a simple format to avoid hydration mismatch
      return new Date(dateString).toISOString().split('T')[0];
    }
    // Use standardized date formatting utility
    return formatDateTime(dateString);
  };

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recent events</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card role="region" aria-label="Recent Events Table">
      <CardHeader>
        <CardTitle>Recent Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto custom-scrollbar">
          <Table role="table" aria-label="Recent events list">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Type</TableHead>
                <TableHead scope="col">Message</TableHead>
                <TableHead scope="col">Task</TableHead>
                <TableHead scope="col">User</TableHead>
                <TableHead scope="col">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <Badge variant="outline" aria-label={`Event type: ${event.type}`} suppressHydrationWarning>
                      {event.type || ""}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md truncate" suppressHydrationWarning>
                    {event.message || ""}
                  </TableCell>
                  <TableCell suppressHydrationWarning>
                    {event.task ? (
                      <span className="text-sm">{event.task.title || ""}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm" aria-label="No task">-</span>
                    )}
                  </TableCell>
                  <TableCell suppressHydrationWarning>
                    {event.user ? (
                      <span className="text-sm">{event.user.name || ""}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm" aria-label="No user">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    <time dateTime={event.createdAt} suppressHydrationWarning>
                      {formatDate(event.createdAt)}
                    </time>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
