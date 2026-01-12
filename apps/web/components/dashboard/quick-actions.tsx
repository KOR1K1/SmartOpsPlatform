"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, FileText, Settings } from "lucide-react";
import Link from "next/link";
import { NewTaskDialog } from "./new-task-dialog";

export function QuickActions() {
  const actions = [
    {
      label: "Search",
      icon: Search,
      href: "/events",
      description: "Search events",
    },
    {
      label: "Knowledge",
      icon: FileText,
      href: "/knowledge",
      description: "Browse docs",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/profile",
      description: "Manage settings",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {/* Keep New Task as a first-class quick action for muscle memory */}
          <NewTaskDialog />
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto flex-col items-start justify-start p-4 hover:bg-accent"
                asChild
              >
                <Link href={action.href}>
                  <Icon className="mb-2 h-5 w-5" />
                  <span className="font-medium">{action.label}</span>
                  <span className="text-xs text-muted-foreground mt-1">{action.description}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
