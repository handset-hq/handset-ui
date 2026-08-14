import { DocHeader, DocSection } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";

export const metadata = { title: "Installation" };

export default function InstallationPage() {
  return (
    <article>
      <DocHeader
        title="Installation"
        lead="Five steps from zero to a working texting surface. Assumes a Next.js app with Tailwind v4 and the shadcn CLI initialized."
      />

      <DocSection title="1. Register the Handset registry">
        <p>Teach the shadcn CLI where @handset items live. This writes one line into your components.json.</p>
        <CodeBlock code={`npx shadcn@latest registry add @handset=https://ui.handset.dev/r/{name}.json`} />
      </DocSection>

      <DocSection title="2. Install components">
        <p>
          The <InlineCode>messaging</InlineCode> block pulls in <InlineCode>inbox</InlineCode>,{" "}
          <InlineCode>thread</InlineCode>, and <InlineCode>composer</InlineCode> automatically;{" "}
          <InlineCode>next-routes</InlineCode> adds the server proxy. The CLI also installs{" "}
          <InlineCode>@handset/react</InlineCode> from npm.
        </p>
        <CodeBlock code={`npx shadcn@latest add @handset/messaging @handset/next-routes`} />
      </DocSection>

      <DocSection title="3. Set your API key">
        <p>
          Server-side only — it never reaches the browser. Use your test key (<InlineCode>sk_test_…</InlineCode>)
          while building; simulated numbers and instant compliance are free.
        </p>
        <CodeBlock code={`# .env.local\nHANDSET_API_KEY=sk_test_…`} />
      </DocSection>

      <DocSection title="4. Wire tenant scoping">
        <p>
          Open the generated <InlineCode>app/api/handset/[...handset]/route.ts</InlineCode> and implement{" "}
          <InlineCode>resolveTenantId()</InlineCode> against your session. Single-tenant account? Return{" "}
          <InlineCode>null</InlineCode> and move on.
        </p>
        <CodeBlock
          code={`async function resolveTenantId(req: NextRequest): Promise<string | null> {
  const session = await auth();                    // your auth library
  if (!session) throw new Response(null, { status: 401 });
  return session.organization.handsetTenantId;     // "tnt_…"
}`}
        />
      </DocSection>

      <DocSection title="5. Render it">
        <CodeBlock
          code={`import { HandsetProvider } from "@handset/react";
import { Messaging } from "@/components/handset/messaging";

export default function MessagesPage() {
  return (
    <HandsetProvider>
      <div className="h-[600px]">
        <Messaging />
      </div>
    </HandsetProvider>
  );
}`}
        />
        <p>
          <InlineCode>HandsetProvider</InlineCode> defaults to <InlineCode>/api/handset</InlineCode> — the path the
          proxy route installed at. Pass <InlineCode>baseUrl</InlineCode> if you mounted it elsewhere.
        </p>
      </DocSection>
    </article>
  );
}
