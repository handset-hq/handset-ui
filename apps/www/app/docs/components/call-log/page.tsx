import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { CallLog } from "@/components/handset/call-log";

export const metadata = { title: "Call log" };

export default function CallLogDocs() {
  return (
    <article>
      <DocHeader
        title="Call log"
        lead="Call history the way a phone shows it: direction icons, outcomes, durations — and each row expands into the call's transcript."
      />

      <Preview height={300}>
        <div className="overflow-y-auto p-4">
          <CallLog />
        </div>
      </Preview>
      <p className="mt-2 text-xs text-muted-foreground">Expand the completed call to read its transcript.</p>

      <DocSection title="Installation">
        <InstallBlock item="call-log" />
        <p>
          Installs <InlineCode>call-transcript</InlineCode> as a dependency for the expandable rows.
        </p>
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { CallLog } from "@/components/handset/call-log";

<CallLog />                              // everything
<CallLog phoneNumberId={number.id} />    // one line's history`}
        />
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "tenantId", type: "string", description: "Scope to one tenant (usually handled server-side)." },
            { name: "phoneNumberId", type: "string", description: "Only calls on one number." },
            { name: "formatNumber", type: "(e164: string) => string", default: "US formatter", description: "Display formatting for numbers." },
            { name: "pollMs", type: "number", default: "10000", description: "Refresh interval. 0 disables polling." },
            { name: "limit", type: "number", default: "25", description: "Page size." },
            { name: "className", type: "string", description: "Merged onto the list wrapper." },
          ]}
        />
      </DocSection>
    </article>
  );
}
