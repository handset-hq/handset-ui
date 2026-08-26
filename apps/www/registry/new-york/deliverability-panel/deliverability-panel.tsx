"use client";

import * as React from "react";
import { useHandsetClient } from "@handset/react";
import { cn } from "@/lib/utils";

interface FailureReason {
  code: string;
  count: number;
}
interface OutboundStats {
  total: number;
  delivered: number;
  sent: number;
  failed: number;
  pending: number;
  delivery_rate: number;
  failure_reasons: FailureReason[];
}
interface MessageStats {
  start: string;
  end: string;
  outbound: OutboundStats;
}

export interface DeliverabilityPanelProps {
  /** Scope to one tenant's messages. */
  tenantId?: string;
  /** Window start (RFC 3339 or YYYY-MM-DD). Defaults to 30 days ago, server-side. */
  start?: string;
  /** Window end. Defaults to now. */
  end?: string;
  className?: string;
}

/**
 * Outbound delivery health over a window: delivery rate, status counts, and a
 * failure-reason breakdown — served by the API's GET /messages/stats, so the
 * aggregation happens server-side (accurate over any window, not a sample).
 */
export function DeliverabilityPanel({ tenantId, start, end, className }: DeliverabilityPanelProps) {
  const client = useHandsetClient();
  const [stats, setStats] = React.useState<MessageStats | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let alive = true;
    client
      .request<MessageStats>("GET", "/messages/stats", { query: { tenant_id: tenantId, start, end } })
      .then((s) => { if (alive) setStats(s); })
      .catch((e) => { if (alive) setError(e as Error); });
    return () => { alive = false; };
  }, [client, tenantId, start, end]);

  if (error && !stats) {
    return <p className={cn("text-sm text-destructive", className)}>{error.message}</p>;
  }
  if (!stats) {
    return <div className={cn("h-40 animate-pulse rounded-lg border bg-muted/40", className)} aria-hidden="true" />;
  }

  const o = stats.outbound;
  const settled = o.delivered + o.failed;

  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium">Deliverability</p>
        <span className="text-xs text-muted-foreground">{o.total.toLocaleString()} outbound · {fmtRange(stats.start, stats.end)}</span>
      </div>

      <div className="mt-3 flex items-end gap-3">
        <span className="text-3xl font-semibold tabular-nums">{(o.delivery_rate * 100).toFixed(settled ? 1 : 0)}%</span>
        <span className="pb-1 text-sm text-muted-foreground">delivered</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-destructive/20">
        <div className="h-full rounded-full bg-primary" style={{ width: `${o.delivery_rate * 100}%` }} />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>{o.delivered.toLocaleString()} delivered</span>
        <span>{o.failed.toLocaleString()} failed</span>
        {o.sent > 0 ? <span>{o.sent.toLocaleString()} sent</span> : null}
        {o.pending > 0 ? <span>{o.pending.toLocaleString()} pending</span> : null}
      </div>

      {o.failure_reasons.length > 0 ? (
        <div className="mt-4 border-t pt-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Why sends failed</p>
          <ul className="space-y-1.5">
            {o.failure_reasons.map((r) => (
              <li key={r.code} className="flex items-center justify-between gap-3 text-sm">
                <span className="font-mono text-xs">{r.code}</span>
                <span className="tabular-nums text-muted-foreground">{r.count}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 border-t pt-3 text-sm text-muted-foreground">No failures in this window.</p>
      )}
    </div>
  );
}

function fmtRange(start: string, end: string): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${new Date(start).toLocaleDateString(undefined, opts)} – ${new Date(end).toLocaleDateString(undefined, opts)}`;
}
