"use client";

import { useCallTranscript, type UseCallTranscriptOptions } from "@handset/react";
import { cn } from "@/lib/utils";

export interface CallTranscriptViewProps extends UseCallTranscriptOptions {
  callId: string | null;
  className?: string;
}

/**
 * A call's transcript as a speaker-labeled exchange. Set `pollMs` (~2000)
 * to follow a live call; leave it 0 for finished calls.
 */
export function CallTranscriptView({ callId, className, ...options }: CallTranscriptViewProps) {
  const { transcript, isEmpty, isLoading, error } = useCallTranscript(callId, options);

  if (isLoading && !transcript) {
    return (
      <div className={cn("space-y-2", className)} aria-hidden="true">
        {[70, 45, 60].map((w, i) => (
          <div key={i} className="h-3.5 animate-pulse rounded bg-muted" style={{ width: `${w}%` }} />
        ))}
      </div>
    );
  }
  if (error) return <p className={cn("text-sm text-destructive", className)}>{error.message}</p>;
  if (isEmpty || !transcript) {
    return <p className={cn("text-sm italic text-muted-foreground", className)}>No transcript for this call.</p>;
  }

  return (
    <ol className={cn("space-y-2.5", className)}>
      {transcript.segments.map((segment, i) => (
        <li key={`${segment.occurred_at}-${i}`} className="text-sm leading-relaxed">
          <span
            className={cn(
              "mr-2 inline-block w-16 shrink-0 text-[11px] font-medium uppercase tracking-wide",
              segment.speaker === "agent" ? "text-primary" : "text-muted-foreground",
            )}
          >
            {segment.speaker ?? "speaker"}
          </span>
          <span className="text-foreground/90">{segment.text}</span>
        </li>
      ))}
    </ol>
  );
}
