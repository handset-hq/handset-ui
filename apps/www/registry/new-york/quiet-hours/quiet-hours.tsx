"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface QuietHoursProps {
  /** Start of the allowed sending window, "HH:MM". Default "08:00". */
  start?: string;
  /** End of the allowed window, "HH:MM". Default "21:00". */
  end?: string;
  /** IANA timezone to evaluate the window in. Default the viewer's zone. */
  timezone?: string;
  /** Override "now" (for tests/previews). Defaults to the current time. */
  now?: Date;
  /** Render-prop: receives whether sending is allowed right now. */
  children?: (allowed: boolean) => React.ReactNode;
  className?: string;
}

/** True when `now` (in `timezone`) falls inside [start, end]. Windows that wrap past midnight are supported. */
export function isWithinQuietHours(
  start = "08:00",
  end = "21:00",
  timezone?: string,
  now: Date = new Date(),
): boolean {
  const mins = localMinutes(now, timezone);
  const s = toMinutes(start);
  const e = toMinutes(end);
  return s <= e ? mins >= s && mins < e : mins >= s || mins < e;
}

/**
 * A sending-hours guard: renders a warning when the current local time is
 * outside the allowed window (e.g. don't text before 8am or after 9pm), and
 * passes an `allowed` boolean to its children so you can disable a send button.
 * A compliance guardrail, not a scheduler — the message still sends now if you
 * let it.
 */
export function QuietHours({ start = "08:00", end = "21:00", timezone, now, children, className }: QuietHoursProps) {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    if (now) return; // fixed time — no ticking
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, [now]);
  void tick;

  const allowed = isWithinQuietHours(start, end, timezone, now);

  return (
    <div className={className}>
      {!allowed ? (
        <div className={cn("mb-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400")} role="status">
          Outside sending hours ({start}–{end}
          {timezone ? ` ${timezone}` : ""}). Messaging now may reach recipients at a bad local time.
        </div>
      ) : null}
      {children ? children(allowed) : null}
    </div>
  );
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function localMinutes(date: Date, timezone?: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0") % 24;
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return h * 60 + m;
}
