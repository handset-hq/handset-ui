import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { BroadcastComposer } from "@/components/handset/broadcast-composer";

export const metadata = { title: "Broadcast composer" };

export default function BroadcastComposerDocs() {
  return (
    <article>
      <DocHeader
        title="Broadcast composer"
        lead="Send one message to many recipients — one API call each, with a live per-recipient result list. Opt-outs are respected by the API: anyone who texted STOP comes back failed and is never messaged."
      />

      <Preview height={480}>
        <div className="w-full max-w-md">
          <BroadcastComposer fromNumberId="num_demo" />
        </div>
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="broadcast-composer" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { BroadcastComposer } from "@/components/handset/broadcast-composer";

<BroadcastComposer fromNumberId={tenant.numberId} />`}
        />
        <p>
          Each send carries a per-recipient <InlineCode>Idempotency-Key</InlineCode>, so a retry can&apos;t double-send.
          The segment counter multiplies by recipients so you can see the total before sending. For a real blast, drive
          the send from your backend with a queue — this is the in-product, small-list version (dozens, not
          thousands).
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "fromNumberId", type: "string", description: "The tenant number to send from (num_…)." },
            { name: "onComplete", type: "({ sent, failed }) => void", description: "Called once the batch finishes." },
            { name: "className", type: "string", description: "Merged onto the root card." },
          ]}
        />
      </DocSection>
    </article>
  );
}
