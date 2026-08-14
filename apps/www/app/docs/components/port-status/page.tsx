import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { PortStatus } from "@/components/handset/port-status";

export const metadata = { title: "Port status" };

export default function PortStatusDocs() {
  return (
    <article>
      <DocHeader
        title="Port status"
        lead="Porting a number takes days and generates one support ticket per day of silence. This stepper answers 'where's my number?' before anyone asks."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Preview height={300}>
          <div className="overflow-y-auto p-4">
            <PortStatus portInId="port_demo_live" pollMs={4000} />
          </div>
        </Preview>
        <Preview height={300}>
          <div className="overflow-y-auto p-4">
            <PortStatus portInId="port_demo_action" />
          </div>
        </Preview>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Left: a live port advancing through its lifecycle (~45s loop on this demo). Right: a carrier rejection
        surfaced as a fixable callout.
      </p>

      <DocSection title="Installation">
        <InstallBlock item="port-status" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { PortStatus } from "@/components/handset/port-status";

<PortStatus portInId={portIn.id} />`}
        />
        <p>
          Polls every 30 seconds by default — ports move on carrier time. <InlineCode>action_needed</InlineCode>{" "}
          renders the carrier&apos;s <InlineCode>status_detail</InlineCode> inline (wrong account number, mismatched
          address) so the customer can fix and resubmit instead of emailing support. When a FOC date is confirmed,
          the switch-over date appears in the header.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "portInId", type: "string | null", description: "The port-in request to follow." },
            { name: "pollMs", type: "number", default: "30000", description: "Refresh interval. 0 fetches once." },
            { name: "className", type: "string", description: "Merged onto the wrapper." },
          ]}
        />
      </DocSection>
    </article>
  );
}
