"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface DateDividerProps {
  date: string | Date;
  className?: string;
}

/**
 * A centered day label between message groups: "Today", "Yesterday", a weekday
 * name within the last week, then a short date (with year if not this year).
 */
export function DateDivider({ date, className }: DateDividerProps) {
  return (
    <div className={cn("flex items-center justify-center py-2", className)}>
      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
        {formatDayLabel(date)}
      </span>
    </div>
  );
}

/** "Today" / "Yesterday" / "Monday" / "Mar 4" / "Mar 4, 2024". */
export function formatDayLabel(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) return date.toLocaleDateString(undefined, { weekday: "long" });
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

/** True when both timestamps fall on the same calendar day. */
export function isSameDay(a: string | Date, b: string | Date): boolean {
  const da = typeof a === "string" ? new Date(a) : a;
  const db = typeof b === "string" ? new Date(b) : b;
  return da.toDateString() === db.toDateString();
}
