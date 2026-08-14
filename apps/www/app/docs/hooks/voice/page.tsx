import { DocHeader, DocSection } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";

export const metadata = { title: "Voice hooks" };

export default function VoiceHooksDocs() {
  return (
    <article>
      <DocHeader
        title="Voice hooks"
        lead="The headless layer behind the voice components: voicemail lists, call history, click-to-call, and transcripts."
      />

      <DocSection title="useVoicemails">
        <CodeBlock
          code={`const { voicemails, refreshVoicemail, hasMore, loadMore } = useVoicemails();`}
        />
        <p>
          Newest first, polled every 15s by default. <InlineCode>refreshVoicemail(id)</InlineCode> re-fetches one
          voicemail — the fix for expired hour-limited audio URLs.
        </p>
      </DocSection>

      <DocSection title="useCalls">
        <CodeBlock code={`const { calls, hasMore, loadMore } = useCalls({ phoneNumberId });`} />
        <p>Call history, newest first, polled every 10s. Filter by tenant or one phone number.</p>
      </DocSection>

      <DocSection title="useClickToCall">
        <CodeBlock
          code={`const { call, isActive, place, reset } = useClickToCall({
  onStatusChange: (call) => console.log(call.status),
});

await place({
  from: "num_…",              // caller ID
  to: "+14155550132",         // customer
  connectTo: "+14155550199",  // agent's phone rings first
  transcribe: true,
});`}
        />
        <p>
          One POST, then automatic status polling until the call settles (<InlineCode>completed</InlineCode>,{" "}
          <InlineCode>missed</InlineCode>, <InlineCode>voicemail</InlineCode>, or <InlineCode>failed</InlineCode>).{" "}
          <InlineCode>isActive</InlineCode> is true from dialing through hang-up; <InlineCode>reset()</InlineCode>{" "}
          clears the finished call.
        </p>
      </DocSection>

      <DocSection title="useCallTranscript">
        <CodeBlock
          code={`// Finished call:
const { transcript, isEmpty } = useCallTranscript(callId);

// Live call:
const live = useCallTranscript(activeCall.id, { pollMs: 2000 });`}
        />
        <PropsTable
          caption="Return value"
          rows={[
            { name: "transcript", type: "CallTranscript | null", description: "call_id, joined text, and speaker-labeled segments." },
            { name: "isEmpty", type: "boolean", description: "True when the call has no transcript (404s handled for you)." },
            { name: "isLoading", type: "boolean", description: "True until the first fetch resolves." },
            { name: "error", type: "Error | null", description: "Non-404 fetch failures." },
            { name: "refresh", type: "() => Promise<void>", description: "Force an immediate re-fetch." },
          ]}
        />
      </DocSection>
    </article>
  );
}
