"use client";

import * as React from "react";
import { useHandsetEvents, type RealtimeEnvelope } from "@handset/react";
import { cn } from "@/lib/utils";

export interface EventLogProps {
  /** Max events kept in the buffer. Default 100. */
  limit?: number;
  /** Seed rows (for demos/screenshots); live events prepend above them. */
  initialEvents?: RealtimeEnvelope[];
  className?: string;
}

/**
 * A live event inspector: subscribes to the realtime stream via
 * useHandsetEvents and lists each envelope newest-first, filterable by type,
 * with the raw payload expandable per row. Requires <HandsetProvider realtime>.
 */
export function EventLog({ limit = 100, initialEvents = [], className }: EventLogProps) {
  const [events, setEvents] = React.useState<RealtimeEnvelope[]>(initialEvents);
  const [filter, setFilter] = React.useState("");

  useHandsetEvents(
    React.useCallback(
      (e: RealtimeEnvelope) => setEvents((prev) => [e, ...prev].slice(0, limit)),
      [limit],
    ),
  );

  const shown = filter ? events.filter((e) => e.type.includes(filter)) : events;

  return (
    <div className={cn("flex h-full min-h-0 flex-col overflow-hidden rounded-lg border", className)}>
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by type, e.g. message."
          aria-label="Filter events by type"
          className="w-full bg-transparent font-mono text-xs placeholder:text-muted-foreground focus-visible:outline-none"
        />
        <span className="shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">{shown.length}</span>
      </div>

      <div className="min-h-0 flex-1 divide-y overflow-y-auto">
        {shown.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">
            {events.length === 0 ? "Waiting for events…" : "No events match that filter."}
          </p>
        ) : (
          shown.map((e) => <EventRow key={e.id} event={e} />)
        )}
      </div>
    </div>
  );
}

function EventRow({ event }: { event: RealtimeEnvelope }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="px-3 py-1.5 font-mono text-xs">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 text-left"
      >
        <span className="text-muted-foreground">{open ? "▾" : "▸"}</span>
        <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", familyCls(event.type))}>{event.type}</span>
        <span className="ml-auto shrink-0 text-[11px] text-muted-foreground tabular-nums">{time(event.created_at)}</span>
      </button>
      {open ? (
        <pre className="mt-1.5 overflow-x-auto rounded bg-muted/60 p-2 text-[11px] leading-relaxed text-foreground">
          {JSON.stringify(event.data, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}

/** Tint an event by its family (the part before the first dot). */
function familyCls(type: string): string {
  const family = type.split(".")[0];
  switch (family) {
    case "message":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    case "call":
      return "bg-violet-500/10 text-violet-600 dark:text-violet-400";
    case "voicemail":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "port_in":
    case "brand":
    case "campaign":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function time(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
