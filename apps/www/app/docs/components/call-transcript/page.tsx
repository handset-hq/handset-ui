import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { CallTranscriptView } from "@/components/handset/call-transcript";

export const metadata = { title: "Call transcript" };

export default function CallTranscriptDocs() {
  return (
    <article>
      <DocHeader
        title="Call transcript"
        lead="A call's transcript as a speaker-labeled exchange. One-shot for finished calls; give it a poll interval and it follows a live call as utterances arrive."
      />

      <Preview height={220}>
        <div className="overflow-y-auto p-4">
          <CallTranscriptView callId="call_demo_1" />
        </div>
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="call-transcript" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { CallTranscriptView } from "@/components/handset/call-transcript";

// Finished call — fetch once:
<CallTranscriptView callId={call.id} />

// Live call — follow along (pairs with <ClickToCallButton transcribe />):
<CallTranscriptView callId={activeCall.id} pollMs={2000} />`}
        />
        <p>
          Transcripts exist when the call was placed with <InlineCode>transcribe: true</InlineCode>. Calls without
          one render a quiet &quot;No transcript for this call&quot; — the component handles the 404 for you. Agent
          lines are tinted with your primary color; customer lines stay neutral.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "callId", type: "string | null", description: "Which call's transcript to show." },
            { name: "pollMs", type: "number", default: "0", description: "0 = fetch once. ~2000 to follow a live call." },
            { name: "className", type: "string", description: "Merged onto the list." },
          ]}
        />
      </DocSection>
    </article>
  );
}
