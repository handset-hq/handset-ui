"use client";

import { useCallback, useMemo, useState } from "react";
import { countSegments, type SegmentInfo } from "./segments";
import type { Message } from "./types";
import type { SendInput } from "./use-thread";

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
  /** True when there is content to send and sending is allowed. */
  canSend: boolean;
  isSending: boolean;
  error: Error | null;
  /** Send the draft; clears it on success, preserves it on failure. */
  submit: () => Promise<void>;
}

/**
 * Draft state + segment counting + submit wiring for a message composer.
 */
export function useComposer({ send, disabled = false }: UseComposerOptions): UseComposerResult {
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const segmentInfo = useMemo(() => countSegments(body), [body]);
  const canSend = !disabled && !isSending && body.trim().length > 0;

  const submit = useCallback(async () => {
    if (!canSend) return;
    const draft = body;
    setIsSending(true);
    setError(null);
    setBody("");
    try {
      await send({ body: draft });
    } catch (err) {
      setBody(draft); // give the user their text back
      setError(err as Error);
    } finally {
      setIsSending(false);
    }
  }, [body, canSend, send]);

  return { body, setBody, segmentInfo, canSend, isSending, error, submit };
}
