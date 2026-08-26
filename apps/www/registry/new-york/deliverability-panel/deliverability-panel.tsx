"use client";

import * as React from "react";
import { useHandsetClient, type Message, type Page } from "@handset/react";
import { cn } from "@/lib/utils";

export interface DeliverabilityPanelProps {
  /** Scope to one tenant's messages. */
  tenantId?: string;
  /** How many recent messages to sample. Default 200. */
  limit?: number;
  className?: string;
}

/**
 * Outbound delivery health from the last N messages: delivery rate, in-flight
 * count, and a breakdown of failure reasons. The Handset API has no stats
 * endpoint, so this aggregates a recent sample client-side — a live pulse, not
 * a billing-grade report.
 */
export function DeliverabilityPanel({ tenantId, limit = 200, className }: DeliverabilityPanelProps) {
  const client = useHandsetClient();
  const [messages, setMessages] = React.useState<Message[] | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let alive = true;
    client
      .request<Page<Message>>("GET", "/messages", { query: { tenant_id: tenantId, limit } })
      .then((p) => { if (alive) setMessages(p.data); })
      .catch((e) => { if (alive) setError(e as Error); });
    return () => { alive = false; };
  }, [client, tenantId, limit]);

  if (error && !messages) {
    return <p className={cn("text-sm text-destructive", className)}>{error.message}</p>;
  }
  if (!messages) {
    return <div className={cn("h-40 animate-pulse rounded-lg border bg-muted/40", className)} aria-hidden="true" />;
  }

  const outbound = messages.filter((m) => m.direction === "outbound");
  const delivered = outbound.filter((m) => m.status === "delivered").length;
  const failed = outbound.filter((m) => m.status === "failed");
  const inflight = outbound.filter((m) => m.status === "queued" || m.status === "sending" || m.status === "sent").length;
  const settled = delivered + failed.length;
  const rate = settled ? delivered / settled : 1;

  const reasons = new Map<string, number>();
  for (const m of failed) {
    const code = m.error_code ?? "unknown";
    reasons.set(code, (reasons.get(code) ?? 0) + 1);
  }
  const reasonRows = [...reasons.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium">Deliverability</p>
        <span className="text-xs text-muted-foreground">last {outbound.length} outbound</span>
      </div>

      <div className="mt-3 flex items-end gap-3">
        <span className="text-3xl font-semibold tabular-nums">{(rate * 100).toFixed(settled ? 1 : 0)}%</span>
        <span className="pb-1 text-sm text-muted-foreground">delivered</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-destructive/20">
        <div className="h-full rounded-full bg-primary" style={{ width: `${rate * 100}%` }} />
      </div>
      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
        <span>{delivered.toLocaleString()} delivered</span>
        <span>{failed.length.toLocaleString()} failed</span>
        {inflight > 0 ? <span>{inflight.toLocaleString()} in flight</span> : null}
      </div>

      {reasonRows.length > 0 ? (
        <div className="mt-4 border-t pt-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Why sends failed</p>
          <ul className="space-y-1.5">
            {reasonRows.map(([code, count]) => (
              <li key={code} className="flex items-center justify-between gap-3 text-sm">
                <span className="font-mono text-xs">{code}</span>
                <span className="tabular-nums text-muted-foreground">{count}</span>
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
