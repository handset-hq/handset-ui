import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { AgentAssistDemo } from "@/components/docs/agent-assist-demo";

export const metadata = { title: "Agent assist" };

export default function AgentAssistDocs() {
  return (
    <article>
      <DocHeader
        title="Agent assist"
        lead="Give the panel the number your agent is talking to. It finds the active call, turns on live transcription, streams the conversation and keypad events as they happen, and shows the AI summary when it lands after hangup."
      />

      <Preview height={420}>
        <div className="overflow-y-auto p-4">
          <AgentAssistDemo />
        </div>
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="agent-assist" />
        <p>
          Installs <InlineCode>call-transcript</InlineCode> and <InlineCode>call-keypad</InlineCode> as
          dependencies. Your server proxy needs the{" "}
          <InlineCode>POST /calls/{"{id}"}/transcription</InlineCode> allowlist entry — included in current{" "}
          <InlineCode>next-routes</InlineCode> / <InlineCode>express-routes</InlineCode> /{" "}
          <InlineCode>remix-routes</InlineCode>; add the one line by hand if you installed the proxy earlier.
        </p>
      </DocSection>

      <DocSection title="Usage">
        <p>
          Pair it with anything that knows who&apos;s on the line — the softphone, a click-to-call button, or your
          own dialer state:
        </p>
        <CodeBlock
          code={`import { AgentAssistPanel } from "@/components/handset/agent-assist";
import { useSoftphone } from "@handset/webrtc/react";

function AgentWorkspace() {
  const { call } = useSoftphone(softphone);
  return <AgentAssistPanel remoteNumber={call?.remoteNumber ?? null} />;
}`}
        />
        <p>
          The panel matches the number against active calls on the API (last 10 digits, so formatting differences
          don&apos;t matter), then follows that call by id: transcript and keypad views poll while the call is
          live, and after hangup the panel waits for the <InlineCode>call.summary</InlineCode> to generate.
        </p>
      </DocSection>

      <DocSection title="How transcription starts">
        <p>
          On mount the panel calls <InlineCode>POST /v1/calls/{"{id}"}/transcription</InlineCode> — the on-demand
          switch that works on any in-progress call, inbound or outbound. It&apos;s idempotent, so calls created
          with <InlineCode>transcribe: true</InlineCode> are unaffected. Transcription bills per transcribed
          minute; set <InlineCode>autoTranscribe={"{false}"}</InlineCode> to render only what&apos;s already
          flowing.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "remoteNumber", type: "string | null", description: "The far party's number. Null renders nothing." },
            { name: "autoTranscribe", type: "boolean", default: "true", description: "Start live transcription once the call is found." },
            { name: "className", type: "string", description: "Merged onto the panel wrapper." },
          ]}
        />
      </DocSection>
    </article>
  );
}
