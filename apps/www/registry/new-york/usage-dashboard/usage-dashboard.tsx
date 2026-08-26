"use client";

import * as React from "react";
import { useUsage, type UseUsageOptions, type UsageKind } from "@handset/react";
import { cn } from "@/lib/utils";

const KINDS: { kind: UsageKind; label: string; unit: string }[] = [
  { kind: "sms_segment_outbound", label: "SMS sent", unit: "segments" },
  { kind: "sms_segment_inbound", label: "SMS received", unit: "segments" },
  { kind: "voice_minute_outbound", label: "Voice — outbound", unit: "min" },
  { kind: "voice_minute_inbound", label: "Voice — inbound", unit: "min" },
  { kind: "transcription_minute", label: "Transcription", unit: "min" },
  { kind: "number_month", label: "Numbers", unit: "mo" },
];

export interface UsageDashboardProps extends UseUsageOptions {
  /** Per-kind USD rates to show spend, e.g. { sms_segment_outbound: 0.008 }. */
  rates?: Partial<Record<UsageKind | string, number>>;
  className?: string;
}

/**
 * A usage breakdown for a period: quantity per kind with comparative bars, and
 * spend when you pass per-kind rates. Built on useUsage — pass tenantId /
 * start / end like the hook. The API summarizes one range, so this is the
 * period view, not a time series.
 */
export function UsageDashboard({ rates, className, ...options }: UsageDashboardProps) {
  const { usage, isLoading, error } = useUsage(options);

  if (isLoading && !usage) {
    return <div className={cn("h-56 animate-pulse rounded-lg border bg-muted/40", className)} aria-hidden="true" />;
  }
  if (error && !usage) {
    return <p className={cn("text-sm text-destructive", className)}>{error.message}</p>;
  }
  if (!usage) return null;

  const byKind = new Map(usage.data.map((d) => [d.kind, d.quantity]));
  const rows = KINDS.map((k) => ({ ...k, quantity: byKind.get(k.kind) ?? 0 }));
  const max = Math.max(1, ...rows.map((r) => r.quantity));
  const money = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const spendFor = (kind: string, qty: number) => (rates && rates[kind] != null ? rates[kind]! * qty : null);
  const totalSpend = rates ? rows.reduce((sum, r) => sum + (spendFor(r.kind, r.quantity) ?? 0), 0) : null;

  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium">Usage</p>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">{fmtRange(usage.start, usage.end)}</span>
          <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase", usage.mode === "live" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
            {usage.mode}
          </span>
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {rows.map((r) => {
          const spend = spendFor(r.kind, r.quantity);
          return (
            <div key={r.kind}>
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span>{r.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {r.quantity.toLocaleString()} <span className="text-xs">{r.unit}</span>
                  {spend != null ? <span className="ml-2 font-medium text-foreground">{money(spend)}</span> : null}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary/70" style={{ width: `${(r.quantity / max) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {totalSpend != null ? (
        <div className="mt-4 flex items-baseline justify-between border-t pt-3 text-sm">
          <span className="font-medium">Estimated spend</span>
          <span className="font-medium tabular-nums">{money(totalSpend)}</span>
        </div>
      ) : null}
    </div>
  );
}

function fmtRange(start: string, end: string): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${new Date(start).toLocaleDateString(undefined, opts)} – ${new Date(end).toLocaleDateString(undefined, opts)}`;
}
