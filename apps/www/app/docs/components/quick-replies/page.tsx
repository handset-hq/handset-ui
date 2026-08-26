import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { QuickRepliesDemo } from "@/components/docs/quick-replies-demo";

export const metadata = { title: "Quick replies" };

export default function QuickRepliesDocs() {
  return (
    <article>
      <DocHeader
        title="Quick replies"
        lead="A row of tappable canned responses to drop above a composer. Await-aware: the chosen chip dims while your send resolves, so a slow network can't double-send."
      />

      <Preview height={140}>
        <QuickRepliesDemo />
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="quick-replies" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { QuickReplies } from "@/components/handset/quick-replies";

<QuickReplies
  replies={["On my way", "Running late", "Reschedule?"]}
  onSelect={(text) => thread.send({ body: text })}
/>`}
        />
        <p>
          Pure UI — <InlineCode>onSelect</InlineCode> is yours to wire (to <InlineCode>useThread().send</InlineCode>, a
          template, wherever). Bring the replies from your own config or the top intents in a tenant&apos;s inbox.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "replies", type: "string[]", description: "The canned responses to show." },
            { name: "onSelect", type: "(text: string) => void | Promise<void>", description: "Fired with the chosen reply." },
            { name: "disabled", type: "boolean", description: "Disable all chips." },
            { name: "className", type: "string", description: "Merged onto the row." },
          ]}
        />
      </DocSection>
    </article>
  );
}
