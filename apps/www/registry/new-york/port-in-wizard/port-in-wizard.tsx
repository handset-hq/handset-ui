"use client";

import * as React from "react";
import { usePorting, type PortabilityResult, type PortIn } from "@handset/react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PortInWizardProps {
  /** The tenant the ported numbers belong to (tnt_…). */
  tenantId: string;
  onSubmitted?: (portIn: PortIn) => void;
  className?: string;
}

type Step = "numbers" | "details" | "review" | "done";

const EMPTY_DETAILS = {
  entity_name: "",
  authorized_person: "",
  billing_phone_number: "",
  account_number: "",
  pin: "",
  street: "",
  city: "",
  state: "",
  postal_code: "",
};

/**
 * A guided port-in: check portability, collect the losing-carrier account
 * details, open a draft, and submit it for review — the create/submit flow
 * that port-status only lets you watch.
 */
export function PortInWizard({ tenantId, onSubmitted, className }: PortInWizardProps) {
  const { checkPortability, createPortIn, submitPortIn, isSubmitting } = usePorting();
  const [step, setStep] = React.useState<Step>("numbers");
  const [raw, setRaw] = React.useState("");
  const [results, setResults] = React.useState<PortabilityResult[] | null>(null);
  const [details, setDetails] = React.useState(EMPTY_DETAILS);
  const [draft, setDraft] = React.useState<PortIn | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const portable = (results ?? []).filter((r) => r.portable).map((r) => r.phone_number);
  const setD = (k: keyof typeof EMPTY_DETAILS) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDetails((prev) => ({ ...prev, [k]: e.target.value }));

  const parseNumbers = () =>
    raw.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);

  const runCheck = async () => {
    setError(null);
    const nums = parseNumbers();
    if (nums.length === 0) {
      setError("Enter at least one number in E.164 format, e.g. +14155550142.");
      return;
    }
    try {
      setResults(await checkPortability(nums));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not check portability.");
    }
  };

  const createDraft = async () => {
    setError(null);
    if (!/^\+1[2-9]\d{9}$/.test(details.billing_phone_number.trim())) {
      setError("Billing phone must be E.164, e.g. +14155550142.");
      return;
    }
    if (details.state.trim().length !== 2) {
      setError("State must be a 2-letter code.");
      return;
    }
    try {
      const created = await createPortIn({
        tenantId,
        phoneNumbers: portable,
        entityName: details.entity_name.trim(),
        authorizedPerson: details.authorized_person.trim(),
        billingPhoneNumber: details.billing_phone_number.trim(),
        accountNumber: details.account_number.trim(),
        pin: details.pin.trim() || undefined,
        serviceAddress: {
          street: details.street.trim(),
          city: details.city.trim(),
          state: details.state.trim().toUpperCase(),
          postalCode: details.postal_code.trim(),
        },
      });
      setDraft(created);
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open the port-in draft.");
    }
  };

  const submit = async () => {
    if (!draft) return;
    setError(null);
    try {
      const submitted = await submitPortIn(draft.id);
      setDraft(submitted);
      setStep("done");
      onSubmitted?.(submitted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit the port-in.");
    }
  };

  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <Steps step={step} />

      {step === "numbers" ? (
        <div className="space-y-3">
          <div>
            <label htmlFor="port-numbers" className="mb-1 block text-sm font-medium">
              Numbers to port <span className="font-normal text-muted-foreground">· one per line, E.164</span>
            </label>
            <textarea
              id="port-numbers"
              rows={3}
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder={"+14155550142\n+14155550143"}
              className={inputCls}
            />
          </div>
          {results ? (
            <ul className="space-y-1.5">
              {results.map((r) => (
                <li key={r.phone_number} className="flex items-center gap-2 text-sm">
                  {r.portable ? (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <X className="h-4 w-4 shrink-0 text-destructive" />
                  )}
                  <span className="font-mono">{r.phone_number}</span>
                  {!r.portable && r.reason ? <span className="text-xs text-muted-foreground">— {r.reason}</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
          {error ? <p className="text-xs text-destructive" role="alert">{error}</p> : null}
          <div className="flex gap-2">
            <button type="button" onClick={() => void runCheck()} disabled={isSubmitting} className={outlineBtn}>
              {isSubmitting ? "Checking…" : "Check portability"}
            </button>
            {portable.length > 0 ? (
              <button type="button" onClick={() => setStep("details")} className={primaryBtn}>
                Continue with {portable.length} number{portable.length > 1 ? "s" : ""}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {step === "details" ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter the account details exactly as they appear on the current carrier&apos;s bill.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Business / account name" htmlFor="port-entity">
              <input id="port-entity" required value={details.entity_name} onChange={setD("entity_name")} className={inputCls} />
            </Field>
            <Field label="Authorized person" htmlFor="port-auth">
              <input id="port-auth" required value={details.authorized_person} onChange={setD("authorized_person")} className={inputCls} />
            </Field>
            <Field label="Billing phone" htmlFor="port-billing">
              <input id="port-billing" type="tel" required value={details.billing_phone_number} onChange={setD("billing_phone_number")} className={inputCls} placeholder="+14155550142" />
            </Field>
            <Field label="Account number" htmlFor="port-account">
              <input id="port-account" required value={details.account_number} onChange={setD("account_number")} className={inputCls} />
            </Field>
            <Field label="PIN" htmlFor="port-pin" hint="Optional">
              <input id="port-pin" value={details.pin} onChange={setD("pin")} className={inputCls} />
            </Field>
          </div>
          <Field label="Service street address" htmlFor="port-street">
            <input id="port-street" required value={details.street} onChange={setD("street")} className={inputCls} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="City" htmlFor="port-city">
              <input id="port-city" required value={details.city} onChange={setD("city")} className={inputCls} />
            </Field>
            <Field label="State" htmlFor="port-state">
              <input id="port-state" required value={details.state} onChange={setD("state")} className={inputCls} maxLength={2} placeholder="CA" />
            </Field>
            <Field label="ZIP" htmlFor="port-zip">
              <input id="port-zip" required value={details.postal_code} onChange={setD("postal_code")} className={inputCls} />
            </Field>
          </div>
          {error ? <p className="text-xs text-destructive" role="alert">{error}</p> : null}
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep("numbers")} className={outlineBtn}>Back</button>
            <button type="button" onClick={() => void createDraft()} disabled={isSubmitting} className={primaryBtn}>
              {isSubmitting ? "Saving…" : "Review"}
            </button>
          </div>
        </div>
      ) : null}

      {step === "review" && draft ? (
        <div className="space-y-4">
          <p className="text-sm">
            Porting <span className="font-medium">{draft.phone_numbers.length}</span> number
            {draft.phone_numbers.length > 1 ? "s" : ""} for <span className="font-medium">{draft.entity_name}</span>.
            Account <span className="font-mono">{draft.account_number}</span>. Submitting sends this to the carrier and
            can&apos;t be edited afterward.
          </p>
          {error ? <p className="text-xs text-destructive" role="alert">{error}</p> : null}
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep("details")} className={outlineBtn}>Back</button>
            <button type="button" onClick={() => void submit()} disabled={isSubmitting} className={primaryBtn}>
              {isSubmitting ? "Submitting…" : "Submit port-in"}
            </button>
          </div>
        </div>
      ) : null}

      {step === "done" && draft ? (
        <div className="rounded-lg border bg-muted/30 p-4 text-sm" role="status">
          <p className="font-medium">Port-in submitted.</p>
          <p className="mt-1 text-muted-foreground">
            {draft.phone_numbers.join(", ")} is now <span className="font-medium text-foreground">{draft.status}</span>.
            Follow it with the port-status component; you&apos;ll get a firm order commitment date once the carrier
            accepts.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function Steps({ step }: { step: Step }) {
  const order: Step[] = ["numbers", "details", "review", "done"];
  const labels: Record<Step, string> = { numbers: "Numbers", details: "Details", review: "Review", done: "Done" };
  const active = order.indexOf(step);
  return (
    <ol className="mb-4 flex items-center gap-1.5 text-xs">
      {order.map((s, i) => (
        <React.Fragment key={s}>
          <li className={cn("font-medium", i <= active ? "text-foreground" : "text-muted-foreground")}>{labels[s]}</li>
          {i < order.length - 1 ? <span className="text-muted-foreground">›</span> : null}
        </React.Fragment>
      ))}
    </ol>
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
const primaryBtn = cn(
  "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
  "transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50",
);
const outlineBtn = cn(
  "rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted",
  "disabled:pointer-events-none disabled:opacity-50",
);
