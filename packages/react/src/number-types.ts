export interface AvailableNumber {
  phone_number: string;
  locality?: string | null;
  region?: string | null;
  capabilities?: ("sms" | "mms" | "voice")[];
  monthly_price_usd?: string;
}

export interface PhoneNumber {
  id: string;
  tenant_id?: string | null;
  phone_number: string;
  status?: string;
  routing_config_id?: string | null;
  campaign_id?: string | null;
  e911_address_id?: string | null;
  /** True when attached to an approved campaign — outbound SMS allowed. */
  messaging_ready?: boolean;
  created_at: string;
}

export type PortInStatus =
  | "draft"
  | "in_review"
  | "action_needed"
  | "foc_confirmed"
  | "completed"
  | "cancelled";

export interface PortIn {
  id: string;
  tenant_id: string;
  phone_numbers: string[];
  status: PortInStatus;
  /** Carrier explanation when status is action_needed. */
  status_detail?: string | null;
  entity_name: string;
  authorized_person: string;
  billing_phone_number: string;
  /** Masked (••••1234). */
  account_number: string;
  service_address: { street: string; city: string; state: string; postal_code: string };
  /** Firm order commitment — when the numbers switch over. */
  foc_date?: string | null;
  created_at?: string;
}

export type UsageKind =
  | "sms_segment_outbound"
  | "sms_segment_inbound"
  | "voice_minute_outbound"
  | "voice_minute_inbound"
  | "transcription_minute"
  | "number_month";

export interface UsageSummary {
  object: "usage_summary";
  mode: "live" | "test";
  start: string;
  end: string;
  data: { kind: UsageKind | string; quantity: number }[];
}
