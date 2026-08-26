/**
 * Voice routing-config shapes (business hours + ring/voicemail behavior),
 * mirrored from the Handset OpenAPI spec. Browser-safe, dependency-free.
 */

export interface Window {
  /** Lowercased 3-letter day names: sun, mon, tue, wed, thu, fri, sat. */
  days: string[];
  /** 24h clock, "08:00". */
  open: string;
  /** 24h clock, "17:30". */
  close: string;
}

export interface BusinessHours {
  schedule: Window[];
}

export interface Behavior {
  type: "ring" | "voicemail";
  // ring
  targets?: string[];
  strategy?: "simultaneous" | "sequential";
  timeout_seconds?: number;
  no_answer?: Behavior;
  // voicemail
  greeting_text?: string | null;
  greeting_audio_url?: string | null;
  transcribe?: boolean | null;
}

export interface RecordingPolicy {
  enabled: boolean;
  consent_announcement: boolean;
}

export interface RoutingConfig {
  id: string;
  tenant_id: string;
  name: string;
  business_hours?: BusinessHours | null;
  open_behavior: Behavior;
  closed_behavior?: Behavior | null;
  recording?: RecordingPolicy | null;
  created_at: string;
}

/** A partial routing config for PATCH /routing_configs/:id. */
export interface RoutingConfigUpdate {
  name?: string;
  business_hours?: BusinessHours | null;
  open_behavior?: Behavior;
  closed_behavior?: Behavior | null;
  recording?: RecordingPolicy | null;
}
