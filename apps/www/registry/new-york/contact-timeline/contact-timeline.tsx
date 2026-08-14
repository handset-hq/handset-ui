"use client";

import * as React from "react";
import {
  useContactTimeline,
  useThread,
  type Call,
  type Message,
  type TimelineEvent,
  type UseContactTimelineOptions,
} from "@handset/react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VoicemailPlayer } from "@/components/handset/voicemail-player";
import { CallTranscriptView } from "@/components/handset/call-transcript";
import { Composer } from "@/components/handset/composer";

export interface ContactTimelineProps extends UseContactTimelineOptions {
  /** The customer's number, E.164. */
  externalNumber: string | null;
  /** Show a composer at the bottom to text the contact in place. */
  withComposer?: boolean;
  className?: string;
}

/**
 * The whole relationship in one scroll: every message, call, and voicemail
 * with one customer, newest first. Built for CRM contact panels.
 */
export function ContactTimeline({ externalNumber, withComposer, className, ...options }: ContactTimelineProps) {
  const { events, conversation, isLoading, error } = useContactTimeline(externalNumber, options);
  const thread = useThread(withComposer ? (conversation?.id ?? null) : null, { pollMs: 0 });

  if (!externalNumber) return null;

  if (isLoading && events.length === 0) {
    return (
      <div className={cn("space-y-3", className)} aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg border bg-muted/40" />
        ))}
      </div>
    );
  }
  if (error && events.length === 0) {
    return <p className={cn("text-sm text-destructive", className)}>{error.message}</p>;
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {events.length === 0 ? (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No history with this contact yet.
          </p>
        ) : (
          <ol className="relative space-y-4 pl-7">
            <span aria-hidden="true" className="absolute bottom-1 left-[9px] top-1 w-px bg-border" />
            {events.map((event) => (
              <li key={eventKey(event)} className="relative">
                <span className="absolute -left-7 top-0.5 z-10 flex h-5 w-5 items-center justify-center rounded-full border bg-background">
                  <EventIcon event={event} />
                </span>
                {event.type === "message" ? <MessageRow message={event.message} /> : null}
                {event.type === "call" ? <CallRow call={event.call} /> : null}
                {event.type === "voicemail" ? (
                  <VoicemailPlayer voicemail={event.voicemail} className="max-w-md" />
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </div>
      {withComposer && conversation ? (
        <Composer send={thread.send} disabled={conversation.opted_out} className="mt-3 rounded-lg border" />
      ) : null}
    </div>
  );
}

function eventKey(event: TimelineEvent): string {
  switch (event.type) {
    case "message":
      return `message_${event.message.id}`;
    case "call":
      return `call_${event.call.id}`;
    case "voicemail":
      return `voicemail_${event.voicemail.id}`;
  }
}

function EventIcon({ event }: { event: TimelineEvent }) {
  const cls = "h-3 w-3";
  if (event.type === "message") {
    return event.message.direction === "outbound" ? (
      <ArrowUpRight className={cn(cls, "text-primary")} />
    ) : (
      <ArrowDownLeft className={cn(cls, "text-muted-foreground")} />
    );
  }
  if (event.type === "call") {
    const { call } = event;
    if (call.status === "missed" || call.status === "failed") return <PhoneMissed className={cn(cls, "text-destructive")} />;
    return call.direction === "outbound" ? (
      <PhoneOutgoing className={cn(cls, "text-primary")} />
    ) : (
      <PhoneIncoming className={cn(cls, "text-muted-foreground")} />
    );
  }
  return <PhoneIncoming className={cn(cls, "text-muted-foreground")} />;
}

function MessageRow({ message }: { message: Message }) {
  const outbound = message.direction === "outbound";
  return (
    <div className="max-w-md">
      <p
        className={cn(
          "inline-block rounded-lg px-3 py-1.5 text-sm",
          outbound ? "bg-primary/10 text-foreground" : "bg-muted",
        )}
      >
        {message.body}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        {outbound ? "Sent" : "Received"} · {formatWhen(message.created_at)}
        {outbound && message.status === "failed" ? " · failed" : ""}
      </p>
    </div>
  );
}

function CallRow({ call }: { call: Call }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="max-w-md">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="text-left text-sm hover:underline"
      >
        {describeCall(call)}
      </button>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{formatWhen(call.started_at)}</p>
      {open ? (
        <div className="mt-2 rounded-lg border bg-muted/20 p-3">
          <CallTranscriptView callId={call.id} />
        </div>
      ) : null}
    </div>
  );
}

function describeCall(call: Call): string {
  switch (call.status) {
    case "completed":
      return `${call.direction === "outbound" ? "Outgoing" : "Incoming"} call · ${formatDuration(call.duration_seconds ?? 0)}`;
    case "missed":
      return "Missed call";
    case "failed":
      return "Failed call";
    case "voicemail":
      return "Call → voicemail";
    default:
      return "Call in progress…";
  }
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  const sameDay = date.toDateString() === new Date().toDateString();
  if (sameDay) return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
