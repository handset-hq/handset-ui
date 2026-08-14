import Link from "next/link";
import { DocHeader, DocSection } from "@/components/docs/doc-page";
import { InlineCode } from "@/components/docs/code-block";

export const metadata = { title: "Introduction" };

export default function IntroductionPage() {
  return (
    <article>
      <DocHeader
        title="Introduction"
        lead="Handset UI is a set of React components for embedded texting, built on the Handset API and distributed the shadcn way: as source code the CLI copies into your project."
      />

      <DocSection title="Why copy-source">
        <p>
          Messaging UI has to look native to <em>your</em> product — that&apos;s the whole point of embedding it.
          Widget SDKs and iframes always feel foreign. So Handset UI doesn&apos;t ship a styled black box: the shadcn
          CLI drops the component source into your repo, styled with your Tailwind tokens. Restyle it, rewrite it,
          delete the parts you don&apos;t need. It&apos;s your code.
        </p>
      </DocSection>

      <DocSection title="Two layers">
        <p>
          The logic lives in <InlineCode>@handset/react</InlineCode>, a small versioned npm package of headless hooks —{" "}
          <Link className="text-primary underline-offset-4 hover:underline" href="/docs/hooks/use-conversations">
            useConversations
          </Link>
          ,{" "}
          <Link className="text-primary underline-offset-4 hover:underline" href="/docs/hooks/use-thread">
            useThread
          </Link>
          ,{" "}
          <Link className="text-primary underline-offset-4 hover:underline" href="/docs/hooks/use-composer">
            useComposer
          </Link>{" "}
          — handling polling, pagination, optimistic sends, and SMS segment math. We maintain and fix that layer in
          place. The visual components are the copy-source layer on top; they get better releases over time, but the
          copy in your repo never changes unless you re-install it.
        </p>
      </DocSection>

      <DocSection title="No keys in the browser">
        <p>
          Components never talk to the Handset API directly. They call proxy routes in your own backend (added by{" "}
          <Link className="text-primary underline-offset-4 hover:underline" href="/docs/components/next-routes">
            @handset/next-routes
          </Link>
          ), where your server holds the API key and your existing session auth decides which tenant each signed-in
          user can see. See{" "}
          <Link className="text-primary underline-offset-4 hover:underline" href="/docs/architecture">
            Architecture
          </Link>{" "}
          for the full picture.
        </p>
      </DocSection>

      <DocSection title="Next steps">
        <p>
          Head to{" "}
          <Link className="text-primary underline-offset-4 hover:underline" href="/docs/installation">
            Installation
          </Link>{" "}
          to wire up the registry, or jump straight to the{" "}
          <Link className="text-primary underline-offset-4 hover:underline" href="/docs/components/messaging">
            Messaging
          </Link>{" "}
          block — the two-pane surface most products start with.
        </p>
      </DocSection>
    </article>
  );
}
