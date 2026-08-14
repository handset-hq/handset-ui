import { DocHeader, DocSection, InstallBlock } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { ComposerDemo } from "./composer-demo";

export const metadata = { title: "Composer" };

export default function ComposerDocs() {
  return (
    <article>
      <DocHeader
        title="Composer"
        lead="A draft box that knows SMS: live segment counting, unicode detection, Enter-to-send, and error recovery that gives the user their text back."
      />

      <ComposerDemo />
      <p className="mt-2 text-xs text-muted-foreground">
        Type past 160 characters — or paste an emoji — and watch the counter.
      </p>

      <DocSection title="Installation">
        <InstallBlock item="composer" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { Composer } from "@/components/handset/composer";

// Inside a thread (the usual case — Thread does this for you):
<Composer send={thread.send} disabled={conversation?.opted_out} />

// Anywhere else: hand it any (input) => Promise<Message>
<Composer send={({ body }) => sendCampaignMessage(body)} />`}
        />
        <p>
          The segment counter runs the real GSM-7/UCS-2 math from <InlineCode>@handset/react</InlineCode>&apos;s{" "}
          <InlineCode>countSegments</InlineCode> — one emoji flips a 160-char message to 70-char unicode segments,
          and your users see that before they hit send, not on the invoice.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "send", type: "(input: SendInput) => Promise<Message>", description: "Where drafts go. Usually useThread(...).send." },
            { name: "disabled", type: "boolean", default: "false", description: "Disables input and send (e.g. opted-out contact)." },
            { name: "placeholder", type: "string", default: '"Type a message…"', description: "Textarea placeholder." },
            { name: "className", type: "string", description: "Merged onto the wrapper." },
          ]}
        />
      </DocSection>
    </article>
  );
}
