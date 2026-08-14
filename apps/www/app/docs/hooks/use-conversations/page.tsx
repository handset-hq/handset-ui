import { DocHeader, DocSection } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";

export const metadata = { title: "useConversations" };

export default function UseConversationsDocs() {
  return (
    <article>
      <DocHeader
        title="useConversations"
        lead="The headless conversation list: polling, cursor pagination, and merge-by-id so refreshes never clobber pages the user has already scrolled through."
      />

      <DocSection title="Usage">
        <CodeBlock
          code={`import { useConversations } from "@handset/react";

const { conversations, isLoading, error, hasMore, loadMore, refresh } =
  useConversations({ pollMs: 5000 });`}
        />
        <p>
          Powers <InlineCode>Inbox</InlineCode>. Use it directly when you want your own list UI — a dropdown of
          recent texts, a badge count, a CRM sidebar.
        </p>
      </DocSection>

      <DocSection title="Options">
        <PropsTable
          caption="Options"
          rows={[
            { name: "tenantId", type: "string", description: "Scope to one tenant (usually handled by your proxy)." },
            { name: "pollMs", type: "number", default: "5000", description: "Poll interval. 0 disables polling." },
            { name: "limit", type: "number", default: "50", description: "Page size." },
          ]}
        />
      </DocSection>

      <DocSection title="Returns">
        <PropsTable
          caption="Return value"
          rows={[
            { name: "conversations", type: "Conversation[]", description: "Newest activity first, deduped by id." },
            { name: "isLoading", type: "boolean", description: "True until the first page resolves." },
            { name: "error", type: "Error | null", description: "Last fetch error; clears on a successful poll." },
            { name: "hasMore", type: "boolean", description: "Whether another page exists." },
            { name: "loadMore", type: "() => Promise<void>", description: "Fetch and append the next page." },
            { name: "refresh", type: "() => Promise<void>", description: "Re-fetch the first page immediately." },
          ]}
        />
      </DocSection>
    </article>
  );
}
