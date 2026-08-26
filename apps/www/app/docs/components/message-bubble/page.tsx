import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { MessageBubble } from "@/components/handset/message-bubble";
import type { OutgoingMessage } from "@handset/react";

export const metadata = { title: "Message bubble" };

const now = "2025-03-04T17:02:00.000Z";
const samples: OutgoingMessage[] = [
  { id: "m1", conversation_id: "c1", direction: "inbound", from: "+14155550142", to: "+14155550100", body: "Hey — are we still on for 2pm?", status: "received", created_at: now },
  { id: "m2", conversation_id: "c1", direction: "outbound", from: "+14155550100", to: "+14155550142", body: "Yes! Marcus is 15 minutes out.", status: "delivered", created_at: now },
  { id: "m3", conversation_id: "c1", direction: "outbound", from: "+14155550100", to: "+14155550142", body: "Sending now…", status: "sending", created_at: now, pending: true },
];

export default function MessageBubbleDocs() {
  return (
    <article>
      <DocHeader
        title="Message bubble"
        lead="One message in a conversation: an SMS/MMS bubble aligned by direction, with media previews, an optimistic dimmed pending state, and a timestamp plus delivery indicator on outbound messages. This is the atomic unit the thread is built from."
      />

      <Preview height={200}>
        <div className="w-full max-w-sm space-y-2">
          {samples.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
        </div>
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="message-bubble" />
        <p>
          Installs <InlineCode>delivery-status</InlineCode> as a dependency.
        </p>
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { MessageBubble } from "@/components/handset/message-bubble";

{messages.map((m) => (
  <MessageBubble key={m.id} message={m} />
))}`}
        />
        <p>
          Pass <InlineCode>hideMeta</InlineCode> to drop the timestamp/delivery row when you stack several bubbles into
          a single group (see <InlineCode>message-group</InlineCode>).
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "message", type: "OutgoingMessage", description: "The message to render (the shape returned by useThread)." },
            { name: "hideMeta", type: "boolean", default: "false", description: "Hide the timestamp + delivery row, for grouping." },
            { name: "className", type: "string", description: "Merged onto the row wrapper." },
          ]}
        />
      </DocSection>
    </article>
  );
}
