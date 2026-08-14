import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { NumberPicker } from "@/components/handset/number-picker";

export const metadata = { title: "Number picker" };

export default function NumberPickerDocs() {
  return (
    <article>
      <DocHeader
        title="Number picker"
        lead="Area-code search, candidate grid, one-click claim. The 'pick your business number' step of onboarding, self-served by your customers."
      />

      <Preview height={380}>
        <div className="overflow-y-auto p-4">
          <NumberPicker />
        </div>
      </Preview>
      <p className="mt-2 text-xs text-muted-foreground">Search 415 (or any area code) and claim one — it's mock data.</p>

      <DocSection title="Installation">
        <InstallBlock item="number-picker" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { NumberPicker } from "@/components/handset/number-picker";

<NumberPicker
  campaignId={tenant.campaignId}   // attach 10DLC at purchase
  onPurchased={(number) => saveTenantNumber(number.id)}
/>`}
        />
        <p>
          <strong>Buying a number bills your Handset account</strong> (~$2/mo at cost), so the proxy&apos;s{" "}
          <InlineCode>POST /phone_numbers</InlineCode> entry ships with a reminder: gate it behind an admin/owner
          check in <InlineCode>resolveTenantId</InlineCode>, or remove it and keep purchasing in your own admin flows.
          Purchase conflicts (someone claims the number first) surface as a retryable error, not a broken state.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "tenantId", type: "string", description: "Owner of the purchased number. Omit when your proxy injects it." },
            { name: "campaignId", type: "string", description: "10DLC campaign to attach at purchase — texting unlocks when it's approved." },
            { name: "onPurchased", type: "(number: PhoneNumber) => void", description: "Fires after a successful claim." },
            { name: "className", type: "string", description: "Merged onto the wrapper." },
          ]}
        />
      </DocSection>
    </article>
  );
}
