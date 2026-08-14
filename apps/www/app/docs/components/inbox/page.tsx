import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { Inbox } from "@/components/handset/inbox";

export const metadata = { title: "Inbox" };

export default function InboxDocs() {
  return (
    <article>
      <DocHeader
        title="Inbox"
        lead="A polling conversation list: newest activity first, last-message previews, relative timestamps, STOP badges for opted-out contacts, and infinite scroll."
      />

      <Preview height={300}>
        <Inbox className="h-full" />
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="inbox" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { Inbox } from "@/components/handset/inbox";

<Inbox
  selectedId={selectedId}
  onSelect={(conversation) => setSelectedId(conversation.id)}
/>`}
        />
        <p>
          Pair it with <InlineCode>Thread</InlineCode> for a full surface, or use it alone as a &quot;recent
          texts&quot; panel. The list refreshes every 5 seconds and pauses while the tab is hidden.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "selectedId", type: "string | null", description: "Highlights the active conversation." },
            { name: "onSelect", type: "(c: Conversation) => void", description: "Called when a row is clicked." },
            { name: "formatNumber", type: "(e164: string) => string", default: "US formatter", description: "Display formatting for the customer number." },
            { name: "tenantId", type: "string", description: "Scope to one tenant (usually handled server-side)." },
            { name: "pollMs", type: "number", default: "5000", description: "Refresh interval. 0 disables polling." },
            { name: "limit", type: "number", default: "50", description: "Page size for pagination." },
            { name: "className", type: "string", description: "Merged onto the scroll container." },
          ]}
        />
      </DocSection>
    </article>
  );
}
