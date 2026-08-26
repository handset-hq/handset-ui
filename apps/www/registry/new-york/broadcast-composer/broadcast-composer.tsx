"use client";

import * as React from "react";
import { useHandsetClient, countSegments } from "@handset/react";
import { cn } from "@/lib/utils";

interface SendResult {
  to: string;
  status: "sent" | "failed";
  reason?: string;
}

export interface BroadcastComposerProps {
  /** The tenant number to send from (num_…). */
  fromNumberId: string;
  onComplete?: (summary: { sent: number; failed: number }) => void;
  className?: string;
}

/**
 * Send one message to many recipients, one API call each. Opt-outs are
 * respected by the API — a recipient who texted STOP comes back failed with
 * recipient_opted_out and is never messaged — and each result is shown so you
 * can see exactly who got it. Every send carries a per-recipient
 * Idempotency-Key so a retry can't double-send.
 */
export function BroadcastComposer({ fromNumberId, onComplete, className }: BroadcastComposerProps) {
  const client = useHandsetClient();
  const [raw, setRaw] = React.useState("");
  const [body, setBody] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [results, setResults] = React.useState<SendResult[] | null>(null);

  const recipients = React.useMemo(
    () => Array.from(new Set(raw.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean))),
    [raw],
  );
  const seg = countSegments(body);

  const send = async () => {
    setSending(true);
    setResults([]);
    const out: SendResult[] = [];
    const batch = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(recipients.length);
    for (const to of recipients) {
      try {
        await client.request("POST", "/messages", {
          body: { from: fromNumberId, to, body },
          headers: { "Idempotency-Key": `bcast_${batch}_${to}` },
        });
        out.push({ to, status: "sent" });
      } catch (err) {
        out.push({ to, status: "failed", reason: err instanceof Error ? err.message : "Send failed" });
      }
      setResults([...out]);
    }
    setSending(false);
    onComplete?.({
      sent: out.filter((r) => r.status === "sent").length,
      failed: out.filter((r) => r.status === "failed").length,
    });
  };

  const done = results && !sending ? results : null;

  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <label htmlFor="bcast-to" className="mb-1 block text-sm font-medium">
        Recipients <span className="font-normal text-muted-foreground">· E.164, one per line or comma-separated</span>
      </label>
      <textarea
        id="bcast-to"
        rows={3}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        disabled={sending}
        placeholder={"+14155550142\n+14155550143"}
        className={inputCls}
      />
      <label htmlFor="bcast-body" className="mb-1 mt-4 block text-sm font-medium">
        Message
      </label>
      <textarea
        id="bcast-body"
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={sending}
        placeholder="Reminder: the office is closed Monday for the holiday."
        className={inputCls}
      />

      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {recipients.length} recipient{recipients.length === 1 ? "" : "s"} · {seg.segments} segment
          {seg.segments === 1 ? "" : "s"} each{seg.encoding === "ucs2" ? " (Unicode)" : ""}
        </span>
        <span className="tabular-nums">{recipients.length * seg.segments} total</span>
      </div>

      {results ? (
        <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto border-t pt-3 text-sm">
          {results.map((r) => (
            <li key={r.to} className="flex items-center gap-2">
              <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", r.status === "sent" ? "bg-primary" : "bg-destructive")} />
              <span className="font-mono text-xs">{r.to}</span>
              {r.status === "failed" && r.reason ? (
                <span className="truncate text-xs text-muted-foreground">— {r.reason}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {done ? (
        <p className="mt-3 text-sm">
          <span className="font-medium">{done.filter((r) => r.status === "sent").length} sent</span>
          {done.some((r) => r.status === "failed") ? (
            <span className="text-muted-foreground">
              {" "}· {done.filter((r) => r.status === "failed").length} skipped (opted out or invalid)
            </span>
          ) : null}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void send()}
        disabled={sending || recipients.length === 0 || body.trim().length === 0}
        className={cn(
          "mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
          "transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50",
        )}
      >
        {sending ? `Sending… (${results?.length ?? 0}/${recipients.length})` : `Send to ${recipients.length}`}
      </button>
    </div>
  );
}

const inputCls = cn(
  "w-full rounded-md border bg-transparent px-3 py-2 text-sm",
  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
);
