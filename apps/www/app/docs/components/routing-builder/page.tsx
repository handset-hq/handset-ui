import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { RoutingBuilder } from "@/components/handset/routing-builder";

export const metadata = { title: "Routing builder" };

export default function RoutingBuilderDocs() {
  return (
    <article>
      <DocHeader
        title="Routing builder"
        lead="The full voice routing editor: business hours, what happens when you're open vs closed (ring a set of targets, or go straight to voicemail), and the recording policy. The complete sibling of business-hours-editor."
      />

      <Preview height={640}>
        <div className="w-full max-w-md">
          <RoutingBuilder routingConfigId="rtc_demo" timezone="America/Los_Angeles" />
        </div>
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="routing-builder" />
        <p>
          Reads and writes through <InlineCode>GET</InlineCode> / <InlineCode>PATCH /routing_configs/:id</InlineCode>.
          If you only need the hours, <InlineCode>business-hours-editor</InlineCode> is the lighter option.
        </p>
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { RoutingBuilder } from "@/components/handset/routing-builder";

<RoutingBuilder routingConfigId={config.id} timezone={tenant.timezone} />`}
        />
        <p>
          Built on <InlineCode>useRoutingConfig</InlineCode>. Open/closed behavior toggles between <em>Ring</em> (a list
          of targets — numbers or <InlineCode>client:wc_…</InlineCode> softphone seats — with a strategy, timeout, and
          optional roll-to-voicemail) and <em>Voicemail</em> (greeting + transcription). Save PATCHes the whole config
          at once.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "routingConfigId", type: "string", description: "The routing config to edit (rtc_…)." },
            { name: "timezone", type: "string", description: "The tenant's IANA timezone, shown as context." },
            { name: "onSaved", type: "() => void", description: "Called after a successful save." },
            { name: "className", type: "string", description: "Merged onto the root card." },
          ]}
        />
      </DocSection>
    </article>
  );
}
