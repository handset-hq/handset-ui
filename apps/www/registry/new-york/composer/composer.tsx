"use client";

import * as React from "react";
import { useComposer, type UseComposerOptions } from "@handset/react";
import { SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComposerProps extends UseComposerOptions {
  placeholder?: string;
  className?: string;
}

/**
 * Message composer with live SMS segment counting. Pair it with
 * `useThread(...).send`, or hand it any send function.
 */
export function Composer({ send, disabled, placeholder = "Type a message…", className }: ComposerProps) {
  const composer = useComposer({ send, disabled });
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void composer.submit();
    }
  };

  const { segmentInfo } = composer;

  return (
    <div className={cn("border-t bg-background p-3", className)}>
      {composer.error ? (
        <p className="mb-2 text-xs text-destructive" role="alert">
          Couldn&apos;t send: {composer.error.message}
        </p>
      ) : null}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={composer.body}
          onChange={(e) => composer.setBody(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={disabled ? "This contact has opted out" : placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            "max-h-40 min-h-10 flex-1 resize-none rounded-md border bg-transparent px-3 py-2 text-sm",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
        <button
          type="button"
          onClick={() => void composer.submit()}
          disabled={!composer.canSend}
          aria-label="Send message"
          className={cn(
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground",
            "transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40",
          )}
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </div>
      {composer.body.length > 0 ? (
        <p className="mt-1.5 text-right text-[11px] tabular-nums text-muted-foreground">
          {segmentInfo.segments} segment{segmentInfo.segments === 1 ? "" : "s"}
          {" · "}
          {segmentInfo.remaining} left
          {segmentInfo.encoding === "ucs2" ? " · unicode" : ""}
        </p>
      ) : null}
    </div>
  );
}
