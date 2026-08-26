"use client";

import * as React from "react";
import { useHandsetClient } from "@handset/react";
import { cn } from "@/lib/utils";

/** The 10DLC brand returned by POST /brands. */
export interface Brand {
  id: string;
  legal_name: string;
  ein: string; // masked, e.g. **-***6789
  entity_type: string;
  contact_email: string;
  status: string;
  rejection_reason?: string | null;
  created_at: string;
}

const ENTITY_TYPES = [
  { value: "private_company", label: "Private company" },
  { value: "public_company", label: "Public company" },
  { value: "non_profit", label: "Non-profit" },
  { value: "sole_proprietor", label: "Sole proprietor" },
];

const EMPTY = {
  legal_name: "",
  dba: "",
  ein: "",
  entity_type: "private_company",
  website: "",
  contact_email: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  postal_code: "",
};

export interface BrandRegistrationFormProps {
  /** Register the brand under a specific tenant (tnt_…). Omit for account-level. */
  tenantId?: string;
  /** Called with the created brand once the API accepts it. */
  onRegistered?: (brand: Brand) => void;
  className?: string;
}

/**
 * A 10DLC brand registration form. Collects the TCR-required legal identity
 * and business contact, validates the EIN and phone before submit, and POSTs
 * to /brands through your Handset proxy. On success it surfaces the brand's
 * initial vetting status.
 */
export function BrandRegistrationForm({ tenantId, onRegistered, className }: BrandRegistrationFormProps) {
  const client = useHandsetClient();
  const [v, setV] = React.useState(EMPTY);
  const [status, setStatus] = React.useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [brand, setBrand] = React.useState<Brand | null>(null);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setV((prev) => ({ ...prev, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\d{2}-?\d{7}$/.test(v.ein.trim())) {
      setError("EIN must be nine digits, e.g. 12-3456789.");
      return;
    }
    if (!/^\+1[2-9]\d{9}$/.test(v.phone.trim())) {
      setError("Phone must be E.164, e.g. +14155550142.");
      return;
    }
    setStatus("submitting");
    try {
      const body: Record<string, unknown> = {
        legal_name: v.legal_name.trim(),
        ein: v.ein.trim(),
        entity_type: v.entity_type,
        contact_email: v.contact_email.trim(),
        phone: v.phone.trim(),
        street: v.street.trim(),
        city: v.city.trim(),
        state: v.state.trim().toUpperCase(),
        postal_code: v.postal_code.trim(),
      };
      if (v.dba.trim()) body.dba = v.dba.trim();
      if (v.website.trim()) body.website = v.website.trim();
      if (tenantId) body.tenant_id = tenantId;
      const created = await client.request<Brand>("POST", "/brands", { body });
      setBrand(created);
      setStatus("done");
      onRegistered?.(created);
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Could not register the brand.");
    }
  };

  if (status === "done" && brand) {
    return (
      <div className={cn("rounded-lg border p-4 text-sm", className)} role="status">
        <p className="font-medium">Brand submitted for vetting.</p>
        <p className="mt-1 text-muted-foreground">
          {brand.legal_name} ({brand.ein}) is <span className="font-medium text-foreground">{brand.status}</span>.
          Vetting typically completes within a day; you can watch it with the compliance-status component.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={cn("space-y-4", className)}>
      <Field label="Legal business name" htmlFor="brand-legal-name">
        <input id="brand-legal-name" required value={v.legal_name} onChange={set("legal_name")} className={inputCls} placeholder="Bayview Dental LLC" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Doing business as" htmlFor="brand-dba" hint="Optional">
          <input id="brand-dba" value={v.dba} onChange={set("dba")} className={inputCls} placeholder="Bayview Dental" />
        </Field>
        <Field label="Entity type" htmlFor="brand-entity">
          <select id="brand-entity" value={v.entity_type} onChange={set("entity_type")} className={inputCls}>
            {ENTITY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="EIN (Tax ID)" htmlFor="brand-ein">
          <input id="brand-ein" required value={v.ein} onChange={set("ein")} className={inputCls} placeholder="12-3456789" inputMode="numeric" />
        </Field>
        <Field label="Contact email" htmlFor="brand-email">
          <input id="brand-email" type="email" required value={v.contact_email} onChange={set("contact_email")} className={inputCls} placeholder="ops@bayviewdental.com" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Business phone" htmlFor="brand-phone">
          <input id="brand-phone" type="tel" required value={v.phone} onChange={set("phone")} className={inputCls} placeholder="+14155550142" />
        </Field>
        <Field label="Website" htmlFor="brand-website" hint="Optional">
          <input id="brand-website" type="url" value={v.website} onChange={set("website")} className={inputCls} placeholder="https://bayviewdental.com" />
        </Field>
      </div>
      <Field label="Street address" htmlFor="brand-street">
        <input id="brand-street" required value={v.street} onChange={set("street")} className={inputCls} placeholder="500 Ocean Ave" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="City" htmlFor="brand-city">
          <input id="brand-city" required value={v.city} onChange={set("city")} className={inputCls} placeholder="San Francisco" />
        </Field>
        <Field label="State" htmlFor="brand-state">
          <input id="brand-state" required value={v.state} onChange={set("state")} className={inputCls} placeholder="CA" maxLength={2} />
        </Field>
        <Field label="ZIP" htmlFor="brand-zip">
          <input id="brand-zip" required value={v.postal_code} onChange={set("postal_code")} className={inputCls} placeholder="94112" />
        </Field>
      </div>
      {error ? <p className="text-xs text-destructive" role="alert">{error}</p> : null}
      <button type="submit" disabled={status === "submitting"} className={buttonCls}>
        {status === "submitting" ? "Submitting…" : "Register brand"}
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
