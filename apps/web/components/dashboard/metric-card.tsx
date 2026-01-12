"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

type IconName = keyof typeof Icons;

interface MetricCardProps {
  title: string;
  value: number | string;
  iconName: IconName;
  trend?: {
    value: number;
    label: string;
  };
  description?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  iconName,
  trend,
  description,
  className,
}: MetricCardProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const Icon = Icons[iconName] as React.ComponentType<{ className?: string }> | undefined;
  
  // Fallback to a default icon if icon not found
  const DisplayIcon = Icon || Icons.BarChart;
  
  // Format value consistently - only format after mount to avoid hydration mismatch
  const formattedValue = mounted
    ? typeof value === "number"
      ? new Intl.NumberFormat("en-US").format(value)
      : String(value)
    : typeof value === "number"
    ? String(value) // Simple string conversion during SSR
    : String(value);
  
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend.value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (!trend) return "";
    if (trend.value > 0) return "text-green-500";
    if (trend.value < 0) return "text-red-500";
    return "text-muted-foreground";
  };

  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <DisplayIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {description && (
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <p className="text-3xl font-bold" suppressHydrationWarning>{formattedValue}</p>
          {trend && (
            <div className={cn("flex items-center gap-1 text-sm font-medium", getTrendColor())}>
              {getTrendIcon()}
              <span>{trend.label}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
