import { DocHeader, DocSection, InstallBlock, Preview } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";
import { PropsTable } from "@/components/docs/props-table";
import { DateDivider } from "@/components/handset/date-divider";

export const metadata = { title: "Date divider" };

const day = 86_400_000;

export default function DateDividerDocs() {
  const now = Date.now();
  return (
    <article>
      <DocHeader
        title="Date divider"
        lead="A centered day label to separate message groups by calendar day: Today, Yesterday, a weekday within the last week, then a short date (with the year when it isn't this year). The thread inserts one automatically whenever the day changes."
      />

      <Preview height={160}>
        <div className="w-full max-w-sm">
          <DateDivider date={new Date(now)} />
          <DateDivider date={new Date(now - day)} />
          <DateDivider date={new Date(now - 3 * day)} />
          <DateDivider date={new Date(now - 400 * day)} />
        </div>
      </Preview>

      <DocSection title="Installation">
        <InstallBlock item="date-divider" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { DateDivider, isSameDay } from "@/components/handset/date-divider";

if (!prev || !isSameDay(prev.created_at, m.created_at)) {
  rows.push(<DateDivider key={m.id} date={m.created_at} />);
}`}
        />
        <p>
          Ships with two helpers: <InlineCode>isSameDay(a, b)</InlineCode> to decide where a divider goes, and{" "}
          <InlineCode>formatDayLabel(date)</InlineCode> if you want the label text on its own.
        </p>
      </DocSection>

      <DocSection title="Props">
        <PropsTable
          rows={[
            { name: "date", type: "string | Date", description: "The day to label (ISO string or Date)." },
            { name: "className", type: "string", description: "Merged onto the centered wrapper." },
          ]}
        />
      </DocSection>
    </article>
  );
}
