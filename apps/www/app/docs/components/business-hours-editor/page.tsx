import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { BusinessHoursEditor } from "@/components/handset/business-hours-editor";

export const metadata = { title: "Business hours editor" };

export default function BusinessHoursEditorDocs() {
  return (
    <article>
      <DocHeader
        title="Business hours editor"
        lead="Edit the weekly business hours on a voice routing config: add and remove windows, toggle days, set open/close times, and save. Times are in the tenant's timezone (a tenant-level setting, shown as context)."
      />

      <Preview height={420}>
        <div className="w-full max-w-md">
          <BusinessHoursEditor routingConfigId="rtc_demo" timezone="America/Los_Angeles" />
        </div>
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="business-hours-editor" />
        <p>
          Reads and writes through the proxy&apos;s new <InlineCode>GET</InlineCode> /{" "}
          <InlineCode>PATCH /routing_configs/:id</InlineCode> routes — re-add the proxy component if you installed it
          before this shipped.
        </p>
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { BusinessHoursEditor } from "@/components/handset/business-hours-editor";

<BusinessHoursEditor routingConfigId={config.id} timezone={tenant.timezone} />`}
        />
        <p>
          Built on <InlineCode>useRoutingConfig</InlineCode>. On save it PATCHes the whole config (business hours plus
          the existing <InlineCode>open_behavior</InlineCode> / <InlineCode>closed_behavior</InlineCode>) so the call
          never drops the routing that isn&apos;t about hours. An empty schedule means &ldquo;open 24/7&rdquo;.
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
