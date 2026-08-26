import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { VoicemailInbox } from "@/components/handset/voicemail-inbox";

export const metadata = { title: "Voicemail inbox" };

export default function VoicemailInboxDocs() {
  return (
    <article>
      <DocHeader
        title="Voicemail inbox"
        lead="A voicemail list with unread tracking: newest first, an unread dot until a row is opened, and the full voicemail-player inline on the open row. The list and playback come from useVoicemails; unread state is local since the API has no read flag."
      />

      <Preview height={420}>
        <div className="w-full max-w-md">
          <VoicemailInbox />
        </div>
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="voicemail-inbox" />
        <p>
          Installs <InlineCode>voicemail-player</InlineCode> as a dependency — the inbox renders it inline on the open
          row and wires <InlineCode>onExpired</InlineCode> to <InlineCode>refreshVoicemail</InlineCode> so expired audio
          URLs recover automatically.
        </p>
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { VoicemailInbox } from "@/components/handset/voicemail-inbox";

<VoicemailInbox tenantId={tenant.id} pollMs={15000} />`}
        />
        <p>
          Accepts the same options as <InlineCode>useVoicemails</InlineCode> (<InlineCode>tenantId</InlineCode>,{" "}
          <InlineCode>limit</InlineCode>, <InlineCode>pollMs</InlineCode>). New voicemails arrive on the poll (or
          instantly under <InlineCode>&lt;HandsetProvider realtime&gt;</InlineCode>) and show an unread dot until opened.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "tenantId", type: "string", description: "Scope to one tenant's voicemails." },
            { name: "limit", type: "number", default: "25", description: "Page size for the list." },
            { name: "pollMs", type: "number", default: "15000", description: "Refresh interval. 0 fetches once." },
            { name: "className", type: "string", description: "Merged onto the root card." },
          ]}
        />
      </DocSection>
    </article>
  );
}
