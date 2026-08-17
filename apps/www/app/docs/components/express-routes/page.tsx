import { DocHeader, DocSection, InstallBlock } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";

export const metadata = { title: "Express routes" };

export default function ExpressRoutesDocs() {
  return (
    <article>
      <DocHeader
        title="Express routes"
        lead="The server half for Express apps: a mountable router that proxies component requests to the Handset API. Your key stays server-side; your session decides tenant access."
      />

      <DocSection title="Installation">
        <InstallBlock item="express-routes" />
        <p>
          Lands at <InlineCode>server/handset-routes.ts</InlineCode> and expects{" "}
          <InlineCode>HANDSET_API_KEY</InlineCode> in your environment. Works with Express 4 and 5 on Node 18+.
        </p>
      </DocSection>

      <DocSection title="Mounting">
        <p>
          Mount at <InlineCode>/api/handset</InlineCode> — the base path the components use by default:
        </p>
        <CodeBlock
          code={`import express from "express";
import { handsetRoutes } from "./handset-routes";

const app = express();
app.use("/api/handset", handsetRoutes());`}
        />
        <p>
          Serving your React app from a different origin? Point the components at your API host with{" "}
          <InlineCode>{`<HandsetProvider baseUrl="https://api.yourapp.com/api/handset">`}</InlineCode> and handle
          CORS as you do for the rest of your API.
        </p>
      </DocSection>

      <DocSection title="The auth boundary">
        <p>
          One function is yours to implement. Everything the components can see flows through it:
        </p>
        <CodeBlock
          code={`async function resolveTenantId(req: Request): Promise<string | null> {
  if (!req.session?.user) throw { status: 401, message: "Sign in first" };
  return req.session.user.handsetTenantId;   // "tnt_…"
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
