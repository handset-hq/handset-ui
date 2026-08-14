import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { UsageMeter } from "@/components/handset/usage-meter";

export const metadata = { title: "Usage meter" };

export default function UsageMeterDocs() {
  return (
    <article>
      <DocHeader
        title="Usage meter"
        lead="A tenant's texting and calling for the period, as labeled quantities with comparative bars. The building block for showing customers their traffic — or re-billing them for it."
      />

      <Preview height={330}>
        <div className="p-4">
          <UsageMeter className="max-w-sm" />
        </div>
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="usage-meter" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { UsageMeter } from "@/components/handset/usage-meter";

// This month, scoped by your proxy to the signed-in tenant:
<UsageMeter />

// A specific billing period:
<UsageMeter start="2026-07-01" end="2026-08-01" title="July usage" />`}
        />
        <p>
          Quantities come straight from Handset&apos;s usage ledger — the same numbers your invoice bills on, so
          what a customer sees here reconciles with what you charge them. Prices are deliberately left out: your
          margin over Handset&apos;s rates is your business, not the component&apos;s. Map quantities to your own
          prices in a wrapping component if you re-bill.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "tenantId", type: "string", description: "Scope to one tenant (usually handled server-side)." },
            { name: "start", type: "string", default: "start of month", description: "RFC 3339 or YYYY-MM-DD." },
            { name: "end", type: "string", default: "now", description: "RFC 3339 or YYYY-MM-DD." },
            { name: "title", type: "string", default: '"Usage this month"', description: "Card heading." },
            { name: "pollMs", type: "number", default: "0", description: "0 = fetch once." },
            { name: "className", type: "string", description: "Merged onto the card." },
          ]}
        />
      </DocSection>
    </article>
  );
}
