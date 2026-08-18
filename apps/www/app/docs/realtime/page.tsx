import { DocHeader, DocSection } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";

export const metadata = { title: "Realtime" };

export default function RealtimeDocs() {
  return (
    <article>
      <DocHeader
        title="Realtime"
        lead="One prop turns polling hooks into live ones: events push over a WebSocket the moment they happen, hooks refetch instantly, and polling drops to a once-a-minute safety net."
      />

      <DocSection title="Enable it">
        <CodeBlock
          code={`<HandsetProvider baseUrl="/api/handset" realtime>
  <App />
</HandsetProvider>`}
        />
        <p>
          That&apos;s the whole integration. The provider mints a short-lived token through your server proxy
          (<InlineCode>POST /realtime/tokens</InlineCode> — allowlisted in current{" "}
          <InlineCode>next-routes</InlineCode> / <InlineCode>express-routes</InlineCode> /{" "}
          <InlineCode>remix-routes</InlineCode>; one line to add if you installed the proxy earlier) and connects
          the browser directly to <InlineCode>wss://media.handset.dev/v1/events</InlineCode>. Your API key never
          reaches the client; the token expires in an hour and the connection re-mints itself.
        </p>
      </DocSection>

      <DocSection title="What changes">
        <p>
          Every polling hook — <InlineCode>useConversations</InlineCode>, <InlineCode>useThread</InlineCode>,{" "}
          <InlineCode>useCalls</InlineCode>, <InlineCode>useCallTranscript</InlineCode>,{" "}
          <InlineCode>useVoicemails</InlineCode>, <InlineCode>usePortIn</InlineCode>,{" "}
          <InlineCode>useContactTimeline</InlineCode> — refetches the instant a relevant event arrives (an inbound
          text renders in under a second instead of on the next 10s tick) and relaxes its interval to 60s as a
          safety net. Components need no changes; they inherit it from the provider.
        </p>
        <p>
          Degradation is silent by design: if the proxy doesn&apos;t allowlist the mint, the socket can&apos;t
          connect, or the tab is offline, hooks keep polling at their normal cadence. Events are a latency
          optimization — webhooks to your backend remain the durable channel.
        </p>
      </DocSection>

      <DocSection title="Raw events">
        <p>For custom surfaces, subscribe to the stream directly — every envelope your webhooks would receive:</p>
        <CodeBlock
          code={`import { useHandsetEvents } from "@handset/react";

useHandsetEvents((event) => {
  if (event.type === "call.transcript") {
    console.log(event.data); // { call_id, speaker, text, … }
  }
});`}
        />
      </DocSection>
    </article>
  );
}
