"use client";

import { useCallback, useState } from "react";
import { useHandsetClient } from "./provider";
import { usePoll } from "./use-poll";
import type { PortIn } from "./number-types";
import { relaxedPoll, useRealtimeFamily } from "./use-realtime";

export interface UsePortInOptions {
  /** Poll interval in ms. Default 30000 — ports move slowly. 0 fetches once. */
  pollMs?: number;
}

export interface UsePortInResult {
  portIn: PortIn | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/** Follow one port-in request through its lifecycle. */
export function usePortIn(portInId: string | null, options: UsePortInOptions = {}): UsePortInResult {
  const { pollMs = 30000 } = options;
  const client = useHandsetClient();
  const [portIn, setPortIn] = useState<PortIn | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPortIn = useCallback(async () => {
    if (!portInId) return;
    try {
      const fresh = await client.request<PortIn>("GET", `/port_ins/${portInId}`);
      setPortIn(fresh);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [client, portInId]);

  const rt = useRealtimeFamily("ports");
  usePoll(() => void fetchPortIn(), portInId ? relaxedPoll(pollMs, rt.connected) : 0, [fetchPortIn, rt.version]);

  return { portIn, isLoading, error, refresh: fetchPortIn };
}
