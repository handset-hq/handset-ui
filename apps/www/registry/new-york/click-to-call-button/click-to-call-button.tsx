"use client";

import * as React from "react";
import { isCallActive, useClickToCall, type Call } from "@handset/react";
import { Phone, PhoneCall, PhoneOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ClickToCallButtonProps {
  /** A tenant number id (`num_…`) or E.164 — the caller ID both parties see. */
  from: string;
  /** The customer's number, E.164. */
  to: string;
  /** The agent's number, E.164 — their phone rings first. */
  connectTo: string;
  /** Stream live speech-to-text for the call. */
  transcribe?: boolean;
  onStatusChange?: (call: Call) => void;
  className?: string;
  children?: React.ReactNode;
}

const STATUS_LABEL: Record<Call["status"], string> = {
  dialing: "Calling your phone…",
  ringing: "Ringing customer…",
  in_progress: "Connected",
  completed: "Call ended",
  missed: "No answer",
  voicemail: "Went to voicemail",
  failed: "Call failed",
};

/**
 * A call button. Click → the agent's phone rings → the customer is bridged
 * in. The button narrates the call's lifecycle and returns to idle when done.
 */
export function ClickToCallButton({
  from,
  to,
  connectTo,
  transcribe,
  onStatusChange,
  className,
  children,
}: ClickToCallButtonProps) {
  const { call, isActive, isPlacing, error, place, reset } = useClickToCall({ onStatusChange });

  // After a call settles, linger on the outcome briefly, then reset.
  React.useEffect(() => {
    if (call && !isCallActive(call.status)) {
      const timer = setTimeout(reset, 4000);
      return () => clearTimeout(timer);
    }
  }, [call, reset]);

  if (call) {
    const settled = !isCallActive(call.status);
    const bad = call.status === "failed" || call.status === "missed";
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
          !settled && "border-primary/40 bg-primary/5 text-primary",
          settled && !bad && "text-muted-foreground",
          bad && "border-destructive/40 text-destructive",
          className,
        )}
        role="status"
      >
        {call.status === "in_progress" ? (
          <PhoneCall className="h-4 w-4 animate-pulse" />
        ) : bad ? (
          <PhoneOff className="h-4 w-4" />
        ) : (
          <Phone className={cn("h-4 w-4", !settled && "animate-pulse")} />
        )}
        {STATUS_LABEL[call.status]}
        {call.status === "in_progress" ? <LiveTimer since={call.started_at} /> : null}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex flex-col", className)}>
      <button
        type="button"
        onClick={() => void place({ from, to, connectTo, transcribe }).catch(() => undefined)}
        disabled={isPlacing || isActive}
        className={cn(
          "inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground",
          "transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50",
        )}
      >
        <Phone className="h-4 w-4" />
        {children ?? "Call"}
      </button>
      {error ? (
        <span className="mt-1 text-xs text-destructive" role="alert">
          {error.message}
        </span>
      ) : null}
    </span>
  );
}

function LiveTimer({ since }: { since: string }) {
  const [, force] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    const timer = setInterval(force, 1000);
    return () => clearInterval(timer);
  }, []);
  const seconds = Math.max(0, Math.floor((Date.now() - Date.parse(since)) / 1000));
  return (
    <span className="tabular-nums text-xs">
      {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
    </span>
  );
}
