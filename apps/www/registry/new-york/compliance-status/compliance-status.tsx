"use client";

import * as React from "react";
import { useBrand, useCampaign, type Campaign } from "@handset/react";
import { AlertCircle, Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComplianceStatusProps {
  /** A brand id (brd_…) to track. */
  brandId?: string;
  /** A campaign id (cmp_…) to track. */
  campaignId?: string;
  /** Poll interval while pending. 0 fetches once. Polling stops when settled. */
  pollMs?: number;
  className?: string;
}

/**
 * Tracks 10DLC brand and/or campaign approval: a status badge, the carrier's
 * rejection reason when rejected, and assigned throughput once a campaign is
 * approved. Built on useBrand / useCampaign, which poll while pending and stop
 * once everything settles.
 */
export function ComplianceStatus({ brandId, campaignId, pollMs = 15000, className }: ComplianceStatusProps) {
  const { brand, isLoading: brandLoading, error: brandError } = useBrand(brandId ?? null, { pollMs });
  const { campaign, isLoading: campaignLoading, error: campaignError } = useCampaign(campaignId ?? null, { pollMs });

  if (!brandId && !campaignId) return null;

  return (
    <div className={cn("divide-y rounded-lg border", className)}>
      {brandId ? (
        <Row
          label="Brand"
          title={brand?.legal_name}
          status={brand?.status}
          rejection={brand?.rejection_reason}
          loading={brandLoading && !brand}
          error={brandError}
        />
      ) : null}
      {campaignId ? (
        <Row
          label="Campaign"
          title={campaign?.use_case?.replace(/_/g, " ")}
          status={campaign?.status}
          rejection={campaign?.rejection_reason}
          loading={campaignLoading && !campaign}
          error={campaignError}
          detail={approvedThroughput(campaign)}
        />
      ) : null}
    </div>
  );
}

function Row({
  label,
  title,
  status,
  rejection,
  loading,
  error,
  detail,
}: {
  label: string;
  title?: string;
  status?: string;
  rejection?: string | null;
  loading: boolean;
  error: Error | null;
  detail?: string;
}) {
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
            {loading ? "Loading…" : status ?? (error ? "Error" : "—")}
          </span>
        </div>
        {rejection ? <p className="mt-1 text-xs text-destructive">{rejection}</p> : null}
        {detail ? <p className="mt-1 text-xs text-muted-foreground">{detail}</p> : null}
        {error && !status ? <p className="mt-1 text-xs text-destructive">{error.message}</p> : null}
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

function approvedThroughput(c: Campaign | null): string | undefined {
  if (!c || statusTone(c.status) !== "approved" || !c.throughput) return undefined;
  const parts: string[] = [];
  if (c.throughput.messages_per_minute != null) parts.push(`${c.throughput.messages_per_minute}/min`);
  if (c.throughput.daily_cap != null) parts.push(`${c.throughput.daily_cap.toLocaleString()}/day`);
  return parts.length ? `Assigned throughput: ${parts.join(" · ")}` : undefined;
}
