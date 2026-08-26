import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { DeliverabilityPanel } from "@/components/handset/deliverability-panel";

export const metadata = { title: "Deliverability panel" };

export default function DeliverabilityPanelDocs() {
  return (
    <article>
      <DocHeader
        title="Deliverability panel"
        lead="Outbound delivery health from the last N messages: the delivery rate, in-flight count, and a breakdown of why sends failed. A live pulse for a support view or an ops sidebar."
      />

      <Preview height={320}>
        <div className="w-full max-w-md">
          <DeliverabilityPanel limit={200} />
        </div>
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="deliverability-panel" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { DeliverabilityPanel } from "@/components/handset/deliverability-panel";

<DeliverabilityPanel tenantId={tenant.id} limit={200} />`}
        />
        <p>
          The Handset API has no stats endpoint, so this aggregates a recent sample of <InlineCode>/messages</InlineCode>{" "}
          client-side. That makes it a live health check, not a billing-grade report — for exact numbers over long
          windows, roll the data up in your own backend. Failure reasons are the API&apos;s{" "}
          <InlineCode>error_code</InlineCode>s (<InlineCode>recipient_opted_out</InlineCode>,{" "}
          <InlineCode>carrier_rejected</InlineCode>, …).
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "tenantId", type: "string", description: "Scope to one tenant's messages." },
            { name: "limit", type: "number", default: "200", description: "How many recent messages to sample." },
            { name: "className", type: "string", description: "Merged onto the root card." },
          ]}
        />
      </DocSection>
    </article>
  );
}
