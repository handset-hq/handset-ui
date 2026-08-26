"use client";

import * as React from "react";
import { useRoutingConfig, type RoutingWindow } from "@handset/react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS: [string, string][] = [
  ["mon", "Mon"], ["tue", "Tue"], ["wed", "Wed"], ["thu", "Thu"], ["fri", "Fri"], ["sat", "Sat"], ["sun", "Sun"],
];

export interface BusinessHoursEditorProps {
  /** The routing config whose business hours to edit (rtc_…). */
  routingConfigId: string;
  /** The tenant's IANA timezone, shown as context (hours are in this zone). */
  timezone?: string;
  onSaved?: () => void;
  className?: string;
}

/**
 * Edit the weekly business hours on a voice routing config: add and remove
 * windows, toggle days, set open/close times, and PATCH it back. Times are in
 * the tenant's timezone (a tenant-level setting, shown read-only here).
 */
export function BusinessHoursEditor({ routingConfigId, timezone, onSaved, className }: BusinessHoursEditorProps) {
  const { config, isLoading, error, update, isSaving } = useRoutingConfig(routingConfigId);
  const [schedule, setSchedule] = React.useState<RoutingWindow[] | null>(null);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  // Seed the local schedule once the config loads.
  React.useEffect(() => {
    if (config && schedule === null) setSchedule(config.business_hours?.schedule ?? []);
  }, [config, schedule]);

  const rows = schedule ?? [];
  const mutate = (next: RoutingWindow[]) => {
    setSchedule(next);
    setSaved(false);
  };
  const setRow = (i: number, patch: Partial<RoutingWindow>) =>
    mutate(rows.map((w, idx) => (idx === i ? { ...w, ...patch } : w)));
  const toggleDay = (i: number, day: string) =>
    setRow(i, { days: rows[i].days.includes(day) ? rows[i].days.filter((d) => d !== day) : [...rows[i].days, day] });
  const addWindow = () => mutate([...rows, { days: ["mon", "tue", "wed", "thu", "fri"], open: "09:00", close: "17:00" }]);
  const removeWindow = (i: number) => mutate(rows.filter((_, idx) => idx !== i));

  const save = async () => {
    if (!config) return;
    setSaveError(null);
    try {
      // Send the whole config so validation (open_behavior is required) passes
      // regardless of the API's merge semantics.
      await update({
        name: config.name,
        business_hours: { schedule: rows },
        open_behavior: config.open_behavior,
        closed_behavior: config.closed_behavior,
        recording: config.recording,
      });
      setSaved(true);
      onSaved?.();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save the hours.");
    }
  };

  if (isLoading && !config) {
    return <div className={cn("h-40 animate-pulse rounded-lg border bg-muted/40", className)} aria-hidden="true" />;
  }
  if (error && !config) {
    return <p className={cn("text-sm text-destructive", className)}>{error.message}</p>;
  }

  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium">{config?.name ?? "Business hours"}</p>
        {timezone ? <span className="font-mono text-xs text-muted-foreground">{timezone}</span> : null}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          Open 24/7 — no hours set. Add a window to route by time of day.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((w, i) => (
            <div key={i} className="rounded-lg border p-3">
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map(([value, label]) => {
                  const on = w.days.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleDay(i, value)}
                      aria-pressed={on}
                      className={cn(
                        "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                        on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <input
                  type="time"
                  value={w.open}
                  onChange={(e) => setRow(i, { open: e.target.value })}
                  aria-label="Open time"
                  className="rounded-md border bg-transparent px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <span className="text-muted-foreground">to</span>
                <input
                  type="time"
                  value={w.close}
                  onChange={(e) => setRow(i, { close: e.target.value })}
                  aria-label="Close time"
                  className="rounded-md border bg-transparent px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => removeWindow(i)}
                  aria-label="Remove window"
                  className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addWindow}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <Plus className="h-4 w-4" /> Add hours
      </button>

      {saveError ? <p className="mt-3 text-xs text-destructive" role="alert">{saveError}</p> : null}
      <div className="mt-4 flex items-center gap-3 border-t pt-4">
        <button
          type="button"
          onClick={() => void save()}
          disabled={isSaving || schedule === null}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save hours"}
        </button>
        {saved ? <span className="text-xs text-muted-foreground">Saved.</span> : null}
      </div>
    </div>
  );
}
