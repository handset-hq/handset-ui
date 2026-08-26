import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { PortInWizard } from "@/components/handset/port-in-wizard";

export const metadata = { title: "Port-in wizard" };

export default function PortInWizardDocs() {
  return (
    <article>
      <DocHeader
        title="Port-in wizard"
        lead="A guided port-in: check portability, collect the losing-carrier account details, open a draft, and submit it for review — the create/submit flow that port-status only lets you watch."
      />

      <Preview height={360}>
        <div className="w-full max-w-lg">
          <PortInWizard tenantId="tnt_demo" />
        </div>
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="port-in-wizard" />
        <p>
          Uses the proxy&apos;s porting routes (<InlineCode>POST /port_ins/check</InlineCode>,{" "}
          <InlineCode>/port_ins</InlineCode>, <InlineCode>/port_ins/:id/submit</InlineCode>). Pair with{" "}
          <InlineCode>port-status</InlineCode> to follow the order afterward.
        </p>
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { PortInWizard } from "@/components/handset/port-in-wizard";

<PortInWizard tenantId={tenant.id} onSubmitted={(port) => router.push(\`/ports/\${port.id}\`)} />`}
        />
        <p>
          Built on <InlineCode>usePorting</InlineCode>. Try <InlineCode>+14155550142</InlineCode> in the demo (a number
          containing <InlineCode>0004</InlineCode> comes back not portable, so you can see that path). Submitting sends
          the order to the carrier and can&apos;t be edited afterward.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "tenantId", type: "string", description: "The tenant the ported numbers belong to (tnt_…)." },
            { name: "onSubmitted", type: "(portIn: PortIn) => void", description: "Called with the submitted order." },
            { name: "className", type: "string", description: "Merged onto the root card." },
          ]}
        />
      </DocSection>
    </article>
  );
}
