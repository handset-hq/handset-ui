export type CallStatus =
  | "dialing"
  | "ringing"
  | "in_progress"
  | "completed"
  | "missed"
  | "voicemail"
  | "failed";

export interface Call {
  id: string;
  tenant_id?: string | null;
  phone_number_id?: string;
  direction: "inbound" | "outbound";
  from: string;
  to: string;
  /** The agent's phone on click-to-call calls. */
  connect_to?: string | null;
  status: CallStatus;
  answered_by?: string | null;
  duration_seconds?: number | null;
  recording_id?: string | null;
  voicemail_id?: string | null;
  /**
   * AI recap of a transcribed call — why they called, what was discussed,
   * follow-ups. Null until generated (~15s after a `transcribe: true` call
   * completes; a `call.summary` webhook fires when it's ready).
   */
  summary?: string | null;
  started_at: string;
  ended_at?: string | null;
  events?: { type: string; at: string; detail?: Record<string, unknown> | null }[];
}

export interface Voicemail {
  id: string;
  tenant_id?: string | null;
  call_id: string;
  from?: string;
  duration_seconds: number;
  /** Null until transcription completes. */
  transcript?: string | null;
  /** Time-limited download URL (valid 1 h; re-fetch the voicemail for a fresh one). */
  audio_url?: string;
  created_at: string;
}

export interface TranscriptSegment {
  /** "agent" | "customer" when known. */
  speaker?: string | null;
  text: string;
  occurred_at: string;
}

export interface CallTranscript {
  call_id: string;
  text: string;
  segments: TranscriptSegment[];
}

/** Statuses that mean the call is still moving. */
export const ACTIVE_CALL_STATUSES: readonly CallStatus[] = ["dialing", "ringing", "in_progress"];

export function isCallActive(status: CallStatus): boolean {
  return ACTIVE_CALL_STATUSES.includes(status);
}
