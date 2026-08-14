import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { Messaging } from "@/components/handset/messaging";

export const metadata = { title: "Messaging" };

export default function MessagingDocs() {
  return (
    <article>
      <DocHeader
        title="Messaging"
        lead="The complete two-pane texting surface: inbox on the left, active thread on the right. Collapses to a single pane with a back button on mobile. Most products start here."
      />

      <Preview height={460}>
        <Messaging className="h-full border-0" />
      </Preview>
      <p className="mt-2 text-xs text-muted-foreground">
        Live preview on mock data — send a message and the demo texts back.
      </p>

      <DocSection title="Installation">
        <InstallBlock item="messaging" />
        <p>
          Installs <InlineCode>inbox</InlineCode>, <InlineCode>thread</InlineCode>, and{" "}
          <InlineCode>composer</InlineCode> as dependencies. Add <InlineCode>@handset/next-routes</InlineCode> too if
          you haven&apos;t set up the proxy yet.
        </p>
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { HandsetProvider } from "@handset/react";
import { Messaging } from "@/components/handset/messaging";

<HandsetProvider>
  <div className="h-[600px]">
    <Messaging />
  </div>
</HandsetProvider>`}
        />
        <p>
          The component fills its container — give the wrapper a height. Everything inside (list, thread, composer)
          is the copy in your repo, so restructure freely.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "tenantId", type: "string", description: "Scope to one tenant. Usually unnecessary — your proxy routes scope server-side." },
            { name: "className", type: "string", description: "Merged onto the root grid." },
          ]}
        />
      </DocSection>
    </article>
  );
}
