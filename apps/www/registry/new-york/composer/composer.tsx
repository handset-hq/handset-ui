"use client";

import * as React from "react";
import { useComposer, type UseComposerOptions } from "@handset/react";
import { Paperclip, SendHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComposerProps extends UseComposerOptions {
  placeholder?: string;
  /**
   * Enables the attachment (MMS) button. Called on click; return one or more
   * public https:// media URLs to attach — typically you upload the user's
   * file to your own storage first and return its URL. Return null to cancel.
   */
  onPickAttachment?: () => Promise<string | string[] | null | undefined>;
  className?: string;
}

/**
 * Message composer with live SMS segment counting and MMS attachments.
 * Pair it with `useThread(...).send`, or hand it any send function.
 */
export function Composer({
  send,
  disabled,
  placeholder = "Type a message…",
  onPickAttachment,
  className,
}: ComposerProps) {
  const composer = useComposer({ send, disabled });
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [picking, setPicking] = React.useState(false);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void composer.submit();
    }
  };

  const pickAttachment = async () => {
    if (!onPickAttachment || picking) return;
    setPicking(true);
    try {
      const picked = await onPickAttachment();
      for (const url of Array.isArray(picked) ? picked : picked ? [picked] : []) {
        composer.addAttachment(url);
      }
    } finally {
      setPicking(false);
    }
  };

  const { segmentInfo, attachments } = composer;

  return (
    <div className={cn("border-t bg-background p-3", className)}>
      {composer.error ? (
        <p className="mb-2 text-xs text-destructive" role="alert">
          Couldn&apos;t send: {composer.error.message}
        </p>
      ) : null}
      {attachments.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((url) => (
            <AttachmentChip key={url} url={url} onRemove={() => composer.removeAttachment(url)} />
          ))}
        </div>
      ) : null}
      <div className="flex items-end gap-2">
        {onPickAttachment ? (
          <button
            type="button"
            onClick={() => void pickAttachment()}
            disabled={disabled || picking}
            aria-label="Attach media"
            className={cn(
              "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border text-muted-foreground",
              "transition-colors hover:bg-muted/60 hover:text-foreground",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            <Paperclip className="h-4 w-4" />
          </button>
        ) : null}
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
      {attachments.length > 0 ? (
        <p className="mt-1.5 text-right text-[11px] text-muted-foreground">
          MMS · {attachments.length} attachment{attachments.length === 1 ? "" : "s"} · billed per message
        </p>
      ) : composer.body.length > 0 ? (
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

function AttachmentChip({ url, onRemove }: { url: string; onRemove: () => void }) {
  const name = url.split("/").pop()?.split("?")[0] || url;
  const isImage = /\.(png|jpe?g|gif|webp)$/i.test(name);
  return (
    <span className="inline-flex max-w-56 items-center gap-1.5 rounded-md border bg-muted/40 py-1 pl-1.5 pr-1 text-xs">
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-6 w-6 shrink-0 rounded object-cover" />
      ) : (
        <Paperclip className="h-3 w-3 shrink-0 text-muted-foreground" />
      )}
      <span className="truncate">{name}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${name}`}
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
