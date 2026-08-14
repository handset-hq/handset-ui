"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { HandsetClient, type HandsetClientOptions } from "./client";

const HandsetContext = createContext<HandsetClient | null>(null);

export interface HandsetProviderProps extends HandsetClientOptions {
  children: ReactNode;
}

/**
 * Provides a configured client to every Handset hook below it.
 *
 * ```tsx
 * <HandsetProvider baseUrl="/api/handset">
 *   <App />
 * </HandsetProvider>
 * ```
 */
export function HandsetProvider({ children, ...options }: HandsetProviderProps) {
  const client = useMemo(
    () => new HandsetClient(options),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- options object identity is unstable by nature; key on its parts
    [options.baseUrl, options.fetch, JSON.stringify(options.headers ?? {})],
  );
  return <HandsetContext.Provider value={client}>{children}</HandsetContext.Provider>;
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
