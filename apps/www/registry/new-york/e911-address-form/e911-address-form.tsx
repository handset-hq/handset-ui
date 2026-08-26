"use client";

import * as React from "react";
import { useCompliance, type E911Address } from "@handset/react";
import { cn } from "@/lib/utils";

export type { E911Address };

const EMPTY = { street: "", unit: "", city: "", state: "", postal_code: "" };

export interface E911AddressFormProps {
  /** The tenant this emergency address belongs to (tnt_…). */
  tenantId: string;
  onRegistered?: (address: E911Address) => void;
  className?: string;
}

/**
 * An E911 emergency-address form. Collects and validates the civic address a
 * carrier dispatches on for a tenant's numbers, registers it via the
 * useCompliance() hook, and reports the validation status it comes back with.
 */
export function E911AddressForm({ tenantId, onRegistered, className }: E911AddressFormProps) {
  const { registerE911, isSubmitting } = useCompliance();
  const [v, setV] = React.useState(EMPTY);
  const [error, setError] = React.useState<string | null>(null);
  const [address, setAddress] = React.useState<E911Address | null>(null);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setV((prev) => ({ ...prev, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (v.state.trim().length !== 2) {
      setError("State must be a 2-letter code, e.g. CA.");
      return;
    }
    try {
      const created = await registerE911({
        tenantId,
        street: v.street.trim(),
        unit: v.unit.trim() || undefined,
        city: v.city.trim(),
        state: v.state.trim().toUpperCase(),
        postalCode: v.postal_code.trim(),
      });
      setAddress(created);
      onRegistered?.(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the emergency address.");
    }
  };

  if (address) {
    return (
      <div className={cn("rounded-lg border p-4 text-sm", className)} role="status">
        <p className="font-medium">Emergency address saved.</p>
        <p className="mt-1 text-muted-foreground">
          {address.street}, {address.city} {address.state} {address.postal_code} —{" "}
          <span className="font-medium text-foreground">{address.status}</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={cn("space-y-4", className)}>
      <Field label="Street address" htmlFor="e911-street">
        <input id="e911-street" required value={v.street} onChange={set("street")} className={inputCls} placeholder="500 Ocean Ave" />
      </Field>
      <Field label="Unit / suite" htmlFor="e911-unit" hint="Optional">
        <input id="e911-unit" value={v.unit} onChange={set("unit")} className={inputCls} placeholder="Suite 200" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="City" htmlFor="e911-city">
          <input id="e911-city" required value={v.city} onChange={set("city")} className={inputCls} placeholder="San Francisco" />
        </Field>
        <Field label="State" htmlFor="e911-state">
          <input id="e911-state" required value={v.state} onChange={set("state")} className={inputCls} placeholder="CA" maxLength={2} />
        </Field>
        <Field label="ZIP" htmlFor="e911-zip">
          <input id="e911-zip" required value={v.postal_code} onChange={set("postal_code")} className={inputCls} placeholder="94112" />
        </Field>
      </div>
      {error ? <p className="text-xs text-destructive" role="alert">{error}</p> : null}
      <button type="submit" disabled={isSubmitting} className={buttonCls}>
        {isSubmitting ? "Saving…" : "Save emergency address"}
      </button>
    </form>
  );
}

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium">
        {label}
        {hint ? <span className="ml-1 font-normal text-muted-foreground">· {hint}</span> : null}
      </label>
      {children}
    </div>
  );
}

const inputCls = cn(
  "w-full rounded-md border bg-transparent px-3 py-2 text-sm",
  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
);

const buttonCls = cn(
  "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
  "transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50",
);
