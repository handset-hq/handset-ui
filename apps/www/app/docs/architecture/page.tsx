import { DocHeader, DocSection } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";

export const metadata = { title: "Architecture" };

export default function ArchitecturePage() {
  return (
    <article>
      <DocHeader
        title="Architecture"
        lead="Components in the browser, your backend as the trust boundary, the Handset API behind it."
      />

      <DocSection title="The request path">
        <CodeBlock
          code={`<Thread />                          browser
   │  GET /api/handset/messages?conversation_id=cnv_…
   ▼
app/api/handset/[...handset]        your server (from @handset/next-routes)
   │  1. your session auth → resolveTenantId()
   │  2. allowlist check
   │  3. Authorization: Bearer HANDSET_API_KEY
   ▼
api.handset.dev/v1/messages         Handset
   →  numbers, delivery, threading, 10DLC, STOP/HELP`}
        />
        <p>
          The browser never sees a Handset credential, and there&apos;s no token-minting infrastructure to run. Your
          server already knows who&apos;s signed in and which tenant they belong to — the proxy reuses that.
        </p>
      </DocSection>

      <DocSection title="Multi-tenancy">
        <p>
          Every Handset resource is tenant-scoped. The proxy injects the server-resolved{" "}
          <InlineCode>tenant_id</InlineCode> into reads and ignores any tenant the browser claims, so a user can only
          ever see their own tenant&apos;s conversations — enforced in your code, verifiable in your repo.
        </p>
      </DocSection>

      <DocSection title="Freshness">
        <p>
          Hooks poll — 5s for conversation lists, 3s for open threads — pausing while the tab is hidden and catching
          up on return. Polling is honest and debuggable at v1 scale; when Handset ships browser event streams, the
          hooks upgrade underneath the same components.
        </p>
      </DocSection>

      <DocSection title="What stays yours">
        <p>
          The copied components, the proxy route, tenant policy, styling, and rendering decisions. What stays ours:
          the headless hooks package, the API, delivery, and compliance. If you outgrow a component, keep the hook
          and rewrite the UI — that seam is the design.
        </p>
      </DocSection>
    </article>
  );
}
