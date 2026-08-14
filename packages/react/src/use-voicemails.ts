"use client";

import { useCallback, useRef, useState } from "react";
import { useHandsetClient } from "./provider";
import { usePoll } from "./use-poll";
import type { Page } from "./types";
import type { Voicemail } from "./voice-types";

export interface UseVoicemailsOptions {
  tenantId?: string;
  /** Poll interval in ms. 0 disables polling. Default 15000. */
  pollMs?: number;
  limit?: number;
}

export interface UseVoicemailsResult {
  voicemails: Voicemail[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  /**
   * Re-fetch one voicemail — audio URLs expire after an hour, so players
   * call this to get a fresh `audio_url` when playback fails.
   */
  refreshVoicemail: (id: string) => Promise<Voicemail>;
}

export function useVoicemails(options: UseVoicemailsOptions = {}): UseVoicemailsResult {
  const { tenantId, pollMs = 15000, limit = 25 } = options;
  const client = useHandsetClient();
  const [voicemails, setVoicemails] = useState<Voicemail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const cursorRef = useRef<string | null>(null);
  const loadingMoreRef = useRef(false);

  const merge = (prev: Voicemail[], fresh: Voicemail[]) => {
    const byId = new Map<string, Voicemail>();
    for (const v of [...prev, ...fresh]) byId.set(v.id, v);
    return [...byId.values()].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  };

  const fetchFirstPage = useCallback(async () => {
    try {
      const page = await client.request<Page<Voicemail>>("GET", "/voicemails", {
        query: { tenant_id: tenantId, limit },
      });
      setVoicemails((prev) => merge(prev, page.data));
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
  }, [client, tenantId, limit]);

  usePoll(() => void fetchFirstPage(), pollMs, [fetchFirstPage]);

  const loadMore = useCallback(async () => {
    if (!cursorRef.current || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    try {
      const page = await client.request<Page<Voicemail>>("GET", "/voicemails", {
        query: { tenant_id: tenantId, limit, after: cursorRef.current },
      });
      cursorRef.current = page.next_cursor ?? null;
      setHasMore(page.has_more);
      setVoicemails((prev) => merge(prev, page.data));
    } catch (err) {
      setError(err as Error);
    } finally {
      loadingMoreRef.current = false;
    }
  }, [client, tenantId, limit]);

  const refreshVoicemail = useCallback(
    async (id: string): Promise<Voicemail> => {
      const fresh = await client.request<Voicemail>("GET", `/voicemails/${id}`);
      setVoicemails((prev) => prev.map((v) => (v.id === id ? fresh : v)));
      return fresh;
    },
    [client],
  );

  return { voicemails, isLoading, error, hasMore, loadMore, refresh: fetchFirstPage, refreshVoicemail };
}
