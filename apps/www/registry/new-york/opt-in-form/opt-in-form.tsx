"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface OptInFormProps {
  /** Your brand name as registered on your 10DLC campaign. */
  brandName: string;
  /** e.g. "up to 4 messages per month". Match your campaign registration. */
  messageFrequency?: string;
  privacyUrl: string;
  termsUrl: string;
  /**
   * Receives the submission. `consented` is false when the box was left
   * unchecked — store nothing and send nothing in that case.
   */
  onSubmit: (input: { phone: string; consented: boolean }) => Promise<void>;
  className?: string;
}

/**
 * A carrier-compliant SMS opt-in form.
 *
 * The shape of this form comes from a real TCR/carrier review: the consent
 * checkbox is OPTIONAL — a required checkbox plus a required phone field
 * reads as "forced opt-in" to reviewers and gets campaigns rejected. An
 * unchecked submission must result in no enrollment and no message; the
 * form says so explicitly.
 */
export function OptInForm({
  brandName,
  messageFrequency = "recurring messages",
  privacyUrl,
  termsUrl,
  onSubmit,
  className,
}: OptInFormProps) {
  const [phone, setPhone] = React.useState("");
  const [consented, setConsented] = React.useState(false);
  const [state, setState] = React.useState<"idle" | "submitting" | "enrolled" | "declined" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setState("submitting");
    try {
      await onSubmit({ phone: phone.trim(), consented });
      setState(consented ? "enrolled" : "declined");
      setPhone("");
      setConsented(false);
    } catch {
      setState("error");
    }
  };

  if (state === "enrolled") {
    return (
      <div className={cn("rounded-lg border p-4 text-sm", className)} role="status">
        <p className="font-medium">You&apos;re signed up.</p>
        <p className="mt-1 text-muted-foreground">
          Watch for a confirmation text from {brandName}. Reply STOP anytime to unsubscribe.
        </p>
      </div>
    );
  }
  if (state === "declined") {
    return (
      <div className={cn("rounded-lg border p-4 text-sm", className)} role="status">
        <p className="font-medium">Not enrolled.</p>
        <p className="mt-1 text-muted-foreground">
          You left the box unchecked, so you won&apos;t receive any text messages.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void submit(e)} className={cn("space-y-3", className)}>
      <div>
        <label htmlFor="optin-phone" className="mb-1 block text-sm font-medium">
          Mobile number
        </label>
        <input
          id="optin-phone"
          type="tel"
          autoComplete="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(555) 555-0132"
          className={cn(
            "w-full rounded-md border bg-transparent px-3 py-2 text-sm",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          )}
        />
      </div>
      <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={consented}
          onChange={(e) => setConsented(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
        />
        <span>
          <span className="font-medium text-foreground">(Optional)</span> I agree to receive {messageFrequency} from{" "}
          {brandName} at the number provided. Consent is not a condition of purchase. Msg &amp; data rates may apply.
          Reply STOP to unsubscribe or HELP for help. See our{" "}
          <a href={privacyUrl} className="underline underline-offset-2" target="_blank" rel="noreferrer">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href={termsUrl} className="underline underline-offset-2" target="_blank" rel="noreferrer">
            Terms
          </a>
          .
        </span>
      </label>
      {state === "error" ? (
        <p className="text-xs text-destructive" role="alert">
          Something went wrong — please try again.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={state === "submitting" || phone.trim().length === 0}
        className={cn(
          "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
          "transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50",
        )}
      >
        {state === "submitting" ? "Submitting…" : "Submit"}
      </button>
      <p className="text-xs text-muted-foreground">
        Submitting without the box checked signs you up for nothing — no messages will be sent.
      </p>
    </form>
  );
}
