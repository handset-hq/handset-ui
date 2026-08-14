import { DocHeader, DocSection, InstallBlock } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { IncomingToastDemo } from "@/components/docs/softphone-demos";

export const metadata = { title: "Incoming call toast" };

export default function IncomingCallToastDocs() {
  return (
    <article>
      <DocHeader
        title="Incoming call toast"
        lead="When a customer calls the tenant's number and routing includes this seat, the browser rings: caller number, answer, decline."
      />

      <IncomingToastDemo />
      <p className="mt-2 text-xs text-muted-foreground">
        Demo mode — stage a call, then answer it and watch the HUD take over.
      </p>

      <DocSection title="Installation">
        <InstallBlock item="incoming-call-toast" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { IncomingCallToast } from "@/components/handset/incoming-call-toast";

// Mount once in your app shell; silent until something rings.
<IncomingCallToast softphone={softphone} />`}
        />
        <p>
          Calls reach the browser when the tenant&apos;s routing config lists the seat as a ring target
          (<InlineCode>client:wc_…</InlineCode>). With several targets configured, browser and cell phones ring
          together and the first to answer wins — decline here and a co-worker&apos;s phone keeps ringing.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "softphone", type: "Softphone", description: "The softphone instance." },
            { name: "position", type: '"bottom-right" | "top-right" | "static"', default: '"bottom-right"', description: "Float it, or render inline with static." },
            { name: "formatNumber", type: "(e164: string) => string", default: "US formatter", description: "Display formatting for the caller." },
            { name: "className", type: "string", description: "Merged onto the toast." },
          ]}
        />
      </DocSection>
    </article>
  );
}
