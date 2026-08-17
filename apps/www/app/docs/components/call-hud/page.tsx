import { DocHeader, DocSection, InstallBlock } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { CallHUDDemo } from "@/components/docs/softphone-demos";

export const metadata = { title: "Call HUD" };

export default function CallHUDDocs() {
  return (
    <article>
      <DocHeader
        title="Call HUD"
        lead="The in-call bar: who you're talking to, a live timer, mute, hang up. Mount it permanently — it renders nothing while quiet."
      />

      <CallHUDDemo />
      <p className="mt-2 text-xs text-muted-foreground">
        Demo mode — the callee answers after a moment; try mute, then hang up and the bar disappears.
      </p>

      <DocSection title="Installation">
        <InstallBlock item="call-hud" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { CallHUD } from "@/components/handset/call-hud";

// e.g. in your app shell, floating above everything — draggable, so the
// user can move it off whatever they're working on:
<CallHUD softphone={softphone} draggable className="fixed bottom-4 left-4 z-50" />`}
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
            { name: "draggable", type: "boolean", default: "false", description: "Let the user drag the bar around the screen (grab anywhere but the buttons). Position resets when the call ends." },
            { name: "keypad", type: "boolean", default: "false", description: "Show a keypad toggle that pops a DTMF pad under the bar — extensions, PINs, press-1 menus." },
            { name: "className", type: "string", description: "Merged onto the bar — position it here." },
          ]}
        />
      </DocSection>
    </article>
  );
}
