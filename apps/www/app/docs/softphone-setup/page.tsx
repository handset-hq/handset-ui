import { DocHeader, DocSection } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";

export const metadata = { title: "Softphone setup" };

export default function SoftphoneSetupPage() {
  return (
    <article>
      <DocHeader
        title="Softphone setup"
        lead="From zero to a phone ringing inside your product: one web client per agent seat, short-lived tokens minted by your backend, and routing that treats the browser as just another phone."
      />

      <DocSection title="1. Create a web client per agent seat">
        <p>
          A web client is one browser phone endpoint. Create one per agent seat from your backend (never share one
          across devices) and store the id on your user record:
        </p>
        <CodeBlock
          code={`// server-side, with your Handset API key
const seat = await handset.webClients.create({
  tenant_id: tenant.handsetTenantId,
  name: \`seat for \${user.email}\`,
});
await db.users.update(user.id, { handsetSeatId: seat.id }); // "wc_…"`}
        />
      </DocSection>

      <DocSection title="2. Mint tokens from your backend">
        <p>
          The browser never holds your API key — it holds a dying token. The <InlineCode>next-routes</InlineCode>{" "}
          proxy already allows <InlineCode>POST /web_clients/{"{id}"}/tokens</InlineCode>; make sure your session
          logic only mints tokens for the signed-in agent&apos;s own seat:
        </p>
        <CodeBlock
          code={`const softphone = createSoftphone({
  getToken: async () => {
    const res = await fetch(\`/api/handset/web_clients/\${user.handsetSeatId}/tokens\`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Could not get a phone token");
    const { token } = await res.json();
    return token;
  },
});`}
        />
        <p>
          Tokens live ~24 hours; the softphone requests a fresh one whenever it needs to re-authenticate. Freshly
          created seats can take a few seconds before their first login works.
        </p>
      </DocSection>

      <DocSection title="3. Ring the browser on inbound calls">
        <p>
          Add the seat to the tenant&apos;s routing config like any other phone. Browser and cell ring together;
          first answer wins and the agent sees the caller&apos;s real number:
        </p>
        <CodeBlock
          code={`await handset.routingConfigs.create({
  tenant_id: tenant.handsetTenantId,
  name: "office hours",
  open_behavior: {
    type: "ring",
    targets: [\`client:\${seat.id}\`, "+14805550142"],  // browser + cell
    timeout_seconds: 20,
    no_answer: { type: "voicemail", greeting_text: "Leave a message." },
  },
});`}
        />
        <p>
          Revoked seats are skipped at ring time, and if nobody answers, the caller lands in the configured
          voicemail.
        </p>
      </DocSection>

      <DocSection title="4. Render the phone">
        <CodeBlock
          code={`<SoftphonePanel softphone={softphone} callerNumber={tenant.number} />
// or compose Dialer / CallHUD / IncomingCallToast yourself`}
        />
      </DocSection>

      <DocSection title="Lifecycle notes">
        <p>
          Revoke a seat (<InlineCode>DELETE /v1/web_clients/{"{id}"}</InlineCode>) when an agent leaves — tokens die
          with it and routing skips it. Microphone permission is requested by the browser on the first call; the
          demo softphone (<InlineCode>createDemoSoftphone</InlineCode>) needs no network, mic, or credentials and is
          what these docs run on.
        </p>
      </DocSection>
    </article>
  );
}
