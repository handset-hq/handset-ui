import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { ClickToCallButton } from "@/components/handset/click-to-call-button";

export const metadata = { title: "Click-to-call button" };

export default function ClickToCallDocs() {
  return (
    <article>
      <DocHeader
        title="Click-to-call button"
        lead="A call button for customer records. Click it: the agent's phone rings first, the customer is bridged in on answer, and the button narrates every step."
      />

      <Preview height={120}>
        <div className="flex h-full items-center justify-center">
          <ClickToCallButton from="num_demo" to="+14155550132" connectTo="+14155550199">
            Call Maria
          </ClickToCallButton>
        </div>
      </Preview>
      <p className="mt-2 text-xs text-muted-foreground">
        Click it — the demo simulates the full lifecycle: dialing → ringing → connected (with a live timer) → ended.
      </p>

      <DocSection title="Installation">
        <InstallBlock item="click-to-call-button" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { ClickToCallButton } from "@/components/handset/click-to-call-button";

<ClickToCallButton
  from={tenant.phoneNumberId}      // caller ID both parties see
  to={customer.phone}              // who you're calling
  connectTo={agent.directLine}     // the agent's phone rings first
  transcribe                       // optional: live speech-to-text
/>`}
        />
        <p>
          This wraps <InlineCode>useClickToCall</InlineCode>: one POST to <InlineCode>/calls</InlineCode>, then
          status polling until the call settles. Outcomes (no answer, failed) show briefly, then the button returns
          to idle. Add <InlineCode>onStatusChange</InlineCode> to open a transcript panel the moment the call
          connects.
        </p>
        <p>
          Security note: the proxy&apos;s <InlineCode>POST /calls</InlineCode> allowlist entry ships with a reminder
          to validate <InlineCode>connect_to</InlineCode> server-side against the signed-in agent&apos;s own number,
          so users can&apos;t ring arbitrary phones.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "from", type: "string", description: "Tenant number id (num_…) or E.164 — the caller ID." },
            { name: "to", type: "string", description: "The customer's number, E.164." },
            { name: "connectTo", type: "string", description: "The agent's number, E.164 — rings first." },
            { name: "transcribe", type: "boolean", default: "false", description: "Stream live speech-to-text (billed per transcribed minute)." },
            { name: "onStatusChange", type: "(call: Call) => void", description: "Fires on every lifecycle change." },
            { name: "children", type: "ReactNode", default: '"Call"', description: "Button label." },
            { name: "className", type: "string", description: "Merged onto the wrapper." },
          ]}
        />
      </DocSection>
    </article>
  );
}
