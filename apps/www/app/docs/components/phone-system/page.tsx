import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { PhoneSystem } from "@/components/handset/phone-system";

export const metadata = { title: "Phone system" };

export default function PhoneSystemDocs() {
  return (
    <article>
      <DocHeader
        title="Phone system"
        lead="Texting, call history, and voicemail behind three tabs. The one-import version of 'your product has a phone system now.'"
      />

      <Preview height={500}>
        <div className="h-full p-4">
          <PhoneSystem className="h-full" />
        </div>
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="phone-system" />
        <p>
          Pulls in the whole tree: <InlineCode>messaging</InlineCode> (→ inbox, thread, composer),{" "}
          <InlineCode>call-log</InlineCode> (→ call-transcript), and <InlineCode>voicemail-player</InlineCode>. One
          command installs nine components.
        </p>
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { HandsetProvider } from "@handset/react";
import { PhoneSystem } from "@/components/handset/phone-system";

export default function CommunicationsPage() {
  return (
    <HandsetProvider>
      <div className="h-[700px]">
        <PhoneSystem />
      </div>
    </HandsetProvider>
  );
}`}
        />
        <p>
          This is the demo block — the fastest path from zero to &quot;look what our product does now.&quot; Real
          products usually keep it as-is for an ops/communications page and use the individual components
          (ContactTimeline, ClickToCallButton) where they belong in context. The tabs are ~40 lines of the copy in
          your repo; restructure freely.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "tenantId", type: "string", description: "Scope to one tenant (usually handled server-side)." },
            { name: "defaultTab", type: '"messages" | "calls" | "voicemail"', default: '"messages"', description: "Which tab opens first." },
            { name: "className", type: "string", description: "Merged onto the wrapper." },
          ]}
        />
      </DocSection>
    </article>
  );
}
