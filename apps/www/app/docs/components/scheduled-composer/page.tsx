import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { ScheduledComposer } from "@/components/handset/scheduled-composer";

export const metadata = { title: "Scheduled composer" };

export default function ScheduledComposerDocs() {
  return (
    <article>
      <DocHeader
        title="Scheduled composer"
        lead="Compose and send now, or flip 'Send later' to pick a date and time. Scheduling POSTs send_at to the API, which parks the message in scheduled status until it's due — a real server-side schedule, not a browser timer."
      />

      <Preview height={220}>
        <div className="w-full max-w-md">
          <ScheduledComposer fromNumberId="num_demo" to="+14155550142" />
        </div>
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="scheduled-composer" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { ScheduledComposer } from "@/components/handset/scheduled-composer";

<ScheduledComposer
  fromNumberId={tenant.numberId}
  to={contact.phone}
  onSent={(m) => m.status === "scheduled" ? toast("Scheduled") : toast("Sent")}
/>`}
        />
        <p>
          Sends immediately by default; the <InlineCode>send_at</InlineCode> is only added when &ldquo;Send later&rdquo;
          is on. The API accepts a schedule up to 90 days out and returns the message in{" "}
          <InlineCode>scheduled</InlineCode> status with <InlineCode>scheduled_at</InlineCode> set. Every send carries
          an Idempotency-Key. Pair it with <InlineCode>quiet-hours</InlineCode> if you also want to block ill-timed
          immediate sends.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "fromNumberId", type: "string", description: "The tenant number to send from (num_…)." },
            { name: "to", type: "string", description: "Recipient in E.164." },
            { name: "onSent", type: "(message) => void", description: "Called with the sent or scheduled message." },
            { name: "className", type: "string", description: "Merged onto the root card." },
          ]}
        />
      </DocSection>
    </article>
  );
}
