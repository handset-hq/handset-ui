"use client";

import * as React from "react";
import { useRoutingConfig, type Behavior, type RoutingWindow } from "@handset/react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS: [string, string][] = [
  ["mon", "Mon"], ["tue", "Tue"], ["wed", "Wed"], ["thu", "Thu"], ["fri", "Fri"], ["sat", "Sat"], ["sun", "Sun"],
];

export interface RoutingBuilderProps {
  /** The routing config to edit (rtc_…). */
  routingConfigId: string;
  timezone?: string;
  onSaved?: () => void;
  className?: string;
}

/**
 * The full voice routing editor: business hours, what happens when you're open
 * vs closed (ring targets + strategy, or straight to voicemail), and the
 * recording policy. Reads and PATCHes one routing config.
 */
export function RoutingBuilder({ routingConfigId, timezone, onSaved, className }: RoutingBuilderProps) {
  const { config, isLoading, error, update, isSaving } = useRoutingConfig(routingConfigId);
  const [schedule, setSchedule] = React.useState<RoutingWindow[] | null>(null);
  const [open, setOpen] = React.useState<Behavior | null>(null);
  const [closed, setClosed] = React.useState<Behavior | null>(null);
  const [recEnabled, setRecEnabled] = React.useState(false);
  const [recConsent, setRecConsent] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    if (config && schedule === null) {
      setSchedule(config.business_hours?.schedule ?? []);
      setOpen(config.open_behavior);
      setClosed(config.closed_behavior ?? { type: "voicemail", transcribe: true });
      setRecEnabled(config.recording?.enabled ?? false);
      setRecConsent(config.recording?.consent_announcement ?? false);
    }
  }, [config, schedule]);

  const rows = schedule ?? [];
  const dirty = () => setSaved(false);
  const setRow = (i: number, patch: Partial<RoutingWindow>) => {
    setSchedule(rows.map((w, idx) => (idx === i ? { ...w, ...patch } : w)));
    dirty();
  };
  const toggleDay = (i: number, day: string) =>
    setRow(i, { days: rows[i].days.includes(day) ? rows[i].days.filter((d) => d !== day) : [...rows[i].days, day] });

  const save = async () => {
    if (!config || !open || !closed) return;
    setSaveError(null);
    try {
      await update({
        name: config.name,
        business_hours: { schedule: rows },
        open_behavior: open,
        closed_behavior: closed,
        recording: { enabled: recEnabled, consent_announcement: recConsent },
      });
      setSaved(true);
      onSaved?.();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save the routing.");
    }
  };

  if (isLoading && !config) {
    return <div className={cn("h-64 animate-pulse rounded-lg border bg-muted/40", className)} aria-hidden="true" />;
  }
  if (error && !config) {
    return <p className={cn("text-sm text-destructive", className)}>{error.message}</p>;
  }

  return (
    <div className={cn("space-y-6 rounded-lg border p-4", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium">{config?.name ?? "Call routing"}</p>
        {timezone ? <span className="font-mono text-xs text-muted-foreground">{timezone}</span> : null}
      </div>

      <Section title="Business hours">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Open 24/7 — add a window to route by time of day.</p>
        ) : (
          <div className="space-y-3">
            {rows.map((w, i) => (
              <div key={i} className="rounded-lg border p-3">
                <div className="flex flex-wrap gap-1.5">
                  {DAYS.map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={w.days.includes(value)}
                      onClick={() => toggleDay(i, value)}
                      className={cn(
                        "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                        w.days.includes(value)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/70",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <input type="time" value={w.open} onChange={(e) => setRow(i, { open: e.target.value })} aria-label="Open time" className={timeCls} />
                  <span className="text-muted-foreground">to</span>
                  <input type="time" value={w.close} onChange={(e) => setRow(i, { close: e.target.value })} aria-label="Close time" className={timeCls} />
                  <button type="button" onClick={() => { setSchedule(rows.filter((_, idx) => idx !== i)); dirty(); }} aria-label="Remove window" className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => { setSchedule([...rows, { days: ["mon", "tue", "wed", "thu", "fri"], open: "09:00", close: "17:00" }]); dirty(); }}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <Plus className="h-4 w-4" /> Add hours
        </button>
      </Section>

      {open ? (
        <Section title="When open">
          <BehaviorEditor behavior={open} onChange={(b) => { setOpen(b); dirty(); }} />
        </Section>
      ) : null}

      {closed ? (
        <Section title="When closed">
          <BehaviorEditor behavior={closed} onChange={(b) => { setClosed(b); dirty(); }} />
        </Section>
      ) : null}

      <Section title="Recording">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={recEnabled} onChange={(e) => { setRecEnabled(e.target.checked); dirty(); }} className="h-4 w-4 accent-[var(--color-primary)]" />
          Record calls on this line
        </label>
        {recEnabled ? (
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={recConsent} onChange={(e) => { setRecConsent(e.target.checked); dirty(); }} className="h-4 w-4 accent-[var(--color-primary)]" />
            Play a consent announcement first
          </label>
        ) : null}
      </Section>

      {saveError ? <p className="text-xs text-destructive" role="alert">{saveError}</p> : null}
      <div className="flex items-center gap-3 border-t pt-4">
        <button
          type="button"
          onClick={() => void save()}
          disabled={isSaving || schedule === null}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save routing"}
        </button>
        {saved ? <span className="text-xs text-muted-foreground">Saved.</span> : null}
      </div>
    </div>
  );
}

function BehaviorEditor({ behavior, onChange }: { behavior: Behavior; onChange: (b: Behavior) => void }) {
  const isRing = behavior.type === "ring";
  const rollsToVoicemail = behavior.no_answer?.type === "voicemail";

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(["ring", "voicemail"] as const).map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={behavior.type === t}
            onClick={() =>
              onChange(
                t === "ring"
                  ? { type: "ring", targets: behavior.targets ?? [], strategy: behavior.strategy ?? "simultaneous", timeout_seconds: behavior.timeout_seconds ?? 20, no_answer: behavior.no_answer }
                  : { type: "voicemail", greeting_text: behavior.greeting_text ?? null, transcribe: behavior.transcribe ?? true },
              )
            }
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              behavior.type === t ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted",
            )}
          >
            {t === "ring" ? "Ring" : "Voicemail"}
          </button>
        ))}
      </div>

      {isRing ? (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Ring these (one per line)</label>
            <textarea
              rows={2}
              value={(behavior.targets ?? []).join("\n")}
              onChange={(e) => onChange({ ...behavior, targets: e.target.value.split(/\n+/).map((s) => s.trim()).filter(Boolean) })}
              placeholder={"+14155550100\nclient:wc_…"}
              className={fieldCls}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label className="flex items-center gap-2">
              Strategy
              <select
                value={behavior.strategy ?? "simultaneous"}
                onChange={(e) => onChange({ ...behavior, strategy: e.target.value as "simultaneous" | "sequential" })}
                className={timeCls}
              >
                <option value="simultaneous">All at once</option>
                <option value="sequential">One at a time</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              Ring for
              <input
                type="number"
                min={5}
                max={120}
                value={behavior.timeout_seconds ?? 20}
                onChange={(e) => onChange({ ...behavior, timeout_seconds: Number(e.target.value) })}
                className={cn(timeCls, "w-20")}
              />
              s
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={rollsToVoicemail}
              onChange={(e) => onChange({ ...behavior, no_answer: e.target.checked ? { type: "voicemail", transcribe: true } : undefined })}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            Roll to voicemail if no one answers
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Greeting</label>
            <textarea
              rows={2}
              value={behavior.greeting_text ?? ""}
              onChange={(e) => onChange({ ...behavior, greeting_text: e.target.value || null })}
              placeholder="You've reached Bayview Dental. Leave a message and we'll call you back."
              className={fieldCls}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={behavior.transcribe ?? true}
              onChange={(e) => onChange({ ...behavior, transcribe: e.target.checked })}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            Transcribe voicemails
          </label>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

const timeCls = cn(
  "rounded-md border bg-transparent px-2 py-1.5 text-sm",
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
);
const fieldCls = cn(
  "w-full rounded-md border bg-transparent px-3 py-2 text-sm",
  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
);
