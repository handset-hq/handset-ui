import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { E911AddressForm } from "@/components/handset/e911-address-form";

export const metadata = { title: "E911 address form" };

export default function E911AddressFormDocs() {
  return (
    <article>
      <DocHeader
        title="E911 address form"
        lead="An E911 emergency-address form. Collects and validates the civic address a carrier dispatches on for a tenant's numbers, POSTs to /e911_addresses through your proxy, and reports the validation status it comes back with."
      />

      <Preview height={420}>
        <div className="w-full max-w-lg">
          <E911AddressForm tenantId="tnt_demo" />
        </div>
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="e911-address-form" />
        <p>
          Uses the proxy&apos;s <InlineCode>POST /e911_addresses</InlineCode> route.
        </p>
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { E911AddressForm } from "@/components/handset/e911-address-form";

<E911AddressForm
  tenantId={tenant.id}
  onRegistered={(address) => toast(\`Emergency address \${address.status}\`)}
/>`}
        />
        <p>
          The API validates the civic address; a bad address comes back as an{" "}
          <InlineCode>e911_address_invalid</InlineCode> error, which the form surfaces inline.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "tenantId", type: "string", description: "The tenant this emergency address belongs to (tnt_…). Required." },
            { name: "onRegistered", type: "(address: E911Address) => void", description: "Called with the saved address on success." },
            { name: "className", type: "string", description: "Merged onto the form." },
          ]}
        />
      </DocSection>
    </article>
  );
}
