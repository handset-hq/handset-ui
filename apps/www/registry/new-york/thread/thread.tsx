"use client";

import * as React from "react";
import { useThread, type OutgoingMessage, type UseThreadOptions } from "@handset/react";
import { AlertCircle, Check, CheckCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Composer } from "@/components/handset/composer";

export interface ThreadProps extends UseThreadOptions {
  conversationId: string | null;
  className?: string;
  /** Hide the built-in composer to render your own. */
  hideComposer?: boolean;
}

/**
 * A full SMS conversation: polled message history, delivery states,
 * opt-out awareness, and a composer wired to reply in place.
 */
export function Thread({ conversationId, className, hideComposer, ...options }: ThreadProps) {
  const thread = useThread(conversationId, options);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const lastCountRef = React.useRef(0);

  React.useEffect(() => {
    if (thread.messages.length !== lastCountRef.current) {
      lastCountRef.current = thread.messages.length;
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }
  }, [thread.messages.length]);

  if (!conversationId) {
    return (
      <div className={cn("flex h-full items-center justify-center text-sm text-muted-foreground", className)}>
        Select a conversation
      </div>
    );
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-4">
        {thread.isLoading && thread.messages.length === 0 ? (
          <ThreadSkeleton />
        ) : (
          thread.messages.map((message) => <MessageBubble key={message.id} message={message} />)
        )}
        {thread.error && thread.messages.length === 0 ? (
          <p className="text-center text-sm text-destructive">{thread.error.message}</p>
        ) : null}
      </div>
      {thread.conversation?.opted_out ? (
        <p className="border-t bg-muted px-4 py-2 text-center text-xs text-muted-foreground">
          This contact texted STOP and won&apos;t receive messages. They can text START to opt back in.
        </p>
      ) : null}
      {hideComposer ? null : <Composer send={thread.send} disabled={thread.conversation?.opted_out} />}
    </div>
  );
}

function MessageBubble({ message }: { message: OutgoingMessage }) {
  const outbound = message.direction === "outbound";
  return (
    <div className={cn("flex", outbound ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
          outbound ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted",
          message.pending && "opacity-70",
        )}
      >
        {message.media_urls?.map((url) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={url} src={url} alt="MMS attachment" className="mb-1 max-h-64 rounded-lg" />
        ))}
        {message.body ? <p className="whitespace-pre-wrap break-words">{message.body}</p> : null}
        <span
          className={cn(
            "mt-0.5 flex items-center justify-end gap-1 text-[10px] tabular-nums",
            outbound ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {formatTime(message.created_at)}
          {outbound ? <StatusIcon status={message.status} /> : null}
        </span>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: OutgoingMessage["status"] }) {
  switch (status) {
    case "queued":
    case "sending":
      return <Clock className="h-3 w-3" aria-label="Sending" />;
    case "sent":
      return <Check className="h-3 w-3" aria-label="Sent" />;
    case "delivered":
      return <CheckCheck className="h-3 w-3" aria-label="Delivered" />;
    case "failed":
      return <AlertCircle className="h-3 w-3 text-destructive" aria-label="Failed" />;
    default:
      return null;
  }
}

function ThreadSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {[64, 40, 72, 48].map((w, i) => (
        <div key={i} className={cn("flex", i % 2 ? "justify-end" : "justify-start")}>
          <div className="h-9 animate-pulse rounded-2xl bg-muted" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  );
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
