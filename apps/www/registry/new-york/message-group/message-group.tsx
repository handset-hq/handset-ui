"use client";

import * as React from "react";
import type { OutgoingMessage } from "@handset/react";
import { cn } from "@/lib/utils";
import { MessageBubble } from "@/components/handset/message-bubble";

export interface MessageGroupProps {
  /** Consecutive messages from the same side, in chronological order. */
  messages: OutgoingMessage[];
  className?: string;
}

/**
 * A run of consecutive same-direction messages, stacked tightly with a single
 * timestamp + delivery line on the last bubble (iMessage-style grouping).
 */
export function MessageGroup({ messages, className }: MessageGroupProps) {
  if (messages.length === 0) return null;
  const last = messages.length - 1;
  return (
    <div className={cn("space-y-0.5", className)}>
      {messages.map((m, i) => (
        <MessageBubble key={m.id} message={m} hideMeta={i !== last} />
      ))}
    </div>
  );
}

/** Split a flat, chronological message list into same-direction runs. */
export function groupMessages(messages: OutgoingMessage[]): OutgoingMessage[][] {
  const groups: OutgoingMessage[][] = [];
  for (const m of messages) {
    const current = groups[groups.length - 1];
    if (current && current[0].direction === m.direction) current.push(m);
    else groups.push([m]);
  }
  return groups;
}
