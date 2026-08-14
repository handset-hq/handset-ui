"use client";

import { useCallback, useState } from "react";
import { useHandsetClient } from "./provider";
import { usePoll } from "./use-poll";
import { HandsetRequestError } from "./client";
import type { CallTranscript } from "./voice-types";

export interface UseCallTranscriptOptions {
  /**
   * Poll interval in ms — use ~2000 while a call is live, 0 for a one-shot
   * fetch of a finished call. Default 0.
   */
  pollMs?: number;
}

export interface UseCallTranscriptResult {
  transcript: CallTranscript | null;
  /** True when the call has no transcript (transcription wasn't enabled). */
  isEmpty: boolean;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/** The accumulated transcript of a call, optionally polled while it's live. */
export function useCallTranscript(
  callId: string | null,
  options: UseCallTranscriptOptions = {},
): UseCallTranscriptResult {
  const { pollMs = 0 } = options;
  const client = useHandsetClient();
  const [transcript, setTranscript] = useState<CallTranscript | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTranscript = useCallback(async () => {
    if (!callId) return;
    try {
      const result = await client.request<CallTranscript>("GET", `/calls/${callId}/transcript`);
      setTranscript(result);
      setIsEmpty(result.segments.length === 0);
      setError(null);
    } catch (err) {
      if (err instanceof HandsetRequestError && err.status === 404) {
        setIsEmpty(true);
        setError(null);
      } else {
        setError(err as Error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [client, callId]);

  usePoll(() => void fetchTranscript(), callId ? pollMs : 0, [fetchTranscript]);

  return { transcript, isEmpty, isLoading, error, refresh: fetchTranscript };
}
