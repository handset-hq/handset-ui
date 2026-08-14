import { DocHeader, DocSection, InstallBlock } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { DialerDemo } from "@/components/docs/softphone-demos";

export const metadata = { title: "Dialer" };

export default function DialerDocs() {
  return (
    <article>
      <DocHeader
        title="Dialer"
        lead="A phone keypad: type or tap, hit call. During a call the same keys send DTMF tones, so phone trees just work."
      />

      <DialerDemo />
      <p className="mt-2 text-xs text-muted-foreground">Demo mode — place a call and the in-call bar appears.</p>

      <DocSection title="Installation">
        <InstallBlock item="dialer" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { Dialer } from "@/components/handset/dialer";

<Dialer softphone={softphone} callerNumber={tenant.number} />`}
        />
        <p>
          Ten-digit US numbers are normalized to E.164 automatically. The call button reflects connection state
          (Offline / Connecting… / Call), and pairing with <InlineCode>CallHUD</InlineCode> gives you the in-call
          controls.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "softphone", type: "Softphone", description: "The softphone instance." },
            { name: "callerNumber", type: "string", description: "Caller ID for outbound calls." },
            { name: "className", type: "string", description: "Merged onto the wrapper." },
          ]}
        />
      </DocSection>
    </article>
  );
}
