"use client";

import * as React from "react";
import { useHandsetClient, countSegments } from "@handset/react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SentMessage {
  id: string;
  status: string;
  scheduled_at?: string | null;
}

export interface ScheduledComposerProps {
  /** The tenant number to send from (num_…). */
  fromNumberId: string;
  /** Recipient in E.164. */
  to: string;
  onSent?: (message: SentMessage) => void;
  className?: string;
}

/**
 * A composer that can send now or schedule for later. Toggling "Send later"
 * reveals a date/time picker; on send it POSTs `send_at` to the API, which
 * parks the message in `scheduled` status until then. Sending immediately is
 * unchanged.
 */
export function ScheduledComposer({ fromNumberId, to, onSent, className }: ScheduledComposerProps) {
  const client = useHandsetClient();
  const [body, setBody] = React.useState("");
  const [later, setLater] = React.useState(false);
  const [when, setWhen] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState<SentMessage | null>(null);

  const seg = countSegments(body);
  const minWhen = localDatetimeValue(new Date(Date.now() + 60_000));

  const send = async () => {
    setError(null);
    let sendAt: string | undefined;
    if (later) {
      if (!when) {
        setError("Pick a date and time to schedule.");
        return;
      }
      const at = new Date(when);
      if (Number.isNaN(at.getTime()) || at.getTime() <= Date.now()) {
        setError("Schedule a time in the future.");
        return;
      }
      sendAt = at.toISOString();
    }
    setSending(true);
    try {
      const msg = await client.request<SentMessage>("POST", "/messages", {
        body: { from: fromNumberId, to, body, ...(sendAt ? { send_at: sendAt } : {}) },
        headers: { "Idempotency-Key": idempotencyKey() },
      });
      setDone(msg);
      onSent?.(msg);
      setBody("");
      setLater(false);
      setWhen("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the message.");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    const scheduled = done.status === "scheduled" && done.scheduled_at;
    return (
      <div className={cn("rounded-lg border p-4 text-sm", className)} role="status">
        {scheduled ? (
          <p>
            <span className="font-medium">Scheduled.</span>{" "}
            <span className="text-muted-foreground">
              Sends {new Date(done.scheduled_at!).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}.
            </span>
          </p>
        ) : (
          <p>
            <span className="font-medium">Sent.</span>{" "}
            <span className="text-muted-foreground">On its way now.</span>
          </p>
        )}
        <button type="button" onClick={() => setDone(null)} className="mt-2 text-sm font-medium text-primary hover:underline">
          Write another
        </button>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border p-3", className)}>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={sending}
        rows={3}
        placeholder="Type a message…"
        className={cn(
          "w-full resize-none bg-transparent text-sm",
          "placeholder:text-muted-foreground focus-visible:outline-none",
        )}
      />

      {later ? (
        <div className="mt-2 flex items-center gap-2 border-t pt-2">
          <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="datetime-local"
            value={when}
            min={minWhen}
            onChange={(e) => setWhen(e.target.value)}
            className="rounded-md border bg-transparent px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      ) : null}

      {error ? <p className="mt-2 text-xs text-destructive" role="alert">{error}</p> : null}

      <div className="mt-2 flex items-center justify-between border-t pt-2">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={later} onChange={(e) => setLater(e.target.checked)} className="h-3.5 w-3.5 accent-[var(--color-primary)]" />
          Send later
        </label>
        <div className="flex items-center gap-3">
          {body ? (
            <span className="text-xs tabular-nums text-muted-foreground">
              {seg.segments} seg{seg.encoding === "ucs2" ? " · Unicode" : ""}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => void send()}
            disabled={sending || body.trim().length === 0}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
          >
            {sending ? "…" : later ? "Schedule" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** A local `datetime-local` value (YYYY-MM-DDTHH:mm) for the input's min. */
function localDatetimeValue(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function idempotencyKey(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `sc_${Date.now()}`;
}
