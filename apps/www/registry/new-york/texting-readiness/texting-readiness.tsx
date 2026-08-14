"use client";

import { usePhoneNumber, type UsePhoneNumberOptions } from "@handset/react";
import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TextingReadinessProps extends UsePhoneNumberOptions {
  phoneNumberId: string | null;
  className?: string;
}

/**
 * Why can't I text yet? — a number's path to messaging, made visible:
 * active → campaign attached → carrier approved. 10DLC without the mystery.
 */
export function TextingReadiness({ phoneNumberId, className, ...options }: TextingReadinessProps) {
  const { number, isLoading, error } = usePhoneNumber(phoneNumberId, options);

  if (isLoading && !number) {
    return <div className={cn("h-28 animate-pulse rounded-lg border bg-muted/40", className)} aria-hidden="true" />;
  }
  if (error) return <p className={cn("text-sm text-destructive", className)}>{error.message}</p>;
  if (!number) return null;

  const hasCampaign = Boolean(number.campaign_id);
  const ready = Boolean(number.messaging_ready);

  const checks: { label: string; done: boolean; pendingHint?: string }[] = [
    { label: "Number active", done: true },
    {
      label: "10DLC campaign attached",
      done: hasCampaign,
      pendingHint: "Register a campaign for this number to start carrier review.",
    },
    {
      label: "Carrier approved",
      done: ready,
      pendingHint: hasCampaign ? "Review typically takes days to a few weeks — this flips automatically." : undefined,
    },
  ];

  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium tabular-nums">{formatUS(number.phone_number)}</p>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-medium",
            ready ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
          )}
        >
          {ready ? "Ready to text" : "Texting pending"}
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {checks.map((check) => (
          <li key={check.label} className="flex items-start gap-2 text-sm">
            {check.done ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            ) : (
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span>
              <span className={cn(!check.done && "text-muted-foreground")}>{check.label}</span>
              {!check.done && check.pendingHint ? (
                <span className="block text-xs text-muted-foreground">{check.pendingHint}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t pt-2.5 text-xs text-muted-foreground">
        {ready
          ? "Outbound and inbound texting are fully enabled on this number."
          : "Calls and inbound texts work now; outbound texting unlocks at carrier approval."}
      </p>
    </div>
  );
}

function formatUS(e164: string): string {
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164;
}
