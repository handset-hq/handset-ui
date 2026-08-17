import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { DTMFPadDemo } from "@/components/docs/softphone-demos";

export const metadata = { title: "DTMF pad" };

export default function DTMFPadDocs() {
  return (
    <article>
      <DocHeader
        title="DTMF pad"
        lead="The in-call keypad: sends tones on the active call — dial an extension, enter a PIN, answer a press-1 menu. Disabled until a call is active; each press plays the real dual-tone frequencies locally."
      />

      <Preview height={340}>
        <div className="flex items-start justify-center p-6">
          <DTMFPadDemo />
        </div>
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="dtmf-pad" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { DTMFPad } from "@/components/handset/dtmf-pad";

<DTMFPad softphone={softphone} />`}
        />
        <p>
          Prefer it attached to the in-call bar? <InlineCode>CallHUD</InlineCode> takes a{" "}
          <InlineCode>keypad</InlineCode> prop that pops this pad underneath — no separate wiring.
        </p>
        <p>
          The pad also accepts keyboard input while focused: digits, <InlineCode>*</InlineCode>, and{" "}
          <InlineCode>#</InlineCode> send directly.
        </p>
      </DocSection>

      <DocSection title="Server-side DTMF">
        <p>
          This component sends tones from the browser&apos;s media stream. The API can also press keys and ask
          keypad questions on any call — including ones no browser is on — via{" "}
          <InlineCode>POST /v1/calls/{"{id}"}/dtmf</InlineCode> and <InlineCode>/gather</InlineCode>; see the{" "}
          <a className="underline underline-offset-4" href="https://docs.handset.dev/api.html">
            API reference
          </a>
          .
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "softphone", type: "Softphone", description: "The connected softphone instance." },
            { name: "tones", type: "boolean", default: "true", description: "Play local dual-tone feedback on each press." },
            { name: "onDigit", type: "(digit: string) => void", description: "Called after each digit is sent." },
            { name: "className", type: "string", description: "Merged onto the pad wrapper." },
          ]}
        />
      </DocSection>
    </article>
  );
}
