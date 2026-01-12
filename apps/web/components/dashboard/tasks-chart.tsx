"use client";

import { useEffect, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TasksChartProps {
  data: Array<{
    status: string;
    count: number;
  }>;
}

const chartConfig = {
  count: {
    label: "Tasks",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function TasksChart({ data }: TasksChartProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Defer chart loading after initial render to improve LCP
  useEffect(() => {
    // Use requestIdleCallback if available, otherwise use a longer delay
    // This ensures charts load only when browser is idle, prioritizing LCP
    const loadChart = () => {
      setShouldLoad(true);
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      // Use longer timeout to ensure LCP completes first
      const idleCallbackId = (window as Window & { requestIdleCallback: typeof requestIdleCallback }).requestIdleCallback(loadChart, { timeout: 3000 });
      return () => {
        (window as Window & { cancelIdleCallback: typeof cancelIdleCallback }).cancelIdleCallback(idleCallbackId);
      };
    } else {
      // Fallback for browsers without requestIdleCallback - longer delay for better LCP
      timeoutRef.current = setTimeout(loadChart, 500); // Increased delay to prioritize LCP
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, []);

  // Also use Intersection Observer as fallback for below-fold content
  useEffect(() => {
    if (shouldLoad || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" } // Start loading 100px before visible
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [shouldLoad]);

  const chartData = data.map((item) => ({
    status: (item.status || "").replace(/_/g, " ").toUpperCase(),
    count: item.count || 0,
  }));

  return (
    <Card role="region" aria-label="Tasks by Status Chart" ref={containerRef}>
      <CardHeader>
        <CardTitle>Tasks by Status</CardTitle>
      </CardHeader>
      <CardContent>
        {shouldLoad ? (
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              aria-label="Tasks by Status Bar Chart"
              // Optimize rendering to reduce forced reflows
              syncId="tasks-chart"
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="status"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 8)}
                // Reduce reflow by using fixed width calculations
                interval="preserveStartEnd"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} animationDuration={0} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="min-h-[200px] w-full flex items-center justify-center text-sm text-muted-foreground">
            Loading chart...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
