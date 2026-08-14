import { DocHeader, DocSection } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";

export const metadata = { title: "useThread" };

export default function UseThreadDocs() {
  return (
    <article>
      <DocHeader
        title="useThread"
        lead="One conversation's live state: polled history, the conversation record, and a send() with optimistic updates and idempotent retries."
      />

      <DocSection title="Usage">
        <CodeBlock
          code={`import { useThread } from "@handset/react";

const thread = useThread(conversationId);

// Reply — from/to derive from the conversation itself:
await thread.send({ body: "On our way!" });`}
        />
        <p>
          Sends append an optimistic message immediately (<InlineCode>pending: true</InlineCode>), then swap in the
          API&apos;s accepted message. On failure the bubble flips to <InlineCode>failed</InlineCode> instead of
          vanishing. The optimistic local id doubles as the <InlineCode>Idempotency-Key</InlineCode>, so a retried
          request can never double-send.
        </p>
      </DocSection>

      <DocSection title="Options">
        <PropsTable
          caption="Options"
          rows={[
            { name: "conversationId", type: "string | null", description: "First argument. null renders nothing and stops polling." },
            { name: "pollMs", type: "number", default: "3000", description: "Poll interval. 0 disables polling." },
            { name: "limit", type: "number", default: "100", description: "Max messages fetched per poll." },
          ]}
        />
      </DocSection>

      <DocSection title="Returns">
        <PropsTable
          caption="Return value"
          rows={[
            { name: "conversation", type: "Conversation | null", description: "The conversation record, including opted_out." },
            { name: "messages", type: "OutgoingMessage[]", description: "Oldest first; includes optimistic entries." },
            { name: "send", type: "(input: SendInput) => Promise<Message>", description: "Reply in this conversation. Throws on failure." },
            { name: "isSending", type: "boolean", description: "True while a send is in flight." },
            { name: "isLoading", type: "boolean", description: "True until the first fetch resolves." },
            { name: "error", type: "Error | null", description: "Last fetch error." },
            { name: "refresh", type: "() => Promise<void>", description: "Force an immediate re-fetch." },
          ]}
        />
      </DocSection>
    </article>
  );
}
