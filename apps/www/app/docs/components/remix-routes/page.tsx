import { DocHeader, DocSection, InstallBlock } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";

export const metadata = { title: "Remix routes" };

export default function RemixRoutesDocs() {
  return (
    <article>
      <DocHeader
        title="Remix / React Router routes"
        lead="The server half for Remix and React Router apps: a splat resource route that proxies component requests to the Handset API. Your key stays server-side; your session decides tenant access."
      />

      <DocSection title="Installation">
        <InstallBlock item="remix-routes" />
        <p>
          Lands at <InlineCode>app/routes/api.handset.$.ts</InlineCode>, which serves{" "}
          <InlineCode>/api/handset/*</InlineCode> — the base path the components use by default. Built on the Web{" "}
          <InlineCode>Request</InlineCode>/<InlineCode>Response</InlineCode> API only, so the same file runs
          unchanged on Remix v2 and React Router 7.
        </p>
        <p>
          Using React Router 7 with explicit route config? Register the splat in{" "}
          <InlineCode>app/routes.ts</InlineCode>:
        </p>
        <CodeBlock code={`route("api/handset/*", "routes/api.handset.$.ts")`} />
      </DocSection>

      <DocSection title="The auth boundary">
        <p>
          One function is yours to implement. Everything the components can see flows through it:
        </p>
        <CodeBlock
          code={`async function resolveTenantId(request: Request): Promise<string | null> {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.has("userId")) throw new Response(null, { status: 401 });
  return session.get("handsetTenantId");   // "tnt_…"
}`}
        />
        <p>
          The resolved tenant is injected into every read — anything the browser claims is ignored. Return{" "}
          <InlineCode>null</InlineCode> for single-tenant accounts.
        </p>
      </DocSection>

      <DocSection title="The allowlist">
        <p>
          Identical to the Next.js proxy: only the endpoints the components need are forwarded, everything else
          404s. Buying numbers, porting, compliance — none of that is reachable from the browser. Extend the list
          deliberately if you build more.
        </p>
      </DocSection>

      <DocSection title="Environment">
        <CodeBlock
          code={`HANDSET_API_KEY=sk_test_…        # required; sk_live_… in production
HANDSET_API_URL=                 # optional override, defaults to https://api.handset.dev/v1`}
        />
      </DocSection>
    </article>
  );
}
