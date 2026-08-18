"use client";

import * as React from "react";
import { useHandsetClient, type Call, isCallActive } from "@handset/react";
import { cn } from "@/lib/utils";
import { CallKeypadView } from "@/components/handset/call-keypad";
import { CallTranscriptView } from "@/components/handset/call-transcript";

export interface AgentAssistPanelProps {
  /**
   * The far party's number (E.164), from your softphone or dialer state.
   * The panel finds the matching active call on the API by itself.
   */
  remoteNumber: string | null;
  /**
   * Start live transcription automatically once the call is found
   * (POST /v1/calls/{id}/transcription). Default true.
   */
  autoTranscribe?: boolean;
  className?: string;
}

/**
 * The agent-assist panel: give it the number your agent is talking to and
 * it finds the active call, turns on live transcription, streams the
 * conversation as it happens (transcript + keypad events), and shows the
 * AI summary when it lands after hangup.
 *
 * Works alongside the softphone (`remoteNumber={call?.remoteNumber}`) or a
 * click-to-call flow — anywhere your UI knows who's on the line.
 */
export function AgentAssistPanel({ remoteNumber, autoTranscribe = true, className }: AgentAssistPanelProps) {
  const client = useHandsetClient();
  const [call, setCall] = React.useState<Call | null>(null);
  const startedRef = React.useRef<string | null>(null);
  const active = call ? isCallActive(call.status) : false;

  // Phase 1 — find the live call that matches the remote number.
  React.useEffect(() => {
    if (!remoteNumber || call) return;
    let live = true;
    const search = async () => {
      try {
        const page = await client.request<{ data: Call[] }>("GET", "/calls", {
          query: { limit: 10 },
        });
        const found = page.data.find(
          (c) => isCallActive(c.status) && (sameNumber(c.from, remoteNumber) || sameNumber(c.to, remoteNumber)),
        );
        if (live && found) setCall(found);
      } catch {
        // keep searching; transient errors surface once a call is found
      }
    };
    void search();
    const timer = setInterval(() => void search(), 2000);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [client, remoteNumber, call]);

  // Phase 2 — follow the found call (status flips, summary arriving).
  React.useEffect(() => {
    if (!call) return;
    if (!isCallActive(call.status) && call.summary) return; // settled
    let live = true;
    const timer = setInterval(async () => {
      try {
        const fresh = await client.request<Call>("GET", `/calls/${call.id}`);
        if (live) setCall(fresh);
      } catch {
        // transient; keep the last known state
      }
    }, 2500);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [client, call]);

  // Auto-start transcription exactly once per found call.
  React.useEffect(() => {
    if (!call || !autoTranscribe || startedRef.current === call.id || !isCallActive(call.status)) return;
    startedRef.current = call.id;
    void client.request("POST", `/calls/${call.id}/transcription`).catch(() => {
      // The panel still shows keypad events and the summary; the transcript
      // view will say there's no transcript.
    });
  }, [client, call, autoTranscribe]);

  if (!remoteNumber) return null;

  return (
    <div className={cn("rounded-lg border", className)}>
      <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2.5">
        <span
          aria-hidden
          className={cn(
            "h-2 w-2 rounded-full",
            !call ? "bg-muted-foreground/40" : active ? "animate-pulse bg-green-500" : "bg-muted-foreground",
          )}
        />
        <p className="text-sm font-medium">
          {!call ? "Waiting for the call…" : active ? "Live" : "Call ended"}
        </p>
        {call ? (
          <span className="ml-auto font-mono text-[11px] text-muted-foreground">{call.id}</span>
        ) : null}
      </div>

      {call ? (
        <div className="space-y-4 px-4 py-3">
          {call.summary ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">Summary</p>
              <p className="mt-1 text-sm leading-relaxed">{call.summary}</p>
            </div>
          ) : !active ? (
            <p className="text-xs italic text-muted-foreground">Generating the AI summary…</p>
          ) : null}
          <CallKeypadView callId={call.id} pollMs={active ? 2500 : 0} />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">Transcript</p>
            <CallTranscriptView callId={call.id} pollMs={active ? 2000 : 0} className="mt-1.5" />
          </div>
        </div>
      ) : (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
          Listening for a call with {remoteNumber}…
        </p>
      )}
    </div>
  );
}

/** Compare phone numbers loosely: same last 10 digits counts as a match. */
function sameNumber(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  const da = a.replace(/\D/g, "").slice(-10);
  const db = b.replace(/\D/g, "").slice(-10);
  return da.length > 0 && da === db;
}
