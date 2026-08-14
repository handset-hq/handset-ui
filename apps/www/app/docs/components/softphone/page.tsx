import { DocHeader, DocSection, InstallBlock } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { SoftphonePanelDemo } from "@/components/docs/softphone-demos";

export const metadata = { title: "Softphone" };

export default function SoftphoneDocs() {
  return (
    <article>
      <DocHeader
        title="Softphone"
        lead="A phone that lives inside your product: connection status, dialer, in-call controls, and inbound ringing in one panel. Calls to your Handset numbers ring here."
      />

      <SoftphonePanelDemo />
      <p className="mt-2 text-xs text-muted-foreground">
        Demo mode — dial anything (it "answers" in a couple seconds), or stage an incoming call.
      </p>

      <DocSection title="Installation">
        <InstallBlock item="softphone" />
        <p>
          Installs <InlineCode>dialer</InlineCode>, <InlineCode>call-hud</InlineCode>, and{" "}
          <InlineCode>incoming-call-toast</InlineCode>, plus the <InlineCode>@handset/webrtc</InlineCode> package.
        </p>
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { createSoftphone } from "@handset/webrtc";
import { SoftphonePanel } from "@/components/handset/softphone";

// Once, at module scope (or useMemo). getToken calls YOUR backend,
// which mints it via POST /v1/web_clients/{id}/tokens.
const softphone = createSoftphone({
  getToken: async () => {
    const res = await fetch(\`/api/handset/web_clients/\${seatId}/tokens\`, { method: "POST" });
    const { token } = await res.json();
    return token;
  },
});

<SoftphonePanel softphone={softphone} callerNumber={tenant.number} />`}
        />
        <p>
          The setup story lives in{" "}
          <a className="text-primary underline-offset-4 hover:underline" href="/docs/softphone-setup">
            Softphone setup
          </a>
          : one web client per agent seat, tokens minted server-side, and inbound routing that includes{" "}
          <InlineCode>client:wc_…</InlineCode> as a ring target so calls to the tenant&apos;s number ring the browser.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "softphone", type: "Softphone", description: "From createSoftphone (or createDemoSoftphone in tests/demos)." },
            { name: "callerNumber", type: "string", description: "Caller ID for outbound calls — one of the tenant's Handset numbers." },
            { name: "className", type: "string", description: "Merged onto the panel." },
          ]}
        />
      </DocSection>
    </article>
  );
}
