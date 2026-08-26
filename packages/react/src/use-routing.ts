"use client";

import { useCallback, useState } from "react";
import { useHandsetClient } from "./provider";
import { usePoll } from "./use-poll";
import type { Page } from "./types";
import type { RoutingConfig, RoutingConfigUpdate } from "./routing-types";

export interface UseRoutingConfigsOptions {
  tenantId?: string;
  limit?: number;
  /** Poll interval in ms. Default 0 (fetch once). */
  pollMs?: number;
}

export interface UseRoutingConfigsResult {
  configs: RoutingConfig[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/** List routing configs, optionally scoped to a tenant. */
export function useRoutingConfigs(options: UseRoutingConfigsOptions = {}): UseRoutingConfigsResult {
  const { tenantId, limit = 25, pollMs = 0 } = options;
  const client = useHandsetClient();
  const [configs, setConfigs] = useState<RoutingConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfigs = useCallback(async () => {
    try {
      const page = await client.request<Page<RoutingConfig>>("GET", "/routing_configs", {
        query: { tenant_id: tenantId, limit },
      });
      setConfigs(page.data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [client, tenantId, limit]);

  usePoll(() => void fetchConfigs(), pollMs, [fetchConfigs]);

  return { configs, isLoading, error, refresh: fetchConfigs };
}

export interface UseRoutingConfigOptions {
  /** Poll interval in ms. Default 0 (fetch once). */
  pollMs?: number;
}

export interface UseRoutingConfigResult {
  config: RoutingConfig | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  /** PATCH the routing config; resolves with the updated document. */
  update: (patch: RoutingConfigUpdate) => Promise<RoutingConfig>;
  isSaving: boolean;
}

/** Read one routing config and update it (e.g. edit its business hours). */
export function useRoutingConfig(
  routingConfigId: string | null,
  options: UseRoutingConfigOptions = {},
): UseRoutingConfigResult {
  const { pollMs = 0 } = options;
  const client = useHandsetClient();
  const [config, setConfig] = useState<RoutingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(routingConfigId));
  const [error, setError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    if (!routingConfigId) return;
    try {
      const fresh = await client.request<RoutingConfig>("GET", `/routing_configs/${routingConfigId}`);
      setConfig(fresh);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [client, routingConfigId]);

  usePoll(() => void fetchConfig(), routingConfigId ? pollMs : 0, [fetchConfig]);

  const update = useCallback(
    async (patch: RoutingConfigUpdate): Promise<RoutingConfig> => {
      if (!routingConfigId) throw new Error("No routing config id");
      setIsSaving(true);
      setError(null);
      try {
        const updated = await client.request<RoutingConfig>("PATCH", `/routing_configs/${routingConfigId}`, {
          body: patch,
        });
        setConfig(updated);
        return updated;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [client, routingConfigId],
  );

  return { config, isLoading, error, refresh: fetchConfig, update, isSaving };
}
