"use client";

import { createContext, useContext, useEffect, useRef, useSyncExternalStore } from "react";
import type { HandsetClient } from "./client";

/** The event envelope pushed on the realtime socket — same shape webhooks deliver. */
export interface RealtimeEnvelope {
  id: string;
  type: string;
  event_version: string;
  created_at: string;
  tenant_id?: string | null;
  data: Record<string, unknown>;
}

/** Hook families a single event can invalidate. */
export type RealtimeFamily = "messages" | "calls" | "voicemails" | "ports" | "compliance";

/** Maps an event type to the hook families that should refetch. */
export function familiesFor(eventType: string): RealtimeFamily[] {
  if (eventType.startsWith("message.")) return ["messages"];
  if (eventType === "voicemail.created") return ["voicemails", "calls"];
  if (eventType.startsWith("call.")) return ["calls"];
  if (eventType.startsWith("recording.")) return ["calls"];
  if (eventType.startsWith("port_in.")) return ["ports"];
  if (eventType.startsWith("brand.") || eventType.startsWith("campaign.")) return ["compliance"];
  return [];
}

interface TokenResponse {
  token: string;
  url: string;
  expires_at: string;
}

/**
 * One realtime connection per provider. Mints a short-lived token through
 * the partner's proxy (POST /realtime/tokens), connects, and turns every
 * event into version bumps hooks depend on. Failure is always graceful:
 * if the proxy doesn't allowlist the mint or the socket won't connect,
 * hooks keep polling at their normal cadence.
 */
export class RealtimeManager {
  private client: HandsetClient;
  private ws: WebSocket | null = null;
  private stopped = false;
  private retryMs = 1000;
  private versions: Record<RealtimeFamily, number> = {
    messages: 0,
    calls: 0,
    voicemails: 0,
    ports: 0,
    compliance: 0,
  };
  private connectedState = false;
  private storeListeners = new Set<() => void>();
  private eventListeners = new Set<(e: RealtimeEnvelope) => void>();
  /** Snapshot cache so useSyncExternalStore sees stable references. */
  private snapshot: { connected: boolean; versions: Record<RealtimeFamily, number> };

  constructor(client: HandsetClient) {
    this.client = client;
    this.snapshot = { connected: false, versions: { ...this.versions } };
  }

  start() {
    if (typeof WebSocket === "undefined") return; // SSR
    this.stopped = false;
    void this.connect();
  }

  stop() {
    this.stopped = true;
    this.ws?.close();
    this.ws = null;
    this.setConnected(false);
  }

  subscribeStore = (fn: () => void) => {
    this.storeListeners.add(fn);
    return () => this.storeListeners.delete(fn);
  };

  getSnapshot = () => this.snapshot;

  /** Raw event subscription (agent-assist style consumers). */
  onEvent(fn: (e: RealtimeEnvelope) => void): () => void {
    this.eventListeners.add(fn);
    return () => this.eventListeners.delete(fn);
  }

  private async connect() {
    if (this.stopped) return;
    let grant: TokenResponse;
    try {
      grant = await this.client.request<TokenResponse>("POST", "/realtime/tokens");
    } catch {
      // Proxy without the allowlist entry, or realtime not configured:
      // stay in polling mode and retry occasionally.
      this.scheduleReconnect(60_000);
      return;
    }
    try {
      const ws = new WebSocket(`${grant.url}?token=${grant.token}`);
      this.ws = ws;
      ws.onopen = () => {
        this.retryMs = 1000;
        this.setConnected(true);
      };
      ws.onmessage = (msg) => {
        try {
          const env = JSON.parse(String(msg.data)) as RealtimeEnvelope & { type: string };
          if (env.type === "realtime.connected") return;
          this.bump(env);
        } catch {
          // ignore unparseable frames
        }
      };
      ws.onclose = () => {
        this.setConnected(false);
        // Normal close is usually token expiry — reconnect re-mints fast.
        this.scheduleReconnect(this.retryMs);
        this.retryMs = Math.min(this.retryMs * 2, 30_000);
      };
      ws.onerror = () => ws.close();
    } catch {
      this.scheduleReconnect(this.retryMs);
      this.retryMs = Math.min(this.retryMs * 2, 30_000);
    }
  }

  private scheduleReconnect(ms: number) {
    if (this.stopped) return;
    setTimeout(() => void this.connect(), ms);
  }

  private bump(env: RealtimeEnvelope) {
    for (const family of familiesFor(env.type)) this.versions[family] += 1;
    this.snapshot = { connected: this.connectedState, versions: { ...this.versions } };
    for (const fn of this.storeListeners) fn();
    for (const fn of this.eventListeners) fn(env);
  }

  private setConnected(v: boolean) {
    if (this.connectedState === v) return;
    this.connectedState = v;
    this.snapshot = { connected: v, versions: { ...this.versions } };
    for (const fn of this.storeListeners) fn();
  }
}

export const RealtimeContext = createContext<RealtimeManager | null>(null);

const STATIC_SNAPSHOT = {
  connected: false,
  versions: { messages: 0, calls: 0, voicemails: 0, ports: 0, compliance: 0 } as Record<RealtimeFamily, number>,
};

/**
 * The live-refresh signal for one hook family: `version` changes whenever a
 * relevant event arrives (hooks put it in their poll deps → instant
 * refetch), and `connected` tells hooks they can stretch their poll
 * interval to a safety-net cadence.
 */
export function useRealtimeFamily(family: RealtimeFamily): { version: number; connected: boolean } {
  const manager = useContext(RealtimeContext);
  const snap = useSyncExternalStore(
    manager ? manager.subscribeStore : () => () => {},
    manager ? manager.getSnapshot : () => STATIC_SNAPSHOT,
    () => STATIC_SNAPSHOT,
  );
  return { version: snap.versions[family], connected: snap.connected };
}

/**
 * Subscribe to the raw realtime event stream (every envelope for this
 * account/tenant). No-op without `realtime` on the provider.
 */
export function useHandsetEvents(handler: (e: RealtimeEnvelope) => void): void {
  const manager = useContext(RealtimeContext);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useEffect(() => {
    if (!manager) return;
    return manager.onEvent((e) => handlerRef.current(e));
  }, [manager]);
}

/**
 * The safety-net interval while realtime is connected: events drive
 * refreshes, polling drops to once a minute (0 stays 0 — disabled).
 */
export function relaxedPoll(pollMs: number, connected: boolean): number {
  if (!connected || pollMs <= 0) return pollMs;
  return Math.max(pollMs, 60_000);
}
