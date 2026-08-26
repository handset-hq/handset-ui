"use client";

import { useCallback, useState } from "react";
import { useHandsetClient } from "./provider";
import type { Page } from "./types";
import type { PortIn, PortabilityResult, PortInInput } from "./number-types";

export interface UsePortingResult {
  checkPortability: (phoneNumbers: string[]) => Promise<PortabilityResult[]>;
  createPortIn: (input: PortInInput) => Promise<PortIn>;
  submitPortIn: (portInId: string) => Promise<PortIn>;
  cancelPortIn: (portInId: string) => Promise<PortIn>;
  isSubmitting: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * The port-in lifecycle mutations: check portability, open a draft, submit it
 * for carrier review, or cancel. Pair with usePortIn(id) to follow the order's
 * status afterward. `isSubmitting` / `error` cover whichever call is in flight.
 */
export function usePorting(): UsePortingResult {
  const client = useHandsetClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const run = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    setIsSubmitting(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const checkPortability = useCallback(
    (phoneNumbers: string[]) =>
      run(async () => {
        const res = await client.request<Page<PortabilityResult> | PortabilityResult[]>("POST", "/port_ins/check", {
          body: { phone_numbers: phoneNumbers },
        });
        return Array.isArray(res) ? res : res.data;
      }),
    [client, run],
  );

  const createPortIn = useCallback(
    (input: PortInInput) =>
      run(() =>
        client.request<PortIn>("POST", "/port_ins", {
          body: {
            tenant_id: input.tenantId,
            phone_numbers: input.phoneNumbers,
            entity_name: input.entityName,
            authorized_person: input.authorizedPerson,
            billing_phone_number: input.billingPhoneNumber,
            account_number: input.accountNumber,
            pin: input.pin,
            service_address: {
              street: input.serviceAddress.street,
              city: input.serviceAddress.city,
              state: input.serviceAddress.state,
              postal_code: input.serviceAddress.postalCode,
            },
          },
        }),
      ),
    [client, run],
  );

  const submitPortIn = useCallback(
    (portInId: string) => run(() => client.request<PortIn>("POST", `/port_ins/${portInId}/submit`, {})),
    [client, run],
  );

  const cancelPortIn = useCallback(
    (portInId: string) => run(() => client.request<PortIn>("POST", `/port_ins/${portInId}/cancel`, {})),
    [client, run],
  );

  const reset = useCallback(() => setError(null), []);

  return { checkPortability, createPortIn, submitPortIn, cancelPortIn, isSubmitting, error, reset };
}
