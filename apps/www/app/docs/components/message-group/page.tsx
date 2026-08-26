import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { MessageGroup } from "@/components/handset/message-group";
import type { OutgoingMessage } from "@handset/react";

export const metadata = { title: "Message group" };

const t = "2025-03-04T17:02:00.000Z";
const run: OutgoingMessage[] = [
  { id: "g1", conversation_id: "c1", direction: "outbound", from: "+14155550100", to: "+14155550142", body: "On my way — ETA about 15 minutes.", status: "delivered", created_at: t },
  { id: "g2", conversation_id: "c1", direction: "outbound", from: "+14155550100", to: "+14155550142", body: "Traffic's light so maybe sooner.", status: "delivered", created_at: t },
  { id: "g3", conversation_id: "c1", direction: "outbound", from: "+14155550100", to: "+14155550142", body: "See you soon 🔧", status: "sent", created_at: t },
];

export default function MessageGroupDocs() {
  return (
    <article>
      <DocHeader
        title="Message group"
        lead="A run of consecutive same-direction messages, stacked tightly with a single timestamp and delivery line on the last bubble — the iMessage-style clustering that keeps a busy thread readable."
      />

      <Preview height={200}>
        <div className="w-full max-w-sm">
          <MessageGroup messages={run} />
        </div>
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="message-group" />
        <p>
          Installs <InlineCode>message-bubble</InlineCode> (and, transitively, <InlineCode>delivery-status</InlineCode>).
        </p>
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { MessageGroup, groupMessages } from "@/components/handset/message-group";

{groupMessages(messages).map((run) => (
  <MessageGroup key={run[0].id} messages={run} />
))}`}
        />
        <p>
          The <InlineCode>groupMessages</InlineCode> helper splits a flat, chronological list into same-direction runs.
          Pass each run to a <InlineCode>MessageGroup</InlineCode>.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "messages", type: "OutgoingMessage[]", description: "Consecutive same-direction messages, in order." },
            { name: "className", type: "string", description: "Merged onto the group wrapper." },
          ]}
        />
      </DocSection>
    </article>
  );
}
