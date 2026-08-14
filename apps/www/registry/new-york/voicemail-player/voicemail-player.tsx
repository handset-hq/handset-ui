"use client";

import * as React from "react";
import { useVoicemails, type UseVoicemailsOptions, type Voicemail } from "@handset/react";
import { Pause, Play, Voicemail as VoicemailIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VoicemailPlayerProps {
  voicemail: Voicemail;
  /**
   * Called when playback fails (audio URLs expire after an hour). Return a
   * fresh voicemail to retry — `useVoicemails(...).refreshVoicemail` fits.
   */
  onExpired?: (id: string) => Promise<Voicemail>;
  className?: string;
}

/** One voicemail: play/pause, scrubber, duration, and the transcript. */
export function VoicemailPlayer({ voicemail, onExpired, className }: VoicemailPlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [src, setSrc] = React.useState(voicemail.audio_url);
  const [playing, setPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const retriedRef = React.useRef(false);

  React.useEffect(() => setSrc(voicemail.audio_url), [voicemail.audio_url]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      try {
        await audio.play();
      } catch {
        if (!retriedRef.current && onExpired) {
          retriedRef.current = true;
          const fresh = await onExpired(voicemail.id);
          setSrc(fresh.audio_url);
          setTimeout(() => void audioRef.current?.play(), 50);
        }
      }
    }
  };

  return (
    <div className={cn("rounded-lg border p-3", className)}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void toggle()}
          aria-label={playing ? "Pause voicemail" : "Play voicemail"}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 pl-0.5" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-medium">{voicemail.from ?? "Unknown caller"}</span>
            <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
              {formatDuration(voicemail.duration_seconds)} · {formatDate(voicemail.created_at)}
            </span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-[width]" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      </div>
      {voicemail.transcript ? (
        <p className="mt-2.5 border-t pt-2.5 text-sm leading-relaxed text-muted-foreground">{voicemail.transcript}</p>
      ) : (
        <p className="mt-2.5 border-t pt-2.5 text-xs italic text-muted-foreground">Transcribing…</p>
      )}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- transcript rendered above */}
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
        }}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (el.duration > 0) setProgress(el.currentTime / el.duration);
        }}
      />
    </div>
  );
}

export interface VoicemailListProps extends UseVoicemailsOptions {
  className?: string;
}

/** All voicemails, newest first, each rendered as a player. */
export function VoicemailList({ className, ...options }: VoicemailListProps) {
  const { voicemails, isLoading, error, hasMore, loadMore, refreshVoicemail } = useVoicemails(options);

  if (isLoading && voicemails.length === 0) {
    return (
      <div className={cn("space-y-2", className)} aria-hidden="true">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg border bg-muted/50" />
        ))}
      </div>
    );
  }
  if (error && voicemails.length === 0) {
    return <p className={cn("text-sm text-destructive", className)}>{error.message}</p>;
  }
  if (voicemails.length === 0) {
    return (
      <div className={cn("flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center", className)}>
        <VoicemailIcon className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No voicemails yet.</p>
      </div>
    );
  }
  return (
    <div className={cn("space-y-2", className)}>
      {voicemails.map((vm) => (
        <VoicemailPlayer key={vm.id} voicemail={vm} onExpired={refreshVoicemail} />
      ))}
      {hasMore ? (
        <button
          type="button"
          onClick={() => void loadMore()}
          className="w-full rounded-lg border py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60"
        >
          Load more
        </button>
      ) : null}
    </div>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  const sameDay = date.toDateString() === new Date().toDateString();
  if (sameDay) return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
