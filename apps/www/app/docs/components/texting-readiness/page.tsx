import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { TextingReadiness } from "@/components/handset/texting-readiness";

export const metadata = { title: "Texting readiness" };

export default function TextingReadinessDocs() {
  return (
    <article>
      <DocHeader
        title="Texting readiness"
        lead="10DLC approval is invisible and slow, and 'why can't I text yet?' is the support ticket it generates. This card makes the pipeline visible instead."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Preview height={230}>
          <div className="p-4">
            <TextingReadiness phoneNumberId="num_demo" />
          </div>
        </Preview>
        <Preview height={230}>
          <div className="p-4">
            <TextingReadiness phoneNumberId="num_demo_pending" />
          </div>
        </Preview>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Left: fully approved. Right: campaign attached, carrier review pending.</p>

      <DocSection title="Installation">
        <InstallBlock item="texting-readiness" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { TextingReadiness } from "@/components/handset/texting-readiness";

// On a settings/onboarding page:
<TextingReadiness phoneNumberId={tenant.numberId} />

// Watching for approval to land (e.g. right after campaign submission):
<TextingReadiness phoneNumberId={tenant.numberId} pollMs={30000} />`}
        />
        <p>
          The three checks map to the number record: active (it exists), campaign attached (
          <InlineCode>campaign_id</InlineCode>), carrier approved (<InlineCode>messaging_ready</InlineCode> — the
          same flag that gates outbound sends). The footer sets expectations honestly: calls and inbound texts work
          immediately; only outbound texting waits on carriers.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "phoneNumberId", type: "string | null", description: "The number to inspect (num_…)." },
            { name: "pollMs", type: "number", default: "0", description: "0 = fetch once. Set ~30000 to watch approval flip." },
            { name: "className", type: "string", description: "Merged onto the card." },
          ]}
        />
      </DocSection>
    </article>
  );
}
