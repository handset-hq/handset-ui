import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { Thread } from "@/components/handset/thread";

export const metadata = { title: "Thread" };

export default function ThreadDocs() {
  return (
    <article>
      <DocHeader
        title="Thread"
        lead="One conversation's message history with delivery states on every outbound message, MMS previews, opt-out handling, and a composer wired to reply in place."
      />

      <Preview height={420}>
        <Thread conversationId="cnv_demo_maria" className="h-full" />
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="thread" />
        <p>
          Installs <InlineCode>composer</InlineCode> as a dependency.
        </p>
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { Thread } from "@/components/handset/thread";

<Thread conversationId={conversationId} />`}
        />
        <p>
          Sends are optimistic: the bubble appears instantly at 70% opacity, then resolves to the real message when
          the API accepts it — or flips to a failed state (it never silently disappears). Delivery ticks: clock =
          sending, single check = sent, double check = delivered, red alert = failed. If the contact texted STOP, the
          composer disables and a notice explains why.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "conversationId", type: "string | null", description: "Which conversation to show. null renders an empty state." },
            { name: "hideComposer", type: "boolean", default: "false", description: "Hide the built-in composer to render your own." },
            { name: "pollMs", type: "number", default: "3000", description: "Refresh interval. 0 disables polling." },
            { name: "limit", type: "number", default: "100", description: "Max messages fetched per poll." },
            { name: "className", type: "string", description: "Merged onto the root column." },
          ]}
        />
      </DocSection>
    </article>
  );
}
