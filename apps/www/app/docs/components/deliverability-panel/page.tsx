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
        lead="Outbound delivery health over a window: delivery rate, status counts, and a breakdown of why sends failed. Served by the API's GET /messages/stats, so the aggregation is server-side — accurate over any window, not a client-side sample."
      />

      <Preview height={320}>
        <div className="w-full max-w-md">
          <DeliverabilityPanel />
        </div>
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="deliverability-panel" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { DeliverabilityPanel } from "@/components/handset/deliverability-panel";

<DeliverabilityPanel tenantId={tenant.id} start="2026-08-01" />`}
        />
        <p>
          Reads <InlineCode>GET /messages/stats</InlineCode> through your proxy. The window defaults to the last 30 days
          server-side; pass <InlineCode>start</InlineCode> / <InlineCode>end</InlineCode> (RFC 3339 or YYYY-MM-DD) to
          change it. <InlineCode>delivery_rate</InlineCode> is delivered / (delivered + failed); in-flight messages
          (<InlineCode>sent</InlineCode>, <InlineCode>pending</InlineCode>) are shown but excluded from that ratio.
          Failure reasons are the API&apos;s <InlineCode>error_code</InlineCode>s.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "tenantId", type: "string", description: "Scope to one tenant's messages." },
            { name: "start / end", type: "string", description: "Window bounds (RFC 3339 or YYYY-MM-DD). Default: last 30 days." },
            { name: "className", type: "string", description: "Merged onto the root card." },
          ]}
        />
      </DocSection>
    </article>
  );
}
