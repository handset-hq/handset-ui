"use client";

import * as React from "react";
import { AgentAssistPanel } from "@/components/handset/agent-assist";

const DEMO_CUSTOMER = "+14155550186";

/**
 * Docs-only demo driver: places a simulated call against the mock API and
 * lets the AgentAssistPanel find it, exactly the way a partner's softphone
 * or click-to-call flow would.
 */
export function AgentAssistDemo() {
  const [placed, setPlaced] = React.useState(false);
  const [placing, setPlacing] = React.useState(false);

  const placeCall = async () => {
    setPlacing(true);
    try {
      await fetch("/api/handset/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: "num_demo", to: DEMO_CUSTOMER, connect_to: "+14155550199" }),
      });
      setPlaced(true);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="space-y-3">
      {!placed ? (
        <button
          type="button"
          onClick={() => void placeCall()}
          disabled={placing}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {placing ? "Dialing…" : "Place a demo call"}
        </button>
      ) : null}
      <AgentAssistPanel remoteNumber={placed ? DEMO_CUSTOMER : null} />
      {placed ? (
        <p className="text-xs text-muted-foreground">
          The simulated call connects in ~5s, streams a scripted transcript, ends at ~17s, and the AI summary
          lands ~15s later — the same lifecycle a live call follows.
        </p>
      ) : null}
    </div>
  );
}
