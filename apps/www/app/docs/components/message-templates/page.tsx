import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { MessageTemplatesDemo } from "@/components/docs/message-templates-demo";

export const metadata = { title: "Message templates" };

export default function MessageTemplatesDocs() {
  return (
    <article>
      <DocHeader
        title="Message templates"
        lead="A saved-message picker with {{variable}} merge. Each row previews the body with the current variables substituted; 'Use' hands the merged text to your composer."
      />

      <Preview height={280}>
        <MessageTemplatesDemo />
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="message-templates" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { MessageTemplates } from "@/components/handset/message-templates";

<MessageTemplates
  templates={templates}                         // from your DB or config
  variables={{ name: contact.first_name, date }}
  onSelect={(body) => setDraft(body)}
/>`}
        />
        <p>
          Placeholders are <InlineCode>{"{{name}}"}</InlineCode>-style; unknown keys are left untouched so a partly
          filled template still previews cleanly. The <InlineCode>mergeTemplate(body, vars)</InlineCode> helper is
          exported if you want to merge without the picker.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "templates", type: "MessageTemplate[]", description: "{ id, name, body } — body may contain {{keys}}." },
            { name: "variables", type: "Record<string, string>", description: "Values substituted into each body." },
            { name: "onSelect", type: "(body, template) => void", description: "Receives the merged body when one is chosen." },
            { name: "className", type: "string", description: "Merged onto the list." },
          ]}
        />
      </DocSection>
    </article>
  );
}
