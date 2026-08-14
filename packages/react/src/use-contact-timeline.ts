"use client";

import { useCallback, useState } from "react";
import { useHandsetClient } from "./provider";
import { usePoll } from "./use-poll";
import type { Conversation, Message, Page } from "./types";
import type { Call, Voicemail } from "./voice-types";

export type TimelineEvent =
  | { type: "message"; at: string; message: Message }
  | { type: "call"; at: string; call: Call }
  | { type: "voicemail"; at: string; voicemail: Voicemail };

export interface UseContactTimelineOptions {
  tenantId?: string;
  /** Poll interval in ms. 0 disables polling. Default 10000. */
  pollMs?: number;
  /** Max items fetched per source. Default 50. */
  limit?: number;
}

export interface UseContactTimelineResult {
  /** Newest first. */
  events: TimelineEvent[];
  /** The contact's conversation, when one exists (for reply wiring). */
  conversation: Conversation | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Everything that happened with one customer number — messages, calls,
 * voicemails — merged into a single reverse-chronological feed. The data
 * layer for a CRM's contact panel.
 */
export function useContactTimeline(
  externalNumber: string | null,
  options: UseContactTimelineOptions = {},
): UseContactTimelineResult {
  const { tenantId, pollMs = 10000, limit = 50 } = options;
  const client = useHandsetClient();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTimeline = useCallback(async () => {
    if (!externalNumber) return;
    try {
      const [conversations, calls, voicemails] = await Promise.all([
        client.request<Page<Conversation>>("GET", "/conversations", { query: { tenant_id: tenantId, limit } }),
        client.request<Page<Call>>("GET", "/calls", { query: { tenant_id: tenantId, limit } }),
        client.request<Page<Voicemail>>("GET", "/voicemails", { query: { tenant_id: tenantId, limit } }),
      ]);

      const convo = conversations.data.find((c) => c.external_number === externalNumber) ?? null;
      setConversation(convo);

      const messages: Message[] = convo
        ? (
            await client.request<Page<Message>>("GET", "/messages", {
              query: { conversation_id: convo.id, limit },
            })
          ).data
        : [];

      const contactCalls = calls.data.filter((c) => c.from === externalNumber || c.to === externalNumber);
      const callIds = new Set(contactCalls.map((c) => c.id));
      const contactVoicemails = voicemails.data.filter(
        (v) => v.from === externalNumber || callIds.has(v.call_id),
      );
      // A call that produced a voicemail is represented by the voicemail.
      const voicemailCallIds = new Set(contactVoicemails.map((v) => v.call_id));

      const merged: TimelineEvent[] = [
        ...messages.map((m): TimelineEvent => ({ type: "message", at: m.created_at, message: m })),
        ...contactCalls
          .filter((c) => !voicemailCallIds.has(c.id))
          .map((c): TimelineEvent => ({ type: "call", at: c.started_at, call: c })),
        ...contactVoicemails.map((v): TimelineEvent => ({ type: "voicemail", at: v.created_at, voicemail: v })),
      ].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

      setEvents(merged);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [client, externalNumber, tenantId, limit]);

  usePoll(() => void fetchTimeline(), externalNumber ? pollMs : 0, [fetchTimeline]);

  return { events, conversation, isLoading, error, refresh: fetchTimeline };
}
