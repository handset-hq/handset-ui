import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { CampaignRegistrationForm } from "@/components/handset/campaign-registration-form";

export const metadata = { title: "Campaign registration form" };

export default function CampaignRegistrationFormDocs() {
  return (
    <article>
      <DocHeader
        title="Campaign registration form"
        lead="A 10DLC campaign registration form. Carriers review the use case, the description, 2–5 sample messages, and how recipients opt in — so the form enforces those minimums before POSTing to /campaigns through your proxy."
      />

      <Preview height={640}>
        <div className="w-full max-w-lg">
          <CampaignRegistrationForm tenantId="tnt_demo" brandId="brd_demo" />
        </div>
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="campaign-registration-form" />
        <p>
          Needs a vetted brand first — see <InlineCode>brand-registration-form</InlineCode> — and the proxy&apos;s{" "}
          <InlineCode>POST /campaigns</InlineCode> route.
        </p>
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { CampaignRegistrationForm } from "@/components/handset/campaign-registration-form";

<CampaignRegistrationForm
  tenantId={tenant.id}
  brandId={brand.id}
  onRegistered={(campaign) => setCampaignId(campaign.id)}
/>`}
        />
        <p>
          Sample messages are dynamic (add up to five, remove down to two). The API rejects fewer than two samples or
          an opt-in description under 40 characters, and the form checks both before submitting.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "tenantId", type: "string", description: "The tenant this campaign belongs to (tnt_…). Required." },
            { name: "brandId", type: "string", description: "The vetted brand to attach (brd_…). Required." },
            { name: "onRegistered", type: "(campaign: Campaign) => void", description: "Called with the created campaign on success." },
            { name: "className", type: "string", description: "Merged onto the form." },
          ]}
        />
      </DocSection>
    </article>
  );
}
