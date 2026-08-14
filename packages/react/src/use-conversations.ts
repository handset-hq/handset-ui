"use client";

import { useCallback, useRef, useState } from "react";
import { useHandsetClient } from "./provider";
import { usePoll } from "./use-poll";
import type { Conversation, Page } from "./types";

export interface UseConversationsOptions {
  /** Scope to one tenant. Usually unnecessary — your proxy routes scope server-side. */
  tenantId?: string;
  /** Poll interval in ms. 0 disables polling. Default 5000. */
  pollMs?: number;
  /** Page size. Default 50. */
  limit?: number;
}

export interface UseConversationsResult {
  conversations: Conversation[];
  isLoading: boolean;
  error: Error | null;
  /** Fetch the next page and append it. No-op when `hasMore` is false. */
  loadMore: () => Promise<void>;
  hasMore: boolean;
  /** Re-fetch the first page immediately. */
  refresh: () => Promise<void>;
}

/**
 * A polling conversation list, newest activity first. The poll refreshes the
 * first page and merges by id, so pagination state survives updates.
 */
export function useConversations(options: UseConversationsOptions = {}): UseConversationsResult {
  const { tenantId, pollMs = 5000, limit = 50 } = options;
  const client = useHandsetClient();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const cursorRef = useRef<string | null>(null);
  const loadingMoreRef = useRef(false);

  const fetchFirstPage = useCallback(async () => {
    try {
      const page = await client.request<Page<Conversation>>("GET", "/conversations", {
        query: { tenant_id: tenantId, limit },
      });
      setConversations((prev) => mergeFirstPage(prev, page.data));
      // Only the initial load establishes pagination; later polls of page one
      // must not clobber a cursor the user has already advanced past.
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
      const page = await client.request<Page<Conversation>>("GET", "/conversations", {
        query: { tenant_id: tenantId, limit, after: cursorRef.current },
      });
      cursorRef.current = page.next_cursor ?? null;
      setHasMore(page.has_more);
      setConversations((prev) => dedupeById([...prev, ...page.data]));
    } catch (err) {
      setError(err as Error);
    } finally {
      loadingMoreRef.current = false;
    }
  }, [client, tenantId, limit]);

  return { conversations, isLoading, error, loadMore, hasMore, refresh: fetchFirstPage };
}

function dedupeById(items: Conversation[]): Conversation[] {
  const seen = new Map<string, Conversation>();
  for (const item of items) seen.set(item.id, item);
  return [...seen.values()].sort(
    (a, b) => Date.parse(b.last_activity_at) - Date.parse(a.last_activity_at),
  );
}

function mergeFirstPage(prev: Conversation[], fresh: Conversation[]): Conversation[] {
  return dedupeById([...prev, ...fresh]);
}
