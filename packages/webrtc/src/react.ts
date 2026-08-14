"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DialInput, Softphone, SoftphoneCall, SoftphoneStatus } from "./types";

export interface UseSoftphoneOptions {
  /**
   * The softphone instance to drive. Create it once (module scope or
   * useMemo) with createSoftphone({ getToken }) — or createDemoSoftphone()
   * in demos and tests.
   */
  softphone: Softphone;
  /** Connect automatically on mount. Default true. */
  autoConnect?: boolean;
}

export interface UseSoftphoneResult {
  status: SoftphoneStatus;
  error: Error | null;
  /** The current non-ended call, re-rendered on every change. */
  call: SoftphoneCall | null;
  /** An unanswered inbound call, until answered/rejected/ended. */
  incoming: SoftphoneCall | null;
  dial: (input: DialInput) => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => void;
  /** Seconds the current call has been active; 0 before answer. */
  elapsedSeconds: number;
}

/**
 * React binding for a Softphone: subscribes to status/call events, keeps a
 * ticking call timer, and hands back plain state your components render.
 */
export function useSoftphone({ softphone, autoConnect = true }: UseSoftphoneOptions): UseSoftphoneResult {
  const [status, setStatus] = useState<SoftphoneStatus>(softphone.status);
  const [error, setError] = useState<Error | null>(null);
  const [call, setCall] = useState<SoftphoneCall | null>(softphone.activeCall);
  const [incoming, setIncoming] = useState<SoftphoneCall | null>(null);
  const [, forceRender] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const phoneRef = useRef(softphone);
  phoneRef.current = softphone;

  useEffect(() => {
    const offStatus = softphone.on("status", (next, err) => {
      setStatus(next);
      setError(err ?? null);
    });
    const offIncoming = softphone.on("incoming", (ringing) => {
      setIncoming(ringing);
      const stop = ringing.onChange((c) => {
        if (c.state !== "ringing") {
          setIncoming((current) => (current === ringing ? null : current));
          stop();
        }
      });
    });
    const offCall = softphone.on("call", (changed) => {
      setCall(changed.state === "ended" ? null : changed);
      forceRender((n) => n + 1);
    });
    if (autoConnect && softphone.status === "idle") {
      void softphone.connect().catch(() => undefined);
    }
    return () => {
      offStatus();
      offIncoming();
      offCall();
    };
  }, [softphone, autoConnect]);

  useEffect(() => {
    if (!call || call.state !== "active" || !call.startedAt) {
      setElapsedSeconds(0);
      return;
    }
    const started = call.startedAt.getTime();
    const tick = () => setElapsedSeconds(Math.max(0, Math.floor((Date.now() - started) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [call, call?.state]);

  const dial = useCallback(async (input: DialInput) => {
    const placed = await phoneRef.current.dial(input);
    setCall(placed);
  }, []);

  const connect = useCallback(() => phoneRef.current.connect(), []);
  const disconnect = useCallback(() => phoneRef.current.disconnect(), []);

  return { status, error, call, incoming, dial, connect, disconnect, elapsedSeconds };
}

export type { DialInput, Softphone, SoftphoneCall, SoftphoneStatus } from "./types";
