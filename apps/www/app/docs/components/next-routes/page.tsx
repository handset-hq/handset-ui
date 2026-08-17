import { DocHeader, DocSection, InstallBlock } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";

export const metadata = { title: "Next.js routes" };

export default function NextRoutesDocs() {
  return (
    <article>
      <DocHeader
        title="Next.js routes"
        lead="The server half: a catch-all route handler that proxies component requests to the Handset API. Your key stays server-side; your session decides tenant access."
      />

      <DocSection title="Installation">
        <InstallBlock item="next-routes" />
        <p>
          Lands at <InlineCode>app/api/handset/[...handset]/route.ts</InlineCode> and expects{" "}
          <InlineCode>HANDSET_API_KEY</InlineCode> in your environment.
        </p>
      </DocSection>

      <DocSection title="The auth boundary">
        <p>
          One function is yours to implement. Everything the components can see flows through it:
        </p>
        <CodeBlock
          code={`async function resolveTenantId(req: NextRequest): Promise<string | null> {
  const session = await auth();                    // your auth library
  if (!session) throw new Response(null, { status: 401 });
  return session.organization.handsetTenantId;     // "tnt_…"
}`}
        />
        <p>
          The resolved tenant is injected into every read — anything the browser claims is ignored. Return{" "}
          <InlineCode>null</InlineCode> for single-tenant accounts.
        </p>
      </DocSection>

      <DocSection title="The allowlist">
        <p>
          Only the endpoints messaging components need are forwarded; everything else 404s. Buying numbers, porting,
          compliance — none of that is reachable from the browser. Extend the list deliberately if you build more:
        </p>
        <CodeBlock
          code={`const ALLOWED = [
  { method: "GET",  match: (p) => p === "conversations" },
  { method: "GET",  match: (p) => /^conversations\\/[\\w]+$/.test(p) },
  { method: "GET",  match: (p) => p === "messages" },
  { method: "POST", match: (p) => p === "messages" },
  { method: "GET",  match: (p) => p === "voicemails" },
  { method: "GET",  match: (p) => /^voicemails\\/[\\w]+$/.test(p) },
];`}
        />
      </DocSection>

      <DocSection title="Environment">
        <CodeBlock
          code={`HANDSET_API_KEY=sk_test_…        # required; sk_live_… in production
HANDSET_API_URL=                 # optional override, defaults to https://api.handset.dev/v1`}
        />
        <p>
          Not on Next.js? <InlineCode>@handset/express-routes</InlineCode> and{" "}
          <InlineCode>@handset/remix-routes</InlineCode> are the same proxy for those frameworks. Anything else
          (Hono, Rails…) is a few minutes of porting — the file is ~100 lines of fetch with no framework magic,
          and the components only care that <InlineCode>baseUrl</InlineCode> speaks the same paths.
        </p>
      </DocSection>
    </article>
  );
}
