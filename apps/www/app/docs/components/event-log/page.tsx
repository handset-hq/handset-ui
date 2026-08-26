import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { EventLog } from "@/components/handset/event-log";
import type { RealtimeEnvelope } from "@handset/react";

export const metadata = { title: "Event log" };

const t = (secondsAgo: number) => new Date(Date.now() - secondsAgo * 1000).toISOString();

const demoEvents: RealtimeEnvelope[] = [
  { id: "evt_1", type: "message.received", event_version: "1", created_at: t(4), tenant_id: "tnt_demo", data: { conversation_id: "cnv_demo_maria", from: "+14155550132", body: "Perfect, see you at 2!" } },
  { id: "evt_2", type: "call.completed", event_version: "1", created_at: t(38), tenant_id: "tnt_demo", data: { call_id: "call_demo_1", duration_seconds: 154, outcome: "answered" } },
  { id: "evt_3", type: "voicemail.created", event_version: "1", created_at: t(120), tenant_id: "tnt_demo", data: { voicemail_id: "vm_demo_1", from: "+14155550163", duration_seconds: 23 } },
  { id: "evt_4", type: "campaign.status_changed", event_version: "1", created_at: t(600), tenant_id: "tnt_demo", data: { campaign_id: "cmp_demo", status: "approved" } },
];

export default function EventLogDocs() {
  return (
    <article>
      <DocHeader
        title="Event log"
        lead="A live event inspector: it subscribes to the realtime stream via useHandsetEvents and lists each envelope newest-first, filterable by type, with the raw payload expandable per row. The debugger your integration deserves, in one component."
      />

      <Preview height={320}>
        <div className="h-[280px] w-full max-w-md">
          <EventLog initialEvents={demoEvents} />
        </div>
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="event-log" />
        <p>
          Requires <InlineCode>&lt;HandsetProvider realtime&gt;</InlineCode> so the browser is connected to the event
          stream; without it the log stays empty.
        </p>
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { EventLog } from "@/components/handset/event-log";

<EventLog />`}
        />
        <p>
          Every event your webhooks receive also arrives here the moment it commits. Type the start of an event name
          into the filter (<InlineCode>call.</InlineCode>, <InlineCode>message.</InlineCode>) to narrow the stream, and
          click a row to expand its raw <InlineCode>data</InlineCode>. Pass <InlineCode>initialEvents</InlineCode> to
          seed rows for a screenshot or demo.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "limit", type: "number", default: "100", description: "Max events kept in the buffer." },
            { name: "initialEvents", type: "RealtimeEnvelope[]", description: "Seed rows; live events prepend above them." },
            { name: "className", type: "string", description: "Merged onto the root; give it a height to scroll." },
          ]}
        />
      </DocSection>
    </article>
  );
}
