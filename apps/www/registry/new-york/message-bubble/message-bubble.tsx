"use client";

import * as React from "react";
import type { OutgoingMessage } from "@handset/react";
import { cn } from "@/lib/utils";
import { DeliveryStatus } from "@/components/handset/delivery-status";

export interface MessageBubbleProps {
  message: OutgoingMessage;
  /** Hide the timestamp + delivery row (used when grouping bubbles). */
  hideMeta?: boolean;
  className?: string;
}

/**
 * One message in a conversation: an SMS/MMS bubble aligned by direction, with
 * media previews, an optimistic (dimmed) pending state, and a timestamp +
 * delivery indicator on outbound messages.
 */
export function MessageBubble({ message, hideMeta, className }: MessageBubbleProps) {
  const outbound = message.direction === "outbound";
  return (
    <div className={cn("flex", outbound ? "justify-end" : "justify-start", className)}>
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
        {hideMeta ? null : (
          <span
            className={cn(
              "mt-0.5 flex items-center justify-end gap-1 text-[10px] tabular-nums",
              outbound ? "text-primary-foreground/70" : "text-muted-foreground",
            )}
          >
            {formatMessageTime(message.created_at)}
            {outbound ? <DeliveryStatus status={message.status} /> : null}
          </span>
        )}
      </div>
    </div>
  );
}

/** A message's clock time today, or its short date on earlier days. */
export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
