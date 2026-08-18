"use client";

import * as React from "react";
import { useHandsetClient, type Call } from "@handset/react";
import { cn } from "@/lib/utils";

type CallEvent = NonNullable<Call["events"]>[number];

export interface CallKeypadViewProps {
  callId: string | null;
  className?: string;
}

/**
 * A call's keypad story: gather prompts with the digits the caller answered
 * (or why they didn't), plus loose keypresses and digits sent to the far
 * end. Fetches the call's event timeline on mount and renders nothing when
 * the call had no keypad activity — safe to drop into any call expansion.
 */
export function CallKeypadView({ callId, className }: CallKeypadViewProps) {
  const client = useHandsetClient();
  const [events, setEvents] = React.useState<CallEvent[] | null>(null);

  React.useEffect(() => {
    if (!callId) return;
    let live = true;
    client
      .request<Call>("GET", `/calls/${callId}`)
      .then((call) => {
        if (live) setEvents(call.events ?? []);
      })
      .catch(() => {
        // Keypad detail is an enrichment; the transcript view surfaces
        // call-level errors, so a failed timeline read just renders nothing.
        if (live) setEvents([]);
      });
    return () => {
      live = false;
    };
  }, [client, callId]);

  const interactions = React.useMemo(() => parseKeypad(events ?? []), [events]);
  if (interactions.length === 0) return null;

  return (
    <div className={className}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">Keypad</p>
      <ol className="mt-1.5 space-y-2.5">
        {interactions.map((it, i) => (
          <li key={i} className="text-sm leading-relaxed">
            {it.kind === "gather" ? (
              <>
                {it.prompt ? (
                  <p className="text-[13px] italic text-muted-foreground">&ldquo;{it.prompt}&rdquo;</p>
                ) : null}
                <p className="mt-1 flex flex-wrap items-center gap-1.5">
                  {it.reason === "completed" && it.digits ? (
                    <>
                      <span className="text-xs text-muted-foreground">Answered</span>
                      <Digits value={it.digits} />
                    </>
                  ) : it.reason === "pending" ? (
                    <span className="text-xs text-muted-foreground">Listening for keypresses…</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {it.reason === "hangup" ? "Caller hung up before answering" : "No input — timed out"}
                    </span>
                  )}
                </p>
              </>
            ) : (
              <p className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground">
                  {it.kind === "sent"
                    ? "Sent to the far end"
                    : it.party === "agent"
                      ? "Agent pressed"
                      : "Caller pressed"}
                </span>
                <Digits value={it.digits} />
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Digits({ value }: { value: string }) {
  return (
    <span className="inline-flex gap-1" aria-label={`digits ${value.split("").join(" ")}`}>
      {value.split("").map((d, i) => (
        <span
          key={i}
          className={cn(
            "inline-flex h-5 min-w-5 items-center justify-center rounded border bg-background px-1",
            "font-mono text-[11px] font-medium tabular-nums",
          )}
        >
          {d}
        </span>
      ))}
    </span>
  );
}

type KeypadInteraction =
  | { kind: "gather"; prompt?: string; digits: string; reason: string; at: string }
  | { kind: "presses"; party: string; digits: string; at: string }
  | { kind: "sent"; digits: string; at: string };

/**
 * Folds the call's event timeline into keypad interactions. Keypresses that
 * happen inside a gather are already part of its collected digits, so they
 * fold into the gather instead of double-rendering as loose presses.
 */
function parseKeypad(events: CallEvent[]): KeypadInteraction[] {
  const out: KeypadInteraction[] = [];
  let openGather: { prompt?: string; at: string } | null = null;
  let run: { party: string; digits: string; at: string } | null = null;
  const flushRun = () => {
    if (run) {
      out.push({ kind: "presses", ...run });
      run = null;
    }
  };

  for (const e of events) {
    const detail = (e.detail ?? {}) as Record<string, unknown>;
    switch (e.type) {
      case "gather_started":
        flushRun();
        openGather = { prompt: asString(detail.prompt), at: e.at };
        break;
      case "gather_ended":
        flushRun();
        out.push({
          kind: "gather",
          prompt: openGather?.prompt ?? asString(detail.prompt),
          digits: asString(detail.digits) ?? "",
          reason: asString(detail.reason) ?? "completed",
          at: e.at,
        });
        openGather = null;
        break;
      case "dtmf_received": {
        if (openGather) break; // folded into the gather's digits
        const party = asString(detail.party) ?? "customer";
        const digit = asString(detail.digit) ?? "";
        if (!digit) break;
        if (run && run.party === party) run.digits += digit;
        else {
          flushRun();
          run = { party, digits: digit, at: e.at };
        }
        break;
      }
      case "dtmf_sent":
        flushRun();
        if (asString(detail.digits)) out.push({ kind: "sent", digits: asString(detail.digits)!, at: e.at });
        break;
    }
  }
  flushRun();
  // A gather that never ended: the call is live and still listening.
  if (openGather) out.push({ kind: "gather", prompt: openGather.prompt, digits: "", reason: "pending", at: openGather.at });
  return out;
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v !== "" ? v : undefined;
}
