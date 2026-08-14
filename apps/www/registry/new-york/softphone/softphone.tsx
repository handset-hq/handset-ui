"use client";

import type { Softphone as SoftphoneInstance } from "@handset/webrtc";
import { useSoftphone } from "@handset/webrtc/react";
import { cn } from "@/lib/utils";
import { Dialer } from "@/components/handset/dialer";
import { CallHUD } from "@/components/handset/call-hud";
import { IncomingCallToast } from "@/components/handset/incoming-call-toast";

export interface SoftphonePanelProps {
  softphone: SoftphoneInstance;
  /** Caller ID presented on outbound calls — one of the tenant's numbers. */
  callerNumber?: string;
  className?: string;
}

const STATUS_LABEL: Record<string, string> = {
  idle: "Offline",
  connecting: "Connecting…",
  ready: "Ready",
  reconnecting: "Reconnecting…",
  error: "Connection error",
};

/**
 * The whole phone in one panel: connection state, dialer, in-call bar, and
 * inbound ringing — a phone that lives inside your product.
 */
export function SoftphonePanel({ softphone, callerNumber, className }: SoftphonePanelProps) {
  const { status } = useSoftphone({ softphone });

  return (
    <div className={cn("w-fit space-y-3 rounded-lg border p-4", className)}>
      <div className="flex items-center justify-between gap-6">
        <p className="text-sm font-medium">Phone</p>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className={cn(
              "inline-flex h-2 w-2 rounded-full",
              status === "ready" && "bg-primary",
              (status === "connecting" || status === "reconnecting") && "animate-pulse bg-muted-foreground",
              status === "error" && "bg-destructive",
              status === "idle" && "bg-muted-foreground/50",
            )}
          />
          {STATUS_LABEL[status] ?? status}
        </span>
      </div>
      <CallHUD softphone={softphone} />
      <Dialer softphone={softphone} callerNumber={callerNumber} />
      <IncomingCallToast softphone={softphone} position="static" className="w-full" />
    </div>
  );
}
