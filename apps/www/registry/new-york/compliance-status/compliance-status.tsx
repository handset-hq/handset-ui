"use client";

import * as React from "react";
import { useHandsetClient } from "@handset/react";
import { AlertCircle, Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Registration {
  id: string;
  status: string;
  rejection_reason?: string | null;
  legal_name?: string;
  use_case?: string;
  throughput?: { messages_per_minute?: number | null; daily_cap?: number | null };
}

export interface ComplianceStatusProps {
  /** A brand id (brd_…) to track. */
  brandId?: string;
  /** A campaign id (cmp_…) to track. */
  campaignId?: string;
  /** Poll interval while anything is still pending. 0 disables polling. */
  pollMs?: number;
  className?: string;
}

/**
 * Tracks 10DLC brand and/or campaign approval: a status badge, the carrier's
 * rejection reason when rejected, and assigned throughput once a campaign is
 * approved. Polls while anything is pending and stops when everything settles.
 */
export function ComplianceStatus({ brandId, campaignId, pollMs = 15000, className }: ComplianceStatusProps) {
  const brand = useRegistration("brands", brandId, pollMs);
  const campaign = useRegistration("campaigns", campaignId, pollMs);

  if (!brandId && !campaignId) return null;

  return (
    <div className={cn("divide-y rounded-lg border", className)}>
      {brandId ? <Row label="Brand" title={brand.data?.legal_name} row={brand} /> : null}
      {campaignId ? (
        <Row
          label="Campaign"
          title={campaign.data?.use_case?.replace(/_/g, " ")}
          row={campaign}
          detail={approvedThroughput(campaign.data)}
        />
      ) : null}
    </div>
  );
}

function Row({
  label,
  title,
  row,
  detail,
}: {
  label: string;
  title?: string;
  row: { data: Registration | null; error: string | null; loading: boolean };
  detail?: string;
}) {
  const status = row.data?.status;
  const tone = statusTone(status);
  return (
    <div className="flex items-start gap-3 p-4">
      <StatusIcon tone={tone} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-medium">
            {label}
            {title ? <span className="ml-1.5 font-normal capitalize text-muted-foreground">{title}</span> : null}
          </p>
          <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium", badgeCls(tone))}>
            {row.loading && !row.data ? "Loading…" : status ?? (row.error ? "Error" : "—")}
          </span>
        </div>
        {row.data?.rejection_reason ? (
          <p className="mt-1 text-xs text-destructive">{row.data.rejection_reason}</p>
        ) : null}
        {detail ? <p className="mt-1 text-xs text-muted-foreground">{detail}</p> : null}
        {row.error && !row.data ? <p className="mt-1 text-xs text-destructive">{row.error}</p> : null}
      </div>
    </div>
  );
}

function StatusIcon({ tone }: { tone: Tone }) {
  const cls = "mt-0.5 h-4 w-4 shrink-0";
  if (tone === "approved") return <Check className={cn(cls, "text-primary")} aria-label="Approved" />;
  if (tone === "rejected") return <AlertCircle className={cn(cls, "text-destructive")} aria-label="Rejected" />;
  return <Clock className={cn(cls, "text-muted-foreground")} aria-label="Pending" />;
}

type Tone = "approved" | "rejected" | "pending";

function statusTone(status?: string): Tone {
  const s = (status ?? "").toLowerCase();
  if (s.includes("approv") || s === "active" || s === "valid" || s === "verified") return "approved";
  if (s.includes("reject") || s.includes("fail") || s.includes("invalid")) return "rejected";
  return "pending";
}

function badgeCls(tone: Tone): string {
  if (tone === "approved") return "bg-primary/10 text-primary";
  if (tone === "rejected") return "bg-destructive/10 text-destructive";
  return "bg-muted text-muted-foreground";
}

function approvedThroughput(c: Registration | null): string | undefined {
  if (!c || statusTone(c.status) !== "approved" || !c.throughput) return undefined;
  const parts: string[] = [];
  if (c.throughput.messages_per_minute != null) parts.push(`${c.throughput.messages_per_minute}/min`);
  if (c.throughput.daily_cap != null) parts.push(`${c.throughput.daily_cap.toLocaleString()}/day`);
  return parts.length ? `Assigned throughput: ${parts.join(" · ")}` : undefined;
}

function useRegistration(collection: "brands" | "campaigns", id: string | undefined, pollMs: number) {
  const client = useHandsetClient();
  const [data, setData] = React.useState<Registration | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(Boolean(id));

  React.useEffect(() => {
    if (!id) return;
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = async () => {
      try {
        const r = await client.request<Registration>("GET", `/${collection}/${id}`);
        if (!alive) return;
        setData(r);
        setError(null);
        setLoading(false);
        if (pollMs > 0 && statusTone(r.status) === "pending") timer = setTimeout(tick, pollMs);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Could not load status.");
        setLoading(false);
        if (pollMs > 0) timer = setTimeout(tick, pollMs);
      }
    };

    tick();
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, [client, collection, id, pollMs]);

  return { data, error, loading };
}
