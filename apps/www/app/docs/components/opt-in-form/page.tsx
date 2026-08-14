import { DocHeader, DocSection, InstallBlock } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { OptInDemo } from "./opt-in-demo";

export const metadata = { title: "Opt-in form" };

export default function OptInFormDocs() {
  return (
    <article>
      <DocHeader
        title="Opt-in form"
        lead="An SMS consent form whose exact shape survived a real TCR/carrier review. Not legal advice — but it is field-tested compliance UI, free to restyle."
      />

      <OptInDemo />
      <p className="mt-2 text-xs text-muted-foreground">Try both paths: submitting with and without the box checked.</p>

      <DocSection title="Installation">
        <InstallBlock item="opt-in-form" />
        <p>No API dependency — you decide where submissions go.</p>
      </DocSection>

      <DocSection title="Why it looks like this">
        <p>
          Carrier reviewers rejected an earlier version of this form for &quot;forced opt-in&quot;: a required phone
          field plus a <em>required</em> consent checkbox means the user can&apos;t complete the form without
          agreeing to marketing. The compliant shape — the one that passed — makes the checkbox explicitly{" "}
          <strong>optional</strong>, labels it so, and treats an unchecked submission as &quot;store nothing, send
          nothing,&quot; with a visible &quot;not enrolled&quot; result. The disclosure covers the CTIA checklist:
          brand name, message frequency, &quot;consent is not a condition of purchase,&quot; msg &amp; data rates,
          STOP/HELP, and links to your privacy policy and terms.
        </p>
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { OptInForm } from "@/components/handset/opt-in-form";

<OptInForm
  brandName="Brightside Property Co"       // as registered on your campaign
  messageFrequency="up to 4 messages per month"
  privacyUrl="/privacy"
  termsUrl="/terms"
  onSubmit={async ({ phone, consented }) => {
    if (!consented) return;                 // store nothing, send nothing
    await fetch("/api/optins", {            // your consent registry
      method: "POST",
      body: JSON.stringify({ phone, language: "v1", at: new Date() }),
    });
  }}
/>`}
        />
        <p>
          Record the exact disclosure language and timestamp with each consent — that record is what you show a
          carrier auditor. Send the confirmation text through your Handset number so STOP handling is automatic.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "brandName", type: "string", description: "Your brand as registered on the 10DLC campaign." },
            { name: "messageFrequency", type: "string", default: '"recurring messages"', description: "Match your campaign registration, e.g. \"up to 4 messages per month\"." },
            { name: "privacyUrl", type: "string", description: "Linked in the disclosure." },
            { name: "termsUrl", type: "string", description: "Linked in the disclosure." },
            { name: "onSubmit", type: "({ phone, consented }) => Promise<void>", description: "Receives every submission; consented=false must mean no enrollment." },
            { name: "className", type: "string", description: "Merged onto the form." },
          ]}
        />
      </DocSection>
    </article>
  );
}
