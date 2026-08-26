/**
 * 10DLC compliance + E911 resource shapes, mirrored from the Handset OpenAPI
 * spec. Duplicated here (not imported from @handset/sdk) so this package stays
 * browser-safe and dependency-free, like the other resource types.
 */

export type ComplianceStatus = "pending" | "approved" | "rejected";

/**
 * True once a registration has settled — approved or rejected — and no longer
 * needs polling. Tolerant of the various terminal labels carriers report.
 */
export function complianceSettled(status: string | null | undefined): boolean {
  const s = (status ?? "").toLowerCase();
  if (!s || s === "pending") return false;
  return (
    s.includes("approv") ||
    s.includes("reject") ||
    s.includes("fail") ||
    s.includes("invalid") ||
    s === "active" ||
    s === "valid" ||
    s === "verified"
  );
}

export type BrandEntityType = "private_company" | "public_company" | "non_profit" | "sole_proprietor";

export interface Brand {
  id: string;
  tenant_id?: string | null;
  legal_name: string;
  dba?: string | null;
  /** Masked, e.g. **-***6789. */
  ein: string;
  entity_type: string;
  website?: string | null;
  contact_email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  status: string;
  rejection_reason?: string | null;
  created_at: string;
}

/** Input to register a 10DLC brand (camelCase; mapped to the API body). */
export interface BrandRegistration {
  tenantId?: string;
  legalName: string;
  dba?: string;
  ein: string;
  entityType: BrandEntityType;
  website?: string;
  contactEmail: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
}

export type CampaignUseCase =
  | "customer_care"
  | "appointment_reminders"
  | "marketing"
  | "two_factor"
  | "mixed";

export interface CampaignThroughput {
  messages_per_minute?: number | null;
  daily_cap?: number | null;
}

export interface Campaign {
  id: string;
  tenant_id: string;
  brand_id: string;
  use_case: string;
  description: string;
  sample_messages: string[];
  opt_in_description?: string | null;
  status: string;
  rejection_reason?: string | null;
  throughput?: CampaignThroughput;
  created_at: string;
}

/** Input to register a 10DLC campaign (camelCase; mapped to the API body). */
export interface CampaignRegistration {
  tenantId: string;
  brandId: string;
  useCase: CampaignUseCase;
  description: string;
  /** 2–5 representative messages carriers review. */
  sampleMessages: string[];
  /** How recipients opt in; the API requires at least 40 characters. */
  optInDescription: string;
}

export interface E911Address {
  id: string;
  tenant_id: string;
  street: string;
  unit?: string | null;
  city: string;
  state: string;
  postal_code: string;
  status: string;
  created_at: string;
}

/** Input to register an E911 emergency address (camelCase). */
export interface E911Registration {
  tenantId: string;
  street: string;
  unit?: string;
  city: string;
  state: string;
  postalCode: string;
}
