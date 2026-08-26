import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { BrandRegistrationForm } from "@/components/handset/brand-registration-form";

export const metadata = { title: "Brand registration form" };

export default function BrandRegistrationFormDocs() {
  return (
    <article>
      <DocHeader
        title="Brand registration form"
        lead="A 10DLC brand registration form. Collects the TCR-required legal identity and business contact, validates the EIN and phone before submit, and POSTs to /brands through your Handset proxy — then surfaces the brand's initial vetting status."
      />

      <Preview height={620}>
        <div className="w-full max-w-lg">
          <BrandRegistrationForm />
        </div>
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="brand-registration-form" />
        <p>
          Requires the proxy routes (<InlineCode>next-routes</InlineCode> and friends), which now expose{" "}
          <InlineCode>POST /brands</InlineCode>. Registration commits your account — gate it behind an admin check in
          your proxy&apos;s <InlineCode>resolveTenantId</InlineCode> if end users shouldn&apos;t self-register.
        </p>
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { BrandRegistrationForm } from "@/components/handset/brand-registration-form";

<BrandRegistrationForm
  onRegistered={(brand) => router.push(\`/compliance/\${brand.id}\`)}
/>`}
        />
        <p>
          Pass <InlineCode>tenantId</InlineCode> to register the brand under a specific tenant, or omit it for an
          account-level brand. The EIN comes back masked in the response.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "tenantId", type: "string", description: "Register under a specific tenant (tnt_…). Omit for account-level." },
            { name: "onRegistered", type: "(brand: Brand) => void", description: "Called with the created brand on success." },
            { name: "className", type: "string", description: "Merged onto the form." },
          ]}
        />
      </DocSection>
    </article>
  );
}
