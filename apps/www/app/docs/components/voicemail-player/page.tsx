import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { VoicemailList } from "@/components/handset/voicemail-player";

export const metadata = { title: "Voicemail player" };

export default function VoicemailPlayerDocs() {
  return (
    <article>
      <DocHeader
        title="Voicemail player"
        lead="Voicemails with playback and transcripts. Ships as two pieces: VoicemailPlayer for a single message, VoicemailList for the whole mailbox."
      />

      <Preview height={300}>
        <div className="overflow-y-auto p-4">
          <VoicemailList />
        </div>
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="voicemail-player" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { VoicemailList, VoicemailPlayer } from "@/components/handset/voicemail-player";

// The whole mailbox:
<VoicemailList />

// One voicemail, e.g. inside a call detail view:
<VoicemailPlayer voicemail={vm} onExpired={refreshVoicemail} />`}
        />
        <p>
          Audio URLs from the API are presigned and expire after an hour. When playback fails, the player calls{" "}
          <InlineCode>onExpired</InlineCode> to fetch a fresh URL and retries once —{" "}
          <InlineCode>useVoicemails(...).refreshVoicemail</InlineCode> slots straight in (the list wires this for
          you). Transcripts appear under the scrubber; a voicemail still transcribing shows &quot;Transcribing…&quot;
          and fills in on the next poll.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          caption="VoicemailPlayer"
          rows={[
            { name: "voicemail", type: "Voicemail", description: "The voicemail to render." },
            { name: "onExpired", type: "(id) => Promise<Voicemail>", description: "Fetch a fresh voicemail when the audio URL has expired." },
            { name: "className", type: "string", description: "Merged onto the card." },
          ]}
        />
        <div className="h-3" />
        <PropsTable
          caption="VoicemailList"
          rows={[
            { name: "tenantId", type: "string", description: "Scope to one tenant (usually handled server-side)." },
            { name: "pollMs", type: "number", default: "15000", description: "Refresh interval. 0 disables polling." },
            { name: "limit", type: "number", default: "25", description: "Page size." },
            { name: "className", type: "string", description: "Merged onto the list wrapper." },
          ]}
        />
      </DocSection>
    </article>
  );
}
