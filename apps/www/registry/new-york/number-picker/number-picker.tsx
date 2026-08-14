"use client";

import * as React from "react";
import {
  useAvailableNumbers,
  useBuyNumber,
  type AvailableNumber,
  type PhoneNumber,
} from "@handset/react";
import { Check, MessageSquare, Mic, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NumberPickerProps {
  /** Tenant the purchased number belongs to. Omit when your proxy injects it. */
  tenantId?: string;
  /** 10DLC campaign to attach at purchase. */
  campaignId?: string;
  onPurchased?: (number: PhoneNumber) => void;
  className?: string;
}

/**
 * Search available numbers by area code and buy one — the self-serve
 * "pick your business number" step of an onboarding flow.
 */
export function NumberPicker({ tenantId, campaignId, onPurchased, className }: NumberPickerProps) {
  const [areaCode, setAreaCode] = React.useState("");
  const [selected, setSelected] = React.useState<AvailableNumber | null>(null);
  const { results, isSearching, hasSearched, error: searchError, search } = useAvailableNumbers();
  const { buy, isBuying, purchased, error: buyError, reset } = useBuyNumber();

  const runSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSelected(null);
    await search({ areaCode: areaCode || undefined, limit: 6 }).catch(() => undefined);
  };

  const confirm = async () => {
    if (!selected) return;
    const number = await buy({ phoneNumber: selected.phone_number, tenantId, campaignId }).catch(() => null);
    if (number) onPurchased?.(number);
  };

  if (purchased) {
    return (
      <div className={cn("rounded-lg border p-4", className)} role="status">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Check className="h-4 w-4 text-primary" />
          {formatUS(purchased.phone_number)} is yours.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          The number is active now{purchased.messaging_ready ? " and ready to text." : ". Texting unlocks once it's attached to an approved campaign."}
        </p>
        <button
          type="button"
          onClick={() => {
            reset();
            setSelected(null);
          }}
          className="mt-3 text-sm text-primary underline-offset-4 hover:underline"
        >
          Get another number
        </button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <form onSubmit={(e) => void runSearch(e)} className="flex gap-2">
        <input
          value={areaCode}
          onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, "").slice(0, 3))}
          placeholder="Area code, e.g. 415"
          inputMode="numeric"
          aria-label="Area code"
          className={cn(
            "w-40 rounded-md border bg-transparent px-3 py-2 text-sm",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          )}
        />
        <button
          type="submit"
          disabled={isSearching}
          className={cn(
            "inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground",
            "transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50",
          )}
        >
          <Search className="h-4 w-4" />
          {isSearching ? "Searching…" : "Search"}
        </button>
      </form>

      {searchError ? <p className="text-sm text-destructive">{searchError.message}</p> : null}

      {hasSearched && results.length === 0 && !isSearching ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Nothing available there — try a nearby area code.
        </p>
      ) : null}

      {results.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {results.map((candidate) => {
            const active = selected?.phone_number === candidate.phone_number;
            return (
              <button
                key={candidate.phone_number}
                type="button"
                onClick={() => setSelected(active ? null : candidate)}
                aria-pressed={active}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors hover:bg-muted/40",
                  active && "border-primary bg-primary/5",
                )}
              >
                <span className="flex items-center justify-between">
                  <span className="text-sm font-medium tabular-nums">{formatUS(candidate.phone_number)}</span>
                  {active ? <Check className="h-4 w-4 text-primary" /> : null}
                </span>
                <span className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  {candidate.locality ? `${candidate.locality}${candidate.region ? `, ${candidate.region}` : ""}` : "—"}
                  <span className="ml-auto flex items-center gap-1">
                    {candidate.capabilities?.includes("sms") ? <MessageSquare className="h-3 w-3" aria-label="SMS" /> : null}
                    {candidate.capabilities?.includes("voice") ? <Mic className="h-3 w-3" aria-label="Voice" /> : null}
                    {candidate.monthly_price_usd ? `$${candidate.monthly_price_usd}/mo` : null}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {selected ? (
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
          <p className="text-sm">
            Claim <span className="font-medium tabular-nums">{formatUS(selected.phone_number)}</span>?
          </p>
          <button
            type="button"
            onClick={() => void confirm()}
            disabled={isBuying}
            className={cn(
              "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground",
              "transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            {isBuying ? "Claiming…" : "Claim number"}
          </button>
        </div>
      ) : null}
      {buyError ? (
        <p className="text-sm text-destructive" role="alert">
          {buyError.message} — the number may have just been taken; search again.
        </p>
      ) : null}
    </div>
  );
}

function formatUS(e164: string): string {
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164;
}
