import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { DeliveryStatus } from "@/components/handset/delivery-status";

export const metadata = { title: "Delivery status" };

export default function DeliveryStatusDocs() {
  return (
    <article>
      <DocHeader
        title="Delivery status"
        lead="The delivery-state indicator for an outbound message: a clock while sending, one check when accepted, two when delivered, a red alert on failure. Extracted from the thread so you can reuse it in inbox rows, call logs, and receipts."
      />

      <Preview height={120}>
        <div className="flex items-center gap-6 text-foreground">
          <span className="flex items-center gap-1 text-sm">Sending <DeliveryStatus status="sending" /></span>
          <span className="flex items-center gap-1 text-sm">Sent <DeliveryStatus status="sent" /></span>
          <span className="flex items-center gap-1 text-sm">Delivered <DeliveryStatus status="delivered" /></span>
          <span className="flex items-center gap-1 text-sm">Failed <DeliveryStatus status="failed" /></span>
        </div>
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="delivery-status" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { DeliveryStatus } from "@/components/handset/delivery-status";

<DeliveryStatus status={message.status} />`}
        />
        <p>
          Renders nothing for <InlineCode>received</InlineCode> or inbound messages, so you can drop it beside any
          message without branching on direction.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "status", type: "MessageStatus", description: "queued | sending | sent | delivered | failed | received." },
            { name: "className", type: "string", description: "Merged onto the icon (e.g. size overrides)." },
          ]}
        />
      </DocSection>
    </article>
  );
}
