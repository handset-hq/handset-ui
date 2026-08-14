"use client";

import * as React from "react";
import { useConversations, type Conversation, type UseConversationsOptions } from "@handset/react";
import { cn } from "@/lib/utils";

export interface InboxProps extends UseConversationsOptions {
  selectedId?: string | null;
  onSelect?: (conversation: Conversation) => void;
  className?: string;
  /** Format the customer number for display. Defaults to a US-style formatter. */
  formatNumber?: (e164: string) => string;
}

/**
 * A polling conversation list: newest activity first, last-message preview,
 * opt-out badges, infinite scroll.
 */
export function Inbox({ selectedId, onSelect, className, formatNumber = formatUS, ...options }: InboxProps) {
  const { conversations, isLoading, error, hasMore, loadMore } = useConversations(options);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) void loadMore();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (isLoading && conversations.length === 0) return <InboxSkeleton className={className} />;

  if (error && conversations.length === 0) {
    return <p className={cn("p-4 text-sm text-destructive", className)}>{error.message}</p>;
  }

  if (conversations.length === 0) {
    return (
      <p className={cn("p-4 text-sm text-muted-foreground", className)}>
        No conversations yet. They&apos;ll appear here when a message is sent or received.
      </p>
    );
  }

  return (
    <div className={cn("h-full overflow-y-auto", className)} role="list">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          type="button"
          role="listitem"
          onClick={() => onSelect?.(conversation)}
          className={cn(
            "flex w-full flex-col gap-0.5 border-b px-4 py-3 text-left transition-colors last:border-b-0",
            "hover:bg-muted/60 focus-visible:outline-none focus-visible:bg-muted/60",
            selectedId === conversation.id && "bg-muted",
          )}
        >
          <span className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-medium">{formatNumber(conversation.external_number)}</span>
            <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
              {relativeTime(conversation.last_activity_at)}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            {conversation.opted_out ? (
              <span className="shrink-0 rounded-sm bg-destructive/10 px-1 py-px text-[10px] font-medium text-destructive">
                STOP
              </span>
            ) : null}
            <span className="truncate text-xs text-muted-foreground">
              {conversation.last_message_preview ?? "No messages"}
            </span>
          </span>
        </button>
      ))}
      {hasMore ? <div ref={sentinelRef} className="h-8" /> : null}
    </div>
  );
}

function InboxSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-px", className)} aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2 border-b px-4 py-3 last:border-b-0">
          <div className="h-3.5 w-32 animate-pulse rounded bg-muted" />
          <div className="h-3 w-48 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

function formatUS(e164: string): string {
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - Date.parse(iso);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
