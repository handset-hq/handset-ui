"use client";

import * as React from "react";
import { useCalls, type Call, type UseCallsOptions } from "@handset/react";
import { ChevronDown, PhoneIncoming, PhoneMissed, PhoneOutgoing, Voicemail } from "lucide-react";
import { cn } from "@/lib/utils";
import { CallTranscriptView } from "@/components/handset/call-transcript";

export interface CallLogProps extends UseCallsOptions {
  className?: string;
  /** Format numbers for display. Defaults to a US-style formatter. */
  formatNumber?: (e164: string) => string;
}

/** Call history with outcomes, durations, and expandable transcripts. */
export function CallLog({ className, formatNumber = formatUS, ...options }: CallLogProps) {
  const { calls, isLoading, error, hasMore, loadMore } = useCalls(options);
  const [openId, setOpenId] = React.useState<string | null>(null);

  if (isLoading && calls.length === 0) {
    return (
      <div className={cn("space-y-px overflow-hidden rounded-lg border", className)} aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse border-b bg-muted/40 last:border-b-0" />
        ))}
      </div>
    );
  }
  if (error && calls.length === 0) {
    return <p className={cn("text-sm text-destructive", className)}>{error.message}</p>;
  }
  if (calls.length === 0) {
    return (
      <p className={cn("rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground", className)}>
        No calls yet.
      </p>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border", className)}>
      {calls.map((call) => {
        const open = openId === call.id;
        return (
          <div key={call.id} className="border-b last:border-b-0">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : call.id)}
              aria-expanded={open}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
            >
              <CallIcon call={call} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {formatNumber(call.direction === "outbound" ? call.to : call.from)}
                </span>
                <span className="block text-xs text-muted-foreground">{describeOutcome(call)}</span>
              </span>
              <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                {formatWhen(call.started_at)}
              </span>
              <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
            </button>
            {open ? (
              <div className="border-t bg-muted/20 px-4 py-3">
                <CallTranscriptView callId={call.id} />
              </div>
            ) : null}
          </div>
        );
      })}
      {hasMore ? (
        <button
          type="button"
          onClick={() => void loadMore()}
          className="w-full border-t py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/40"
        >
          Load more
        </button>
      ) : null}
    </div>
  );
}

function CallIcon({ call }: { call: Call }) {
  const base = "h-4 w-4 shrink-0";
  if (call.status === "missed" || call.status === "failed") return <PhoneMissed className={cn(base, "text-destructive")} />;
  if (call.status === "voicemail") return <Voicemail className={cn(base, "text-muted-foreground")} />;
  if (call.direction === "outbound") return <PhoneOutgoing className={cn(base, "text-primary")} />;
  return <PhoneIncoming className={cn(base, "text-primary")} />;
}

function describeOutcome(call: Call): string {
  switch (call.status) {
    case "dialing":
    case "ringing":
      return "In progress…";
    case "in_progress":
      return "On the call now";
    case "completed":
      return `${call.direction === "outbound" ? "Outgoing" : "Incoming"} · ${formatDuration(call.duration_seconds ?? 0)}`;
    case "missed":
      return "Missed";
    case "voicemail":
      return "Voicemail left";
    case "failed":
      return "Failed";
  }
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  const sameDay = date.toDateString() === new Date().toDateString();
  if (sameDay) return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatUS(e164: string): string {
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164;
}
