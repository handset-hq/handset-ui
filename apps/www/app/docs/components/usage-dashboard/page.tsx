import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { UsageDashboard } from "@/components/handset/usage-dashboard";

export const metadata = { title: "Usage dashboard" };

const RATES = {
  sms_segment_outbound: 0.008,
  sms_segment_inbound: 0.004,
  voice_minute_outbound: 0.0075,
  voice_minute_inbound: 0.0055,
  transcription_minute: 0.02,
  number_month: 1.0,
};

export default function UsageDashboardDocs() {
  return (
    <article>
      <DocHeader
        title="Usage dashboard"
        lead="A usage breakdown for a period: quantity per kind with comparative bars, plus spend when you pass your per-kind rates. The API summarizes one range, so this is the period view — not a time series."
      />

      <Preview height={360}>
        <div className="w-full max-w-md">
          <UsageDashboard rates={RATES} />
        </div>
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="usage-dashboard" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { UsageDashboard } from "@/components/handset/usage-dashboard";

<UsageDashboard
  tenantId={tenant.id}
  start="2026-08-01"
  rates={{ sms_segment_outbound: 0.008, voice_minute_outbound: 0.0075 }}
/>`}
        />
        <p>
          Takes the same options as <InlineCode>useUsage</InlineCode> (<InlineCode>tenantId</InlineCode>,{" "}
          <InlineCode>start</InlineCode>, <InlineCode>end</InlineCode>). The API returns quantities, not dollars — pass{" "}
          <InlineCode>rates</InlineCode> (your price per kind) and the dashboard totals the spend. Omit it to show
          quantities only.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "tenantId", type: "string", description: "Scope to one tenant's usage." },
            { name: "start / end", type: "string", description: "RFC 3339 or YYYY-MM-DD; defaults to the current month." },
            { name: "rates", type: "Record<UsageKind, number>", description: "USD per unit, to compute spend." },
            { name: "className", type: "string", description: "Merged onto the root card." },
          ]}
        />
      </DocSection>
    </article>
  );
}
