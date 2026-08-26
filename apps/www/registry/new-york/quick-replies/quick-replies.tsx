"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface QuickRepliesProps {
  /** Canned reply texts to offer as tappable chips. */
  replies: string[];
  /** Fired with the chosen reply — wire it to your composer's send. */
  onSelect: (text: string) => void | Promise<void>;
  disabled?: boolean;
  className?: string;
}

/**
 * A row of tappable canned responses. Await-aware: the chosen chip dims while
 * onSelect resolves, so a send in flight can't be double-fired.
 */
export function QuickReplies({ replies, onSelect, disabled, className }: QuickRepliesProps) {
  const [busy, setBusy] = React.useState<string | null>(null);

  const pick = async (r: string) => {
    if (disabled || busy) return;
    setBusy(r);
    try {
      await onSelect(r);
    } finally {
      setBusy(null);
    }
  };

  if (replies.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {replies.map((r) => (
        <button
          key={r}
          type="button"
          disabled={disabled || busy !== null}
          onClick={() => void pick(r)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-muted",
            "disabled:pointer-events-none disabled:opacity-50",
            busy === r && "opacity-70",
          )}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
