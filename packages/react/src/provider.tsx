"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { HandsetClient, type HandsetClientOptions } from "./client";
import { RealtimeContext, RealtimeManager } from "./use-realtime";

const HandsetContext = createContext<HandsetClient | null>(null);

export interface HandsetProviderProps extends HandsetClientOptions {
  children: ReactNode;
  /**
   * Open a realtime event stream (minted via POST /realtime/tokens through
   * your proxy) so hooks refresh the instant something happens instead of
   * on their poll interval. Falls back to plain polling silently if the
   * proxy doesn't allowlist the mint or the socket can't connect.
   */
  realtime?: boolean;
}

/**
 * Provides a configured client to every Handset hook below it.
 *
 * ```tsx
 * <HandsetProvider baseUrl="/api/handset" realtime>
 *   <App />
 * </HandsetProvider>
 * ```
 */
export function HandsetProvider({ children, realtime = false, ...options }: HandsetProviderProps) {
  const client = useMemo(
    () => new HandsetClient(options),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- options object identity is unstable by nature; key on its parts
    [options.baseUrl, options.fetch, JSON.stringify(options.headers ?? {})],
  );
  const manager = useMemo(
    () => (realtime ? new RealtimeManager(client) : null),
    [client, realtime],
  );
  useEffect(() => {
    if (!manager) return;
    manager.start();
    return () => manager.stop();
  }, [manager]);
  return (
    <HandsetContext.Provider value={client}>
      <RealtimeContext.Provider value={manager}>{children}</RealtimeContext.Provider>
    </HandsetContext.Provider>
  );
}

export function useHandsetClient(): HandsetClient {
  const client = useContext(HandsetContext);
  if (!client) {
    throw new Error(
      "Handset hooks must be used inside <HandsetProvider>. Wrap your app (or the messaging surface) in one.",
    );
  }
  return client;
}
