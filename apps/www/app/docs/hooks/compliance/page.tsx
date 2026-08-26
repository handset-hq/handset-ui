import { DocHeader, DocSection } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";

export const metadata = { title: "Compliance hooks" };

export default function ComplianceHooksDocs() {
  return (
    <article>
      <DocHeader
        title="Compliance hooks"
        lead="The headless layer behind the 10DLC and E911 forms: register brands, campaigns, and emergency addresses, and follow a registration to approval. Added in @handset/react 0.4.0."
      />

      <DocSection title="useCompliance">
        <CodeBlock
          code={`const { registerBrand, registerCampaign, registerE911, isSubmitting, error, reset } = useCompliance();

const brand = await registerBrand({
  legalName: "Bayview Dental LLC",
  ein: "12-3456789",
  entityType: "private_company",
  contactEmail: "ops@bayviewdental.com",
  phone: "+14155550142",
  street: "500 Ocean Ave", city: "San Francisco", state: "CA", postalCode: "94112",
});

const campaign = await registerCampaign({
  tenantId, brandId: brand.id,
  useCase: "appointment_reminders",
  description: "Appointment reminders and reschedule links.",
  sampleMessages: ["Your appointment is tomorrow at 2 PM. Reply C to confirm.", "Reply R to reschedule."],
  optInDescription: "Patients check a consent box on the booking form and agree to appointment texts.",
});

await registerE911({ tenantId, street: "500 Ocean Ave", city: "San Francisco", state: "CA", postalCode: "94112" });`}
        />
        <p>
          Each mutation takes camelCase input, maps it to the API body, and resolves with the created resource (or
          throws — <InlineCode>error</InlineCode> holds the last failure, <InlineCode>isSubmitting</InlineCode> is true
          while any one is in flight). The API enforces the carrier rules the forms mirror: a valid EIN and E.164
          phone, 2–5 <InlineCode>sampleMessages</InlineCode>, and an <InlineCode>optInDescription</InlineCode> of at
          least 40 characters. This is the hook behind{" "}
          <InlineCode>brand-registration-form</InlineCode>, <InlineCode>campaign-registration-form</InlineCode>, and{" "}
          <InlineCode>e911-address-form</InlineCode>.
        </p>
      </DocSection>

      <DocSection title="useBrand / useCampaign">
        <CodeBlock
          code={`const { brand } = useBrand(brandId, { pollMs: 15000 });
brand?.status;            // "pending" → "approved" | "rejected"
brand?.rejection_reason;  // set when rejected

const { campaign } = useCampaign(campaignId);
campaign?.status;
campaign?.throughput;     // { messages_per_minute, daily_cap } once approved`}
        />
        <p>
          Both read a single registration and poll while it&apos;s pending, automatically stopping once it settles
          (approved or rejected) so you&apos;re not polling a decided brand forever. Pass{" "}
          <InlineCode>pollMs: 0</InlineCode> to fetch once. This pair drives the{" "}
          <InlineCode>compliance-status</InlineCode> component.
        </p>
      </DocSection>

      <DocSection title="Settled check">
        <CodeBlock
          code={`import { complianceSettled } from "@handset/react";

complianceSettled(brand?.status); // false while pending, true once approved/rejected`}
        />
        <p>
          The same predicate the hooks use to decide when to stop polling — handy if you drive your own UI off a
          registration&apos;s status.
        </p>
      </DocSection>
    </article>
  );
}
