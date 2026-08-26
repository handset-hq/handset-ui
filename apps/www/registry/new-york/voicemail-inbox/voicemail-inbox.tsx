"use client";

import * as React from "react";
import { useVoicemails, type UseVoicemailsOptions, type Voicemail } from "@handset/react";
import { Voicemail as VoicemailIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoicemailPlayer } from "@/components/handset/voicemail-player";

export interface VoicemailInboxProps extends UseVoicemailsOptions {
  className?: string;
}

/**
 * A voicemail list with unread tracking: newest first, an unread dot until a
 * row is opened, and the full VoicemailPlayer inline on the open row. Unread
 * state is local (the API has no read flag) so it resets per session.
 */
export function VoicemailInbox({ className, ...options }: VoicemailInboxProps) {
  const { voicemails, isLoading, error, hasMore, loadMore, refreshVoicemail } = useVoicemails(options);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [read, setRead] = React.useState<Set<string>>(() => new Set());

  const unread = voicemails.filter((v) => !read.has(v.id)).length;

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
    setRead((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  };

  return (
    <div className={cn("overflow-hidden rounded-lg border", className)}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-medium">
          <VoicemailIcon className="h-4 w-4 text-muted-foreground" />
          Voicemail
        </p>
        {unread > 0 ? (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{unread} new</span>
        ) : null}
      </div>

      {isLoading && voicemails.length === 0 ? (
        <div className="divide-y" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-muted" />
              <div className="h-8 flex-1 animate-pulse rounded bg-muted/60" />
            </div>
          ))}
        </div>
      ) : error && voicemails.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-destructive">{error.message}</p>
      ) : voicemails.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">No voicemails yet.</p>
      ) : (
        <ul className="divide-y">
          {voicemails.map((v) => {
            const isUnread = !read.has(v.id);
            const isOpen = openId === v.id;
            return (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => toggle(v.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                >
                  <span
                    aria-label={isUnread ? "Unread" : undefined}
                    className={cn("h-2 w-2 shrink-0 rounded-full", isUnread ? "bg-primary" : "bg-transparent")}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={cn("truncate text-sm", isUnread && "font-semibold")}>
                        {v.from ?? "Unknown caller"}
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{formatWhen(v.created_at)}</span>
                    </div>
                    {v.transcript ? (
                      <p className="truncate text-xs text-muted-foreground">{v.transcript}</p>
                    ) : (
                      <p className="text-xs italic text-muted-foreground">Transcribing…</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {formatDuration(v.duration_seconds)}
                  </span>
                </button>
                {isOpen ? (
                  <div className="px-4 pb-4">
                    <VoicemailPlayer voicemail={v} onExpired={refreshVoicemail} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {hasMore ? (
        <button
          type="button"
          onClick={() => void loadMore()}
          className="w-full border-t py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          Load older
        </button>
      ) : null}
    </div>
  );
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
