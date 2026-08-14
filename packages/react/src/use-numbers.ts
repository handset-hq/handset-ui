"use client";

import { useCallback, useState } from "react";
import { useHandsetClient } from "./provider";
import { usePoll } from "./use-poll";
import type { Page } from "./types";
import type { AvailableNumber, PhoneNumber } from "./number-types";

export interface NumberSearchParams {
  areaCode?: string;
  /** City name, e.g. "Phoenix". */
  locality?: string;
  /** Digit pattern the number should contain. */
  contains?: string;
  limit?: number;
}

export interface UseAvailableNumbersResult {
  results: AvailableNumber[];
  isSearching: boolean;
  /** True once a search has run (distinguishes "no results" from "not searched"). */
  hasSearched: boolean;
  error: Error | null;
  search: (params: NumberSearchParams) => Promise<AvailableNumber[]>;
  clear: () => void;
}

/** On-demand search of purchasable numbers. */
export function useAvailableNumbers(): UseAvailableNumbersResult {
  const client = useHandsetClient();
  const [results, setResults] = useState<AvailableNumber[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(
    async (params: NumberSearchParams): Promise<AvailableNumber[]> => {
      setIsSearching(true);
      setError(null);
      try {
        const page = await client.request<{ data: AvailableNumber[] }>("GET", "/phone_numbers/available", {
          query: {
            area_code: params.areaCode,
            locality: params.locality,
            contains: params.contains,
            limit: params.limit,
          },
        });
        setResults(page.data);
        setHasSearched(true);
        return page.data;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsSearching(false);
      }
    },
    [client],
  );

  const clear = useCallback(() => {
    setResults([]);
    setHasSearched(false);
    setError(null);
  }, []);

  return { results, isSearching, hasSearched, error, search, clear };
}

export interface BuyNumberInput {
  /** E.164 number from a search result. */
  phoneNumber: string;
  /** Tenant that owns the number. Omit when your proxy injects it. */
  tenantId?: string;
  /** 10DLC campaign to attach; outbound SMS is blocked until one is approved. */
  campaignId?: string;
  routingConfigId?: string;
}

export interface UseBuyNumberResult {
  buy: (input: BuyNumberInput) => Promise<PhoneNumber>;
  isBuying: boolean;
  purchased: PhoneNumber | null;
  error: Error | null;
  reset: () => void;
}

/** Purchase a number from a search result. Idempotent per attempt. */
export function useBuyNumber(): UseBuyNumberResult {
  const client = useHandsetClient();
  const [isBuying, setIsBuying] = useState(false);
  const [purchased, setPurchased] = useState<PhoneNumber | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const buy = useCallback(
    async (input: BuyNumberInput): Promise<PhoneNumber> => {
      setIsBuying(true);
      setError(null);
      try {
        const number = await client.request<PhoneNumber>("POST", "/phone_numbers", {
          body: {
            phone_number: input.phoneNumber,
            tenant_id: input.tenantId,
            campaign_id: input.campaignId,
            routing_config_id: input.routingConfigId,
          },
          headers: { "Idempotency-Key": `buy_${input.phoneNumber}_${Date.now()}` },
        });
        setPurchased(number);
        return number;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsBuying(false);
      }
    },
    [client],
  );

  const reset = useCallback(() => {
    setPurchased(null);
    setError(null);
  }, []);

  return { buy, isBuying, purchased, error, reset };
}

export interface UsePhoneNumberOptions {
  /** Poll interval in ms. Default 0 (fetch once). */
  pollMs?: number;
}

export interface UsePhoneNumberResult {
  number: PhoneNumber | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/** One phone number's record — poll it to watch messaging_ready flip. */
export function usePhoneNumber(numberId: string | null, options: UsePhoneNumberOptions = {}): UsePhoneNumberResult {
  const { pollMs = 0 } = options;
  const client = useHandsetClient();
  const [number, setNumber] = useState<PhoneNumber | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNumber = useCallback(async () => {
    if (!numberId) return;
    try {
      const fresh = await client.request<PhoneNumber>("GET", `/phone_numbers/${numberId}`);
      setNumber(fresh);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [client, numberId]);

  usePoll(() => void fetchNumber(), numberId ? pollMs : 0, [fetchNumber]);

  return { number, isLoading, error, refresh: fetchNumber };
}

export type { Page };
