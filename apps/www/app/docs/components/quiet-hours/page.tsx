import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { QuietHoursDemo } from "@/components/docs/quiet-hours-demo";

export const metadata = { title: "Quiet hours" };

export default function QuietHoursDocs() {
  return (
    <article>
      <DocHeader
        title="Quiet hours"
        lead="A sending-hours guard: it warns when the current local time is outside your allowed window — don't text before 8am or after 9pm — and passes an allowed flag to its children so you can disable the send button. A compliance guardrail, not a scheduler."
      />

      <Preview height={220}>
        <QuietHoursDemo />
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="quiet-hours" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { QuietHours, isWithinQuietHours } from "@/components/handset/quiet-hours";

<QuietHours start="08:00" end="21:00" timezone={tenant.timezone}>
  {(allowed) => (
    <button disabled={!allowed} onClick={send}>Send</button>
  )}
</QuietHours>`}
        />
        <p>
          It re-checks every minute so the window flips on its own. The Handset API sends immediately — there&apos;s no
          server-side <InlineCode>send_at</InlineCode> yet — so this <em>prevents</em> ill-timed sends rather than
          deferring them. The <InlineCode>isWithinQuietHours(start, end, timezone)</InlineCode> helper is exported if
          you want the check without the UI. Windows that wrap past midnight (e.g. 21:00–08:00) work too.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "start / end", type: "string", default: "08:00 / 21:00", description: "Allowed window, 24h HH:MM." },
            { name: "timezone", type: "string", description: "IANA zone to evaluate in; defaults to the viewer's." },
            { name: "children", type: "(allowed: boolean) => ReactNode", description: "Render-prop for your send control." },
            { name: "className", type: "string", description: "Merged onto the wrapper." },
          ]}
        />
      </DocSection>
    </article>
  );
}
