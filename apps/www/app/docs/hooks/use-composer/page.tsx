import { DocHeader, DocSection } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";

export const metadata = { title: "useComposer" };

export default function UseComposerDocs() {
  return (
    <article>
      <DocHeader
        title="useComposer"
        lead="Draft state, live segment math, and submit wiring — the logic behind Composer, for when you want your own input UI."
      />

      <DocSection title="Usage">
        <CodeBlock
          code={`import { useComposer, useThread } from "@handset/react";

const thread = useThread(conversationId);
const composer = useComposer({ send: thread.send });

composer.setBody("Your table is ready 🎉");
composer.segmentInfo; // { segments: 1, encoding: "ucs2", remaining: 48, … }
await composer.submit(); // clears on success, restores the draft on failure`}
        />
        <p>
          <InlineCode>countSegments</InlineCode> is also exported standalone — GSM-7 vs UCS-2 detection, extended-char
          double counting, 160/153 and 70/67 boundaries — for showing costs anywhere else (campaign builders, template
          editors).
        </p>
      </DocSection>

      <DocSection title="Options">
        <PropsTable
          caption="Options"
          rows={[
            { name: "send", type: "(input: SendInput) => Promise<Message>", description: "Where submitted drafts go." },
            { name: "disabled", type: "boolean", default: "false", description: "Blocks submit (e.g. opted-out contact)." },
          ]}
        />
      </DocSection>

      <DocSection title="Returns">
        <PropsTable
          caption="Return value"
          rows={[
            { name: "body", type: "string", description: "The current draft." },
            { name: "setBody", type: "(value: string) => void", description: "Update the draft." },
            { name: "segmentInfo", type: "SegmentInfo", description: "Segments, encoding, remaining chars, per-segment capacity." },
            { name: "canSend", type: "boolean", description: "Non-empty draft, not disabled, not already sending." },
            { name: "submit", type: "() => Promise<void>", description: "Send the draft. Clears on success; restores it and sets error on failure." },
            { name: "isSending", type: "boolean", description: "True while a submit is in flight." },
            { name: "error", type: "Error | null", description: "Last send failure." },
          ]}
        />
      </DocSection>
    </article>
  );
}
