"use client";

import { useCallback, useRef, useState } from "react";
import { useHandsetClient } from "./provider";
import { usePoll } from "./use-poll";
import type { Conversation, Message, OutgoingMessage, Page } from "./types";

export interface UseThreadOptions {
  /** Poll interval in ms. 0 disables polling. Default 3000. */
  pollMs?: number;
  /** Max messages fetched per poll. Default 100. */
  limit?: number;
}

export interface SendInput {
  body?: string;
  mediaUrls?: string[];
  metadata?: Record<string, string>;
}

export interface UseThreadResult {
  conversation: Conversation | null;
  /** Oldest first — render top to bottom. Includes optimistic outgoing messages. */
  messages: OutgoingMessage[];
  isLoading: boolean;
  error: Error | null;
  /**
   * Send a reply in this conversation. From/to are derived from the
   * conversation, an optimistic message appears immediately, and the API's
   * 202 response replaces it. Throws on failure (the optimistic entry flips
   * to `failed` rather than disappearing).
   */
  send: (input: SendInput) => Promise<Message>;
  isSending: boolean;
  refresh: () => Promise<void>;
}

/**
 * One conversation's message history: polled, merged by id, with optimistic
 * sends. Everything a `<Thread />` needs.
 */
export function useThread(conversationId: string | null, options: UseThreadOptions = {}): UseThreadResult {
  const { pollMs = 3000, limit = 100 } = options;
  const client = useHandsetClient();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<OutgoingMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSending, setIsSending] = useState(false);
  // Optimistic messages by local id, kept out of poll merges until resolved.
  const pendingRef = useRef<Map<string, OutgoingMessage>>(new Map());

  const fetchThread = useCallback(async () => {
    if (!conversationId) return;
    try {
      const [convo, page] = await Promise.all([
        client.request<Conversation>("GET", `/conversations/${conversationId}`),
        client.request<Page<Message>>("GET", "/messages", {
          query: { conversation_id: conversationId, limit },
        }),
      ]);
      setConversation(convo);
      setMessages(() => {
        const merged = new Map<string, OutgoingMessage>();
        for (const m of page.data) merged.set(m.id, m);
        // Keep optimistic entries that the API hasn't returned yet.
        for (const [localId, m] of pendingRef.current) {
          if (!merged.has(m.id)) merged.set(localId, m);
        }
        return [...merged.values()].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
      });
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [client, conversationId, limit]);

  usePoll(() => void fetchThread(), conversationId ? pollMs : 0, [fetchThread]);

  const send = useCallback(
    async (input: SendInput): Promise<Message> => {
      if (!conversation) throw new Error("Thread not loaded yet");
      const localId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const optimistic: OutgoingMessage = {
        id: localId,
        conversation_id: conversation.id,
        direction: "outbound",
        from: conversation.phone_number_id,
        to: conversation.external_number,
        body: input.body ?? null,
        media_urls: input.mediaUrls,
        status: "queued",
        created_at: new Date().toISOString(),
        pending: true,
      };
      pendingRef.current.set(localId, optimistic);
      setMessages((prev) => [...prev, optimistic]);
      setIsSending(true);
      try {
        const sent = await client.request<Message>("POST", "/messages", {
          body: {
            from: conversation.phone_number_id,
            to: conversation.external_number,
            body: input.body,
            media_urls: input.mediaUrls,
            metadata: input.metadata,
          },
          headers: { "Idempotency-Key": localId },
        });
        pendingRef.current.delete(localId);
        setMessages((prev) => {
          const withoutLocal = prev.filter((m) => m.id !== localId);
          return withoutLocal.some((m) => m.id === sent.id) ? withoutLocal : [...withoutLocal, sent];
        });
        return sent;
      } catch (err) {
        const failed: OutgoingMessage = { ...optimistic, status: "failed", pending: false };
        pendingRef.current.set(localId, failed);
        setMessages((prev) => prev.map((m) => (m.id === localId ? failed : m)));
        throw err;
      } finally {
        setIsSending(false);
      }
    },
    [client, conversation],
  );

  return { conversation, messages, isLoading, error, send, isSending, refresh: fetchThread };
}
