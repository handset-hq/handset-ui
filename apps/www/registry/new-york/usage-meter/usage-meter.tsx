"use client";

import { useUsage, type UseUsageOptions } from "@handset/react";
import { cn } from "@/lib/utils";

export interface UsageMeterProps extends UseUsageOptions {
  title?: string;
  className?: string;
}

const KIND_LABELS: Record<string, string> = {
  sms_segment_outbound: "Outbound texts (segments)",
  sms_segment_inbound: "Inbound texts (segments)",
  voice_minute_outbound: "Outbound call minutes",
  voice_minute_inbound: "Inbound call minutes",
  transcription_minute: "Transcription minutes",
  number_month: "Phone numbers",
};

/**
 * A tenant's usage for the period (defaults to this month), as labeled
 * quantities with comparative bars. The building block for showing — or
 * re-billing — your customers their own texting and calling.
 */
export function UsageMeter({ title = "Usage this month", className, ...options }: UsageMeterProps) {
  const { usage, isLoading, error } = useUsage(options);

  if (isLoading && !usage) {
    return <div className={cn("h-40 animate-pulse rounded-lg border bg-muted/40", className)} aria-hidden="true" />;
  }
  if (error) return <p className={cn("text-sm text-destructive", className)}>{error.message}</p>;
  if (!usage) return null;

  const rows = usage.data.filter((d) => d.quantity > 0);
  const max = Math.max(...rows.map((r) => r.quantity), 1);

  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium">{title}</p>
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{usage.mode} mode</span>
      </div>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No usage yet this period.</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {rows.map((row) => (
            <li key={row.kind}>
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="text-muted-foreground">{KIND_LABELS[row.kind] ?? row.kind}</span>
                <span className="font-medium tabular-nums">{row.quantity.toLocaleString()}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary/70" style={{ width: `${(row.quantity / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 border-t pt-2.5 text-xs tabular-nums text-muted-foreground">
        {formatDate(usage.start)} – {formatDate(usage.end)}
      </p>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
