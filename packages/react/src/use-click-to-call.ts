"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useHandsetClient } from "./provider";
import { isCallActive, type Call } from "./voice-types";

export interface PlaceCallInput {
  /** A tenant number id (`num_…`) or its E.164 — the caller ID both parties see. */
  from: string;
  /** The customer's number, E.164. */
  to: string;
  /** The agent's number, E.164 — rings first. */
  connectTo: string;
  /** Stream live speech-to-text (billed per transcribed minute). */
  transcribe?: boolean;
}

export interface UseClickToCallOptions {
  /** How often to poll the active call's status, ms. Default 2000. */
  pollMs?: number;
  /** Called whenever the active call's status changes. */
  onStatusChange?: (call: Call) => void;
}

export interface UseClickToCallResult {
  /** The current/most recent call, updated while it progresses. */
  call: Call | null;
  /** True from place() until the call reaches a terminal status. */
  isActive: boolean;
  isPlacing: boolean;
  error: Error | null;
  place: (input: PlaceCallInput) => Promise<Call>;
  /** Forget the finished call (returns the button to idle). */
  reset: () => void;
}

/**
 * Click-to-call: POST /calls (agent rings first, customer bridged on
 * answer), then follow the call's status until it settles.
 */
export function useClickToCall(options: UseClickToCallOptions = {}): UseClickToCallResult {
  const { pollMs = 2000, onStatusChange } = options;
  const client = useHandsetClient();
  const [call, setCall] = useState<Call | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;

  const isActive = call !== null && isCallActive(call.status);

  useEffect(() => {
    if (!call || !isCallActive(call.status)) return;
    const timer = setInterval(() => {
      void (async () => {
        try {
          const fresh = await client.request<Call>("GET", `/calls/${call.id}`);
          setCall((prev) => {
            if (prev?.id === fresh.id && prev.status !== fresh.status) {
              onStatusChangeRef.current?.(fresh);
            }
            return prev?.id === fresh.id ? fresh : prev;
          });
        } catch {
          // transient poll failure — keep the last known state
        }
      })();
    }, pollMs);
    return () => clearInterval(timer);
  }, [client, call, pollMs]);

  const place = useCallback(
    async (input: PlaceCallInput): Promise<Call> => {
      setIsPlacing(true);
      setError(null);
      try {
        const created = await client.request<Call>("POST", "/calls", {
          body: {
            from: input.from,
            to: input.to,
            connect_to: input.connectTo,
            transcribe: input.transcribe,
          },
        });
        setCall(created);
        onStatusChangeRef.current?.(created);
        return created;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsPlacing(false);
      }
    },
    [client],
  );

  const reset = useCallback(() => {
    setCall(null);
    setError(null);
  }, []);

  return { call, isActive, isPlacing, error, place, reset };
}
