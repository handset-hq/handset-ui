"use client";

import * as React from "react";
import { createSoftphone, type Softphone } from "@handset/webrtc";
import { Dialer } from "@/components/handset/dialer";
import { CallHUD } from "@/components/handset/call-hud";
import { IncomingCallToast } from "@/components/handset/incoming-call-toast";

/**
 * Live-fire lab: paste a real web-client token (POST
 * /v1/web_clients/{id}/tokens) and drive the production softphone stack.
 * Nothing here is mocked — this is the page that verifies the whole track.
 */
export default function LabPage() {
  const [token, setToken] = React.useState("");
  const [callerNumber, setCallerNumber] = React.useState("");
  const [phone, setPhone] = React.useState<Softphone | null>(null);
  const [status, setStatus] = React.useState("idle");
  const [log, setLog] = React.useState<string[]>([]);

  const append = React.useCallback((line: string) => {
    setLog((l) => [...l.slice(-40), `${new Date().toLocaleTimeString()}  ${line}`]);
  }, []);

  const connect = () => {
    if (!token.trim() || phone) return;
    const sp = createSoftphone({ getToken: async () => token.trim() });
    sp.on("status", (s, err) => {
      setStatus(s + (err ? ` — ${err.message}` : ""));
      append(`status: ${s}${err ? ` (${err.message})` : ""}`);
    });
    sp.on("incoming", (c) => append(`INCOMING from ${c.remoteNumber}`));
    sp.on("call", (c) =>
      append(
        `call ${c.direction} → ${c.state}${c.muted ? " (muted)" : ""}${
          c.state === "ended" && c.endedReason ? ` — cause: ${c.endedReason}` : ""
        }`,
      ),
    );
    setPhone(sp);
    void sp.connect().catch((e) => append(`connect failed: ${e.message}`));
  };

  const disconnect = () => {
    phone?.disconnect();
    setPhone(null);
    setStatus("idle");
    append("disconnected");
  };

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-12">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Softphone lab</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live-fire testing against the real carrier edge. Mint a token via{" "}
          <code className="font-mono text-[12px]">POST /v1/web_clients/&#123;id&#125;/tokens</code> and paste it below.
          Nothing is stored.
        </p>
      </div>

      {!phone ? (
        <div className="space-y-3 rounded-lg border p-4">
          <label className="block text-sm font-medium" htmlFor="lab-token">
            Login token
          </label>
          <textarea
            id="lab-token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            rows={3}
            placeholder="eyJhbGciOi…"
            className="w-full rounded-md border bg-transparent px-3 py-2 font-mono text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <label className="block text-sm font-medium" htmlFor="lab-caller">
            Caller number (outbound caller ID, E.164)
          </label>
          <input
            id="lab-caller"
            value={callerNumber}
            onChange={(e) => setCallerNumber(e.target.value)}
            placeholder="+14152595084"
            className="w-full rounded-md border bg-transparent px-3 py-2 font-mono text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <button
            type="button"
            onClick={connect}
            disabled={!token.trim()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Connect
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border px-4 py-2.5">
            <span className="text-sm">
              Status: <span className="font-medium">{status}</span>
            </span>
            <button type="button" onClick={disconnect} className="text-sm text-destructive hover:underline">
              Disconnect
            </button>
          </div>
          <div className="flex flex-wrap items-start gap-6">
            <Dialer softphone={phone} callerNumber={callerNumber || undefined} />
            <div className="min-w-64 flex-1 space-y-3">
              <CallHUD softphone={phone} />
              <IncomingCallToast softphone={phone} position="static" />
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">Event log</p>
        <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap font-mono text-[11.5px] leading-relaxed text-muted-foreground">
          {log.length ? log.join("\n") : "—"}
        </pre>
      </div>
    </main>
  );
}
