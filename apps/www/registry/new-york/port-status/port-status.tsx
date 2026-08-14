"use client";

import { usePortIn, type PortInStatus, type UsePortInOptions } from "@handset/react";
import { AlertTriangle, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PortStatusProps extends UsePortInOptions {
  portInId: string | null;
  className?: string;
}

const STEPS: { status: PortInStatus; title: string; detail: string }[] = [
  { status: "draft", title: "Draft", detail: "Port request created" },
  { status: "in_review", title: "In review", detail: "Losing carrier is verifying the account details" },
  { status: "foc_confirmed", title: "Date confirmed", detail: "The switch-over date is locked" },
  { status: "completed", title: "Completed", detail: "Numbers are live on your new line" },
];

const ORDER: Record<PortInStatus, number> = {
  draft: 0,
  in_review: 1,
  action_needed: 1,
  foc_confirmed: 2,
  completed: 3,
  cancelled: -1,
};

/**
 * "Where's my number?" — a port-in request's progress as a stepper, with
 * carrier rejections surfaced as fixable callouts rather than dead ends.
 */
export function PortStatus({ portInId, className, ...options }: PortStatusProps) {
  const { portIn, isLoading, error } = usePortIn(portInId, options);

  if (isLoading && !portIn) {
    return (
      <div className={cn("space-y-3", className)} aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }
  if (error) return <p className={cn("text-sm text-destructive", className)}>{error.message}</p>;
  if (!portIn) return null;

  if (portIn.status === "cancelled") {
    return (
      <div className={cn("flex items-center gap-2 rounded-lg border p-4 text-sm text-muted-foreground", className)}>
        <X className="h-4 w-4" /> This port request was cancelled.
      </div>
    );
  }

  const position = ORDER[portIn.status];
  const blocked = portIn.status === "action_needed";

  return (
    <div className={cn("space-y-0", className)}>
      <p className="mb-3 text-sm text-muted-foreground">
        Porting <span className="font-medium text-foreground tabular-nums">{portIn.phone_numbers.join(", ")}</span>
        {portIn.foc_date ? (
          <>
            {" · switches over "}
            <span className="font-medium text-foreground">{formatDate(portIn.foc_date)}</span>
          </>
        ) : null}
      </p>
      <ol className="relative space-y-4">
        <span aria-hidden="true" className="absolute bottom-3 left-[11px] top-3 w-px bg-border" />
        {STEPS.map((step, i) => {
          const done = position > i || portIn.status === "completed";
          const current = position === i && portIn.status !== "completed";
          return (
            <li key={step.status} className="relative flex gap-3 pl-0">
              <span
                className={cn(
                  "z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-background text-[11px]",
                  done && "border-primary bg-primary text-primary-foreground",
                  current && !blocked && "border-primary text-primary",
                  current && blocked && "border-destructive text-destructive",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : blocked && current ? <AlertTriangle className="h-3 w-3" /> : i + 1}
              </span>
              <span>
                <span className={cn("block text-sm font-medium", !done && !current && "text-muted-foreground")}>
                  {step.title}
                </span>
                <span className="block text-xs text-muted-foreground">{step.detail}</span>
                {current && blocked ? (
                  <span className="mt-1.5 block rounded-md border border-destructive/40 bg-destructive/5 px-2.5 py-1.5 text-xs text-destructive">
                    Action needed: {portIn.status_detail ?? "the carrier rejected a detail — review and resubmit."}
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
