"use client";

import * as React from "react";
import { useThread, type OutgoingMessage, type UseThreadOptions } from "@handset/react";
import { cn } from "@/lib/utils";
import { Composer } from "@/components/handset/composer";
import { MessageGroup } from "@/components/handset/message-group";
import { DateDivider, isSameDay } from "@/components/handset/date-divider";

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
          renderTimeline(thread.messages)
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

/**
 * Walk a flat, chronological message list into rendered rows: a DateDivider
 * whenever the calendar day changes, and a MessageGroup for each run of
 * consecutive same-direction messages within a day.
 */
function renderTimeline(messages: OutgoingMessage[]): React.ReactNode[] {
  const rows: React.ReactNode[] = [];
  let run: OutgoingMessage[] = [];
  let prev: OutgoingMessage | null = null;

  const flush = () => {
    if (run.length) {
      rows.push(<MessageGroup key={run[0].id} messages={run} />);
      run = [];
    }
  };

  for (const m of messages) {
    if (!prev || !isSameDay(prev.created_at, m.created_at)) {
      flush();
      rows.push(<DateDivider key={`divider-${m.id}`} date={m.created_at} />);
    } else if (prev.direction !== m.direction) {
      flush();
    }
    run.push(m);
    prev = m;
  }
  flush();
  return rows;
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
