import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { ContactTimeline } from "@/components/handset/contact-timeline";

export const metadata = { title: "Contact timeline" };

export default function ContactTimelineDocs() {
  return (
    <article>
      <DocHeader
        title="Contact timeline"
        lead="Every message, call, and voicemail with one customer, merged into a single newest-first feed. This is the component CRMs actually want."
      />

      <Preview height={420}>
        <div className="h-full p-4">
          <ContactTimeline externalNumber="+14155550132" withComposer className="h-full" />
        </div>
      </Preview>
      <p className="mt-2 text-xs text-muted-foreground">
        Maria&apos;s full history — texts and a call (expand it for the transcript). The composer replies in place.
      </p>

      <DocSection title="Installation">
        <InstallBlock item="contact-timeline" />
        <p>
          Installs <InlineCode>voicemail-player</InlineCode>, <InlineCode>call-transcript</InlineCode>, and{" "}
          <InlineCode>composer</InlineCode> as dependencies.
        </p>
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { ContactTimeline } from "@/components/handset/contact-timeline";

// In your CRM's contact panel:
<ContactTimeline
  externalNumber={contact.phone}   // E.164
  withComposer                     // reply without leaving the panel
/>`}
        />
        <p>
          The timeline keys on the customer&apos;s phone number, so it works from any record that has one — a
          candidate, a tenant, a patient, a homeowner. Calls that ended in voicemail appear once, as the voicemail
          (with player and transcript), not as a duplicate call row. Completed calls expand into their transcript
          in place.
        </p>
        <p>
          Under the hood this is <InlineCode>useContactTimeline</InlineCode>: conversations, calls, and voicemails
          fetched in parallel, filtered to the contact, merged and sorted. Use the hook directly if you want a
          custom feed rendering.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "externalNumber", type: "string | null", description: "The customer's number, E.164." },
            { name: "withComposer", type: "boolean", default: "false", description: "Show a composer wired to the contact's conversation." },
            { name: "tenantId", type: "string", description: "Scope to one tenant (usually handled server-side)." },
            { name: "pollMs", type: "number", default: "10000", description: "Refresh interval. 0 disables polling." },
            { name: "limit", type: "number", default: "50", description: "Max items fetched per source." },
            { name: "className", type: "string", description: "Merged onto the wrapper." },
          ]}
        />
      </DocSection>
    </article>
  );
}
