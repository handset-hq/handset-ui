"use client";

import { useCallback, useRef, useState } from "react";
import { useHandsetClient } from "./provider";
import { usePoll } from "./use-poll";
import type { Page } from "./types";
import type { Call } from "./voice-types";

export interface UseCallsOptions {
  tenantId?: string;
  phoneNumberId?: string;
  /** Poll interval in ms. 0 disables polling. Default 10000. */
  pollMs?: number;
  limit?: number;
}

export interface UseCallsResult {
  calls: Call[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

/** A polling call history, newest first. */
export function useCalls(options: UseCallsOptions = {}): UseCallsResult {
  const { tenantId, phoneNumberId, pollMs = 10000, limit = 25 } = options;
  const client = useHandsetClient();
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const cursorRef = useRef<string | null>(null);
  const loadingMoreRef = useRef(false);

  const merge = (prev: Call[], fresh: Call[]) => {
    const byId = new Map<string, Call>();
    for (const c of [...prev, ...fresh]) byId.set(c.id, c);
    return [...byId.values()].sort((a, b) => Date.parse(b.started_at) - Date.parse(a.started_at));
  };

  const fetchFirstPage = useCallback(async () => {
    try {
      const page = await client.request<Page<Call>>("GET", "/calls", {
        query: { tenant_id: tenantId, phone_number_id: phoneNumberId, limit },
      });
      setCalls((prev) => merge(prev, page.data));
      if (cursorRef.current === null) {
        cursorRef.current = page.next_cursor ?? null;
        setHasMore(page.has_more);
      }
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [client, tenantId, phoneNumberId, limit]);

  usePoll(() => void fetchFirstPage(), pollMs, [fetchFirstPage]);

  const loadMore = useCallback(async () => {
    if (!cursorRef.current || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    try {
      const page = await client.request<Page<Call>>("GET", "/calls", {
        query: { tenant_id: tenantId, phone_number_id: phoneNumberId, limit, after: cursorRef.current },
      });
      cursorRef.current = page.next_cursor ?? null;
      setHasMore(page.has_more);
      setCalls((prev) => merge(prev, page.data));
    } catch (err) {
      setError(err as Error);
    } finally {
      loadingMoreRef.current = false;
    }
  }, [client, tenantId, phoneNumberId, limit]);

  return { calls, isLoading, error, hasMore, loadMore, refresh: fetchFirstPage };
}
