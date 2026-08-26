import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { ComplianceStatus } from "@/components/handset/compliance-status";

export const metadata = { title: "Compliance status" };

export default function ComplianceStatusDocs() {
  return (
    <article>
      <DocHeader
        title="Compliance status"
        lead="Tracks 10DLC brand and campaign approval in one place: a status badge, the carrier's rejection reason when rejected, and the assigned throughput once a campaign is approved. Polls while anything is pending and stops when everything settles."
      />

      <Preview height={200}>
        <div className="w-full max-w-md">
          <ComplianceStatus brandId="brd_demo" campaignId="cmp_demo" pollMs={0} />
        </div>
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="compliance-status" />
        <p>
          Reads <InlineCode>GET /brands/:id</InlineCode> and <InlineCode>GET /campaigns/:id</InlineCode> through your
          proxy. Pair it with the registration forms to show applicants where their submission stands.
        </p>
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { ComplianceStatus } from "@/components/handset/compliance-status";

<ComplianceStatus brandId={brand.id} campaignId={campaign.id} />`}
        />
        <p>
          Pass either id or both. It polls every 15s while a registration is pending and stops once it&apos;s approved
          or rejected. Set <InlineCode>pollMs={0}</InlineCode> to fetch once without polling.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "brandId", type: "string", description: "A brand to track (brd_…)." },
            { name: "campaignId", type: "string", description: "A campaign to track (cmp_…)." },
            { name: "pollMs", type: "number", default: "15000", description: "Poll interval while pending. 0 fetches once." },
            { name: "className", type: "string", description: "Merged onto the card." },
          ]}
        />
      </DocSection>
    </article>
  );
}
