"use client";

import { useCallback, useState } from "react";
import { useHandsetClient } from "./provider";
import { usePoll } from "./use-poll";
import type { UsageSummary } from "./number-types";

export interface UseUsageOptions {
  tenantId?: string;
  /** RFC 3339 or YYYY-MM-DD. Defaults to the first instant of the current month. */
  start?: string;
  /** RFC 3339 or YYYY-MM-DD. Defaults to now. */
  end?: string;
  /** Poll interval in ms. Default 0 (fetch once). */
  pollMs?: number;
}

export interface UseUsageResult {
  usage: UsageSummary | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/** Usage totals by kind for a period (defaults to the current month). */
export function useUsage(options: UseUsageOptions = {}): UseUsageResult {
  const { tenantId, start, end, pollMs = 0 } = options;
  const client = useHandsetClient();
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsage = useCallback(async () => {
    try {
      const summary = await client.request<UsageSummary>("GET", "/usage", {
        query: { tenant_id: tenantId, start, end },
      });
      setUsage(summary);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [client, tenantId, start, end]);

  usePoll(() => void fetchUsage(), pollMs, [fetchUsage]);

  return { usage, isLoading, error, refresh: fetchUsage };
}
