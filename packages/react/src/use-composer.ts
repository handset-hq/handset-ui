"use client";

import { useCallback, useMemo, useState } from "react";
import { countSegments, type SegmentInfo } from "./segments";
import type { Message } from "./types";
import type { SendInput } from "./use-thread";

/** The API's per-message media limit. */
export const MAX_ATTACHMENTS = 10;

export interface UseComposerOptions {
  /** Usually `useThread(...).send`. Any (input) => Promise<Message> works. */
  send: (input: SendInput) => Promise<Message>;
  /** Disable sending (e.g. conversation.opted_out). */
  disabled?: boolean;
}

export interface UseComposerResult {
  body: string;
  setBody: (value: string) => void;
  /** Live segment/encoding info for the current draft. */
  segmentInfo: SegmentInfo;
  /**
   * Media URLs attached to the draft (sent as `media_urls`, making the
   * message an MMS). Public https:// URLs — host the file yourself and
   * attach its URL; carriers fetch it once at send time.
   */
  attachments: string[];
  /** Attach a media URL. Deduped; capped at MAX_ATTACHMENTS (10). */
  addAttachment: (url: string) => void;
  removeAttachment: (url: string) => void;
  /** True when there is content to send and sending is allowed. */
  canSend: boolean;
  isSending: boolean;
  error: Error | null;
  /** Send the draft; clears it on success, preserves it on failure. */
  submit: () => Promise<void>;
}

/**
 * Draft state + segment counting + MMS attachments + submit wiring for a
 * message composer.
 */
export function useComposer({ send, disabled = false }: UseComposerOptions): UseComposerResult {
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const segmentInfo = useMemo(() => countSegments(body), [body]);
  const canSend = !disabled && !isSending && (body.trim().length > 0 || attachments.length > 0);

  const addAttachment = useCallback((url: string) => {
    setAttachments((prev) =>
      prev.includes(url) || prev.length >= MAX_ATTACHMENTS ? prev : [...prev, url],
    );
  }, []);
  const removeAttachment = useCallback((url: string) => {
    setAttachments((prev) => prev.filter((u) => u !== url));
  }, []);

  const submit = useCallback(async () => {
    if (!canSend) return;
    const draft = body;
    const media = attachments;
    setIsSending(true);
    setError(null);
    setBody("");
    setAttachments([]);
    try {
      await send({ body: draft, mediaUrls: media.length > 0 ? media : undefined });
    } catch (err) {
      setBody(draft); // give the user their draft back
      setAttachments(media);
      setError(err as Error);
    } finally {
      setIsSending(false);
    }
  }, [body, attachments, canSend, send]);

  return {
    body,
    setBody,
    segmentInfo,
    attachments,
    addAttachment,
    removeAttachment,
    canSend,
    isSending,
    error,
    submit,
  };
}
