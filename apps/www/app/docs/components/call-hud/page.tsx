import { DocHeader, DocSection, InstallBlock } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";

export const metadata = { title: "Call HUD" };

export default function CallHUDDocs() {
  return (
    <article>
      <DocHeader
        title="Call HUD"
        lead="The in-call bar: who you're talking to, a live timer, mute, hang up. Mount it permanently — it renders nothing while quiet."
      />

      <DocSection title="Installation">
        <InstallBlock item="call-hud" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { CallHUD } from "@/components/handset/call-hud";

// e.g. in your app shell, floating above everything:
<CallHUD softphone={softphone} className="fixed bottom-4 left-4 z-50" />`}
        />
        <p>
          See it live on the{" "}
          <a className="text-primary underline-offset-4 hover:underline" href="/docs/components/dialer">
            Dialer
          </a>{" "}
          page — place a demo call and the bar appears. It shows connecting/ringing/on-hold states, flips the mute
          button&apos;s appearance when muted, and disappears when the call ends. Inbound calls that are still
          ringing belong to <InlineCode>IncomingCallToast</InlineCode>, not the HUD.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "softphone", type: "Softphone", description: "The softphone instance." },
            { name: "formatNumber", type: "(e164: string) => string", default: "US formatter", description: "Display formatting for the remote number." },
            { name: "className", type: "string", description: "Merged onto the bar — position it here." },
          ]}
        />
      </DocSection>
    </article>
  );
}
