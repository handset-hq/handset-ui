"use client";

import { useCallback, useState } from "react";
import { useHandsetClient } from "./provider";
import { usePoll } from "./use-poll";
import {
  complianceSettled,
  type Brand,
  type BrandRegistration,
  type Campaign,
  type CampaignRegistration,
  type E911Address,
  type E911Registration,
} from "./compliance-types";

export interface UseComplianceResult {
  registerBrand: (input: BrandRegistration) => Promise<Brand>;
  registerCampaign: (input: CampaignRegistration) => Promise<Campaign>;
  registerE911: (input: E911Registration) => Promise<E911Address>;
  isSubmitting: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Register 10DLC brands and campaigns, and E911 emergency addresses. Each
 * mutation resolves with the created resource or throws; `isSubmitting` and
 * `error` cover whichever one is in flight.
 */
export function useCompliance(): UseComplianceResult {
  const client = useHandsetClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const run = useCallback(
    async <T>(path: string, body: Record<string, unknown>): Promise<T> => {
      setIsSubmitting(true);
      setError(null);
      try {
        return await client.request<T>("POST", path, { body });
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [client],
  );

  const registerBrand = useCallback(
    (input: BrandRegistration) =>
      run<Brand>("/brands", {
        tenant_id: input.tenantId,
        legal_name: input.legalName,
        dba: input.dba,
        ein: input.ein,
        entity_type: input.entityType,
        website: input.website,
        contact_email: input.contactEmail,
        phone: input.phone,
        street: input.street,
        city: input.city,
        state: input.state,
        postal_code: input.postalCode,
      }),
    [run],
  );

  const registerCampaign = useCallback(
    (input: CampaignRegistration) =>
      run<Campaign>("/campaigns", {
        tenant_id: input.tenantId,
        brand_id: input.brandId,
        use_case: input.useCase,
        description: input.description,
        sample_messages: input.sampleMessages,
        opt_in_description: input.optInDescription,
      }),
    [run],
  );

  const registerE911 = useCallback(
    (input: E911Registration) =>
      run<E911Address>("/e911_addresses", {
        tenant_id: input.tenantId,
        street: input.street,
        unit: input.unit,
        city: input.city,
        state: input.state,
        postal_code: input.postalCode,
      }),
    [run],
  );

  const reset = useCallback(() => setError(null), []);

  return { registerBrand, registerCampaign, registerE911, isSubmitting, error, reset };
}

export interface UseBrandOptions {
  /** Poll interval while pending, in ms. Default 15000. 0 fetches once. Polling stops once the brand settles. */
  pollMs?: number;
}

export interface UseBrandResult {
  brand: Brand | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/** Read one 10DLC brand, polling until it's approved or rejected. */
export function useBrand(brandId: string | null, options: UseBrandOptions = {}): UseBrandResult {
  const { pollMs = 15000 } = options;
  const client = useHandsetClient();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(brandId));
  const [error, setError] = useState<Error | null>(null);

  const fetchBrand = useCallback(async () => {
    if (!brandId) return;
    try {
      const fresh = await client.request<Brand>("GET", `/brands/${brandId}`);
      setBrand(fresh);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [client, brandId]);

  const settled = complianceSettled(brand?.status);
  usePoll(() => void fetchBrand(), brandId && !settled ? pollMs : 0, [fetchBrand, settled]);

  return { brand, isLoading, error, refresh: fetchBrand };
}

export interface UseCampaignOptions {
  /** Poll interval while pending, in ms. Default 15000. 0 fetches once. Polling stops once the campaign settles. */
  pollMs?: number;
}

export interface UseCampaignResult {
  campaign: Campaign | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/** Read one 10DLC campaign, polling until it's approved or rejected. */
export function useCampaign(campaignId: string | null, options: UseCampaignOptions = {}): UseCampaignResult {
  const { pollMs = 15000 } = options;
  const client = useHandsetClient();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(campaignId));
  const [error, setError] = useState<Error | null>(null);

  const fetchCampaign = useCallback(async () => {
    if (!campaignId) return;
    try {
      const fresh = await client.request<Campaign>("GET", `/campaigns/${campaignId}`);
      setCampaign(fresh);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [client, campaignId]);

  const settled = complianceSettled(campaign?.status);
  usePoll(() => void fetchCampaign(), campaignId && !settled ? pollMs : 0, [fetchCampaign, settled]);

  return { campaign, isLoading, error, refresh: fetchCampaign };
}
