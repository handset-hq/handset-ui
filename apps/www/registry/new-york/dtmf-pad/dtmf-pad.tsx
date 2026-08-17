"use client";

import * as React from "react";
import type { Softphone } from "@handset/webrtc";
import { useSoftphone } from "@handset/webrtc/react";
import { cn } from "@/lib/utils";

export interface DTMFPadProps {
  softphone: Softphone;
  /**
   * Play the real dual-tone frequencies locally on each press (the far end
   * hears the carrier's tones either way). Defaults on — the audible click
   * is what makes a keypad feel like a keypad.
   */
  tones?: boolean;
  /** Called after each digit is sent — e.g. to log it in your own UI. */
  onDigit?: (digit: string) => void;
  className?: string;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"] as const;

const SUBLABELS: Record<string, string> = {
  "2": "ABC", "3": "DEF", "4": "GHI", "5": "JKL", "6": "MNO",
  "7": "PQRS", "8": "TUV", "9": "WXYZ", "0": "+",
};

// ITU-T dual-tone pairs: row frequency + column frequency per key.
const ROWS = [697, 770, 852, 941];
const COLS = [1209, 1336, 1477];

/**
 * The in-call keypad: sends DTMF digits on the active call — extensions,
 * PINs, "press 1" menus. Shows the digits sent this call, accepts keyboard
 * input while focused, and stays disabled until a call is active.
 */
export function DTMFPad({ softphone, tones = true, onDigit, className }: DTMFPadProps) {
  const { call } = useSoftphone({ softphone, autoConnect: false });
  const [sent, setSent] = React.useState("");
  const audio = React.useRef<AudioContext | null>(null);
  const active = call !== null && call.state === "active";

  // A new call starts a fresh tape.
  const callId = call?.id ?? null;
  React.useEffect(() => setSent(""), [callId]);

  const beep = (key: string) => {
    const idx = KEYS.indexOf(key as (typeof KEYS)[number]);
    if (idx < 0) return;
    try {
      audio.current ??= new AudioContext();
      const ctx = audio.current;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      gain.connect(ctx.destination);
      for (const freq of [ROWS[Math.floor(idx / 3)], COLS[idx % 3]]) {
        const osc = ctx.createOscillator();
        osc.frequency.value = freq;
        osc.connect(gain);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch {
      // No AudioContext (SSR, autoplay policy): the digit still sends.
    }
  };

  const press = (key: string) => {
    if (!active || !call) return;
    call.sendDigits(key);
    setSent((s) => (s + key).slice(-24));
    if (tones) beep(key);
    onDigit?.(key);
  };

  return (
    <div
      className={cn("w-56 select-none", !active && "opacity-50", className)}
      onKeyDown={(e) => {
        if (/^[0-9*#]$/.test(e.key)) {
          e.preventDefault();
          press(e.key);
        }
      }}
      role="group"
      aria-label="In-call keypad"
    >
      <div
        className="mb-2 flex h-9 items-center justify-center rounded-md border px-2 font-mono text-sm tabular-nums"
        aria-live="polite"
      >
        {active ? (
          sent ? (
            <span className="truncate" title={sent}>{sent}</span>
          ) : (
            <span className="text-muted-foreground">Keys send tones</span>
          )
        ) : (
          <span className="text-muted-foreground">No active call</span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            disabled={!active}
            onClick={() => press(key)}
            aria-label={`Send ${key}`}
            className={cn(
              "flex h-11 flex-col items-center justify-center rounded-md border transition-colors",
              "hover:bg-muted/60 active:bg-muted disabled:pointer-events-none",
            )}
          >
            <span className="text-base font-medium leading-none tabular-nums">{key}</span>
            {SUBLABELS[key] ? (
              <span className="mt-0.5 text-[9px] leading-none tracking-widest text-muted-foreground">
                {SUBLABELS[key]}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
