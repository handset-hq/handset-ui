"use client";

import * as React from "react";
import type { Softphone } from "@handset/webrtc";
import { useSoftphone } from "@handset/webrtc/react";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CallHUDProps {
  softphone: Softphone;
  /** Format the remote number for display. Defaults to a US formatter. */
  formatNumber?: (e164: string) => string;
  /**
   * Let the user drag the bar anywhere on screen (grab anywhere except the
   * buttons). Position resets when the call ends. Pair with a `fixed`
   * className so the bar floats.
   */
  draggable?: boolean;
  className?: string;
}

/**
 * The in-call bar: who you're talking to, a live timer, mute, hang up.
 * Renders nothing when no call is in progress — safe to mount permanently.
 */
export function CallHUD({ softphone, formatNumber = formatUS, draggable = false, className }: CallHUDProps) {
  const { call, elapsedSeconds } = useSoftphone({ softphone, autoConnect: false });
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const drag = React.useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  if (!call || call.state === "ended" || (call.direction === "inbound" && call.state === "ringing")) {
    if (offset.x !== 0 || offset.y !== 0) setOffset({ x: 0, y: 0 });
    return null;
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable || (e.target as HTMLElement).closest("button")) return;
    drag.current = { startX: e.clientX, startY: e.clientY, baseX: offset.x, baseY: offset.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    setOffset({ x: d.baseX + e.clientX - d.startX, y: d.baseY + e.clientY - d.startY });
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-background px-4 py-2.5 shadow-sm",
        draggable && "cursor-grab touch-none select-none active:cursor-grabbing",
        className,
      )}
      style={draggable ? { transform: `translate(${offset.x}px, ${offset.y}px)` } : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
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
