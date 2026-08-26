"use client";

import * as React from "react";
import { useHandsetClient } from "@handset/react";
import { cn } from "@/lib/utils";

/** The 10DLC campaign returned by POST /campaigns. */
export interface Campaign {
  id: string;
  tenant_id: string;
  brand_id: string;
  use_case: string;
  description: string;
  sample_messages: string[];
  opt_in_description?: string | null;
  status: string;
  rejection_reason?: string | null;
  created_at: string;
}

const USE_CASES = [
  { value: "customer_care", label: "Customer care" },
  { value: "appointment_reminders", label: "Appointment reminders" },
  { value: "marketing", label: "Marketing" },
  { value: "two_factor", label: "Two-factor / OTP" },
  { value: "mixed", label: "Mixed" },
];

export interface CampaignRegistrationFormProps {
  /** The tenant this campaign belongs to (tnt_…). */
  tenantId: string;
  /** The vetted brand to attach the campaign to (brd_…). */
  brandId: string;
  onRegistered?: (campaign: Campaign) => void;
  className?: string;
}

/**
 * A 10DLC campaign registration form. Carriers review the use case, the
 * description, 2–5 sample messages, and how recipients opt in — so the form
 * enforces those minimums before POSTing to /campaigns through your proxy.
 */
export function CampaignRegistrationForm({ tenantId, brandId, onRegistered, className }: CampaignRegistrationFormProps) {
  const client = useHandsetClient();
  const [useCase, setUseCase] = React.useState("customer_care");
  const [description, setDescription] = React.useState("");
  const [optIn, setOptIn] = React.useState("");
  const [samples, setSamples] = React.useState<string[]>(["", ""]);
  const [status, setStatus] = React.useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [campaign, setCampaign] = React.useState<Campaign | null>(null);

  const setSample = (i: number, value: string) =>
    setSamples((prev) => prev.map((s, idx) => (idx === i ? value : s)));
  const addSample = () => setSamples((prev) => (prev.length >= 5 ? prev : [...prev, ""]));
  const removeSample = (i: number) => setSamples((prev) => (prev.length <= 2 ? prev : prev.filter((_, idx) => idx !== i)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const filled = samples.map((s) => s.trim()).filter(Boolean);
    if (description.trim().length < 1) {
      setError("Add a description of what this campaign sends and why recipients expect it.");
      return;
    }
    if (filled.length < 2) {
      setError("Provide at least 2 representative sample messages — carriers review these.");
      return;
    }
    if (optIn.trim().length < 40) {
      setError("Describe how recipients opt in, in at least 40 characters.");
      return;
    }
    setStatus("submitting");
    try {
      const created = await client.request<Campaign>("POST", "/campaigns", {
        body: {
          tenant_id: tenantId,
          brand_id: brandId,
          use_case: useCase,
          description: description.trim(),
          sample_messages: filled,
          opt_in_description: optIn.trim(),
        },
      });
      setCampaign(created);
      setStatus("done");
      onRegistered?.(created);
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Could not register the campaign.");
    }
  };

  if (status === "done" && campaign) {
    return (
      <div className={cn("rounded-lg border p-4 text-sm", className)} role="status">
        <p className="font-medium">Campaign submitted for carrier review.</p>
        <p className="mt-1 text-muted-foreground">
          It&apos;s <span className="font-medium text-foreground">{campaign.status}</span>. Approval usually takes days
          to a few weeks; attach numbers and watch progress with the compliance-status component.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={cn("space-y-4", className)}>
      <Field label="Use case" htmlFor="campaign-use-case">
        <select id="campaign-use-case" value={useCase} onChange={(e) => setUseCase(e.target.value)} className={inputCls}>
          {USE_CASES.map((u) => (
            <option key={u.value} value={u.value}>{u.label}</option>
          ))}
        </select>
      </Field>
      <Field label="What this campaign sends" htmlFor="campaign-description">
        <textarea
          id="campaign-description"
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputCls}
          placeholder="Appointment reminders and reschedule links for patients who booked with the practice."
        />
      </Field>
      <div>
        <p className="mb-1 block text-sm font-medium">
          Sample messages <span className="font-normal text-muted-foreground">· 2–5, exactly what recipients receive</span>
        </p>
        <div className="space-y-2">
          {samples.map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <input
                value={s}
                onChange={(e) => setSample(i, e.target.value)}
                className={inputCls}
                placeholder={i === 0 ? "Your appointment with Dr. Lee is tomorrow at 2:00 PM. Reply C to confirm." : "Sample message…"}
              />
              {samples.length > 2 ? (
                <button type="button" onClick={() => removeSample(i)} className="shrink-0 rounded-md border px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground" aria-label={`Remove sample ${i + 1}`}>
                  ✕
                </button>
              ) : null}
            </div>
          ))}
        </div>
        {samples.length < 5 ? (
          <button type="button" onClick={addSample} className="mt-2 text-sm font-medium text-primary hover:underline">
            + Add sample
          </button>
        ) : null}
      </div>
      <Field label="How recipients opt in" htmlFor="campaign-opt-in" hint="Min 40 characters">
        <textarea
          id="campaign-opt-in"
          required
          rows={2}
          value={optIn}
          onChange={(e) => setOptIn(e.target.value)}
          className={inputCls}
          placeholder="Patients check a consent box on the booking form at bayviewdental.com and agree to appointment texts."
        />
      </Field>
      {error ? <p className="text-xs text-destructive" role="alert">{error}</p> : null}
      <button type="submit" disabled={status === "submitting"} className={buttonCls}>
        {status === "submitting" ? "Submitting…" : "Register campaign"}
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
