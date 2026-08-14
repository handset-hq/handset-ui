/**
 * API resource shapes, mirrored from the Handset OpenAPI spec.
 *
 * These are duplicated (rather than imported from @handset/sdk) on purpose:
 * this package runs in the browser against a partner's proxy routes and
 * should stay dependency-free.
 */

export type MessageStatus =
  | "queued"
  | "sending"
  | "sent"
  | "delivered"
  | "failed"
  | "received";

export interface Message {
  id: string;
  tenant_id?: string | null;
  conversation_id: string;
  direction: "inbound" | "outbound";
  from: string;
  to: string;
  body?: string | null;
  media_urls?: string[];
  status: MessageStatus;
  error_code?: string | null;
  segments?: number;
  metadata?: Record<string, string>;
  created_at: string;
  status_history?: { status: MessageStatus; at: string }[];
}

export interface Conversation {
  id: string;
  tenant_id?: string | null;
  phone_number_id: string;
  /** The customer-side phone number, E.164. */
  external_number: string;
  last_activity_at: string;
  last_message_preview?: string | null;
  /** True if the external party sent STOP. */
  opted_out?: boolean;
}

export interface Page<T> {
  data: T[];
  has_more: boolean;
  next_cursor?: string | null;
}

export interface ApiError {
  code: string;
  message: string;
  docs_url?: string;
}

/**
 * A message that exists locally but hasn't been acknowledged by the API yet.
 * `pending` is present (with a client-generated id) until the 202 response
 * replaces it with the real Message.
 */
export interface OutgoingMessage extends Message {
  pending?: boolean;
}
