"use client";

import type { Softphone } from "@handset/webrtc";
import { useSoftphone } from "@handset/webrtc/react";
import { Phone, PhoneOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface IncomingCallToastProps {
  softphone: Softphone;
  formatNumber?: (e164: string) => string;
  /**
   * Where the toast floats. Defaults to bottom-right. Pass "static" to
   * render inline instead (the softphone block does this).
   */
  position?: "bottom-right" | "top-right" | "static";
  className?: string;
}

/**
 * Rings on screen when a call comes in: caller number, answer, decline.
 * Mount it once anywhere in your app; it renders nothing while quiet.
 */
export function IncomingCallToast({
  softphone,
  formatNumber = formatUS,
  position = "bottom-right",
  className,
}: IncomingCallToastProps) {
  const { incoming } = useSoftphone({ softphone, autoConnect: false });
  if (!incoming) return null;

  return (
    <div
      role="alertdialog"
      aria-label={`Incoming call from ${formatNumber(incoming.remoteNumber)}`}
      className={cn(
        "flex w-72 items-center gap-3 rounded-lg border bg-background p-3.5 shadow-lg",
        position === "bottom-right" && "fixed bottom-4 right-4 z-50",
        position === "top-right" && "fixed right-4 top-4 z-50",
        className,
      )}
    >
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/30" />
        <Phone className="relative h-4 w-4 text-primary" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium tabular-nums">{formatNumber(incoming.remoteNumber)}</p>
        <p className="text-xs text-muted-foreground">Incoming call…</p>
      </div>
      <button
        type="button"
        onClick={() => void incoming.reject()}
        aria-label="Decline"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive text-white transition-opacity hover:opacity-90"
      >
        <PhoneOff className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => void incoming.answer()}
        aria-label="Answer"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Phone className="h-4 w-4" />
      </button>
    </div>
  );
}

function formatUS(e164: string): string {
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164;
}
