"use client";

import type { Softphone } from "@handset/webrtc";
import { useSoftphone } from "@handset/webrtc/react";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CallHUDProps {
  softphone: Softphone;
  /** Format the remote number for display. Defaults to a US formatter. */
  formatNumber?: (e164: string) => string;
  className?: string;
}

/**
 * The in-call bar: who you're talking to, a live timer, mute, hang up.
 * Renders nothing when no call is in progress — safe to mount permanently.
 */
export function CallHUD({ softphone, formatNumber = formatUS, className }: CallHUDProps) {
  const { call, elapsedSeconds } = useSoftphone({ softphone, autoConnect: false });
  if (!call || call.state === "ended" || (call.direction === "inbound" && call.state === "ringing")) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-background px-4 py-2.5 shadow-sm",
        className,
      )}
      role="status"
      aria-label="Active call"
    >
      <span className="relative flex h-2.5 w-2.5">
        {call.state === "active" ? (
          <>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </>
        ) : (
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-muted-foreground" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium tabular-nums">{formatNumber(call.remoteNumber)}</p>
        <p className="text-xs tabular-nums text-muted-foreground">
          {call.state === "active"
            ? formatElapsed(elapsedSeconds)
            : call.state === "ringing"
              ? "Ringing…"
              : call.state === "held"
                ? "On hold"
                : "Connecting…"}
        </p>
      </div>
      <button
        type="button"
        onClick={() => (call.muted ? call.unmute() : call.mute())}
        aria-label={call.muted ? "Unmute" : "Mute"}
        aria-pressed={call.muted}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
          call.muted ? "border-destructive/50 bg-destructive/10 text-destructive" : "hover:bg-muted/60",
        )}
      >
        {call.muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={() => void call.hangup()}
        aria-label="Hang up"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-destructive text-white transition-opacity hover:opacity-90"
      >
        <PhoneOff className="h-4 w-4" />
      </button>
    </div>
  );
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatUS(e164: string): string {
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164;
}
