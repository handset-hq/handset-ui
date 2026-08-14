"use client";

import * as React from "react";
import type { Softphone } from "@handset/webrtc";
import { useSoftphone } from "@handset/webrtc/react";
import { Delete, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DialerProps {
  /** The softphone instance (createSoftphone / createDemoSoftphone). */
  softphone: Softphone;
  /** Caller ID presented on outbound calls — one of the tenant's numbers. */
  callerNumber?: string;
  className?: string;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"] as const;

/**
 * A phone keypad: type or tap a number, hit call. During a call the keypad
 * sends DTMF (phone-tree navigation) instead of editing the number.
 */
export function Dialer({ softphone, callerNumber, className }: DialerProps) {
  const { status, call, dial } = useSoftphone({ softphone });
  const [number, setNumber] = React.useState("");
  const inCall = call !== null && call.state !== "ended";

  const press = (key: string) => {
    if (inCall) {
      call.sendDigits(key);
      return;
    }
    setNumber((n) => (n.length < 16 ? n + key : n));
  };

  const placeCall = async () => {
    const to = normalize(number);
    if (!to || inCall) return;
    await dial({ to, callerNumber }).catch(() => undefined);
  };

  return (
    <div className={cn("w-56 select-none", className)}>
      <div className="mb-2 flex h-9 items-center gap-1 rounded-md border px-2">
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value.replace(/[^\d+*#]/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") void placeCall();
          }}
          placeholder={inCall ? "In call — keys send tones" : "+1 415 555 0132"}
          disabled={inCall}
          aria-label="Number to call"
          className="w-full bg-transparent text-center font-mono text-sm tabular-nums focus-visible:outline-none disabled:opacity-60"
        />
        {number && !inCall ? (
          <button
            type="button"
            aria-label="Delete digit"
            onClick={() => setNumber((n) => n.slice(0, -1))}
            className="text-muted-foreground hover:text-foreground"
          >
            <Delete className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => press(key)}
            className={cn(
              "h-11 rounded-md border text-base font-medium tabular-nums transition-colors",
              "hover:bg-muted/60 active:bg-muted",
            )}
          >
            {key}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => void placeCall()}
        disabled={status !== "ready" || inCall || normalize(number) === ""}
        className={cn(
          "mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground",
          "transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40",
        )}
      >
        <Phone className="h-4 w-4" />
        {status === "ready" || inCall ? "Call" : status === "connecting" ? "Connecting…" : "Offline"}
      </button>
    </div>
  );
}

function normalize(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits.length > 8 ? digits : "";
  if (digits.length === 10) return "+1" + digits;
  if (digits.length === 11 && digits.startsWith("1")) return "+" + digits;
  return "";
}
