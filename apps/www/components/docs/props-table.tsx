export interface PropRow {
  name: string;
  type: string;
  default?: string;
  description: string;
}

export function PropsTable({ rows, caption = "Props" }: { rows: PropRow[]; caption?: string }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b bg-muted/40 text-left">
            <th className="px-4 py-2.5 font-medium">Prop</th>
            <th className="px-4 py-2.5 font-medium">Type</th>
            <th className="px-4 py-2.5 font-medium">Default</th>
            <th className="px-4 py-2.5 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b align-top last:border-b-0">
              <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[13px] text-primary">{row.name}</td>
              <td className="px-4 py-2.5 font-mono text-[12px] text-muted-foreground">{row.type}</td>
              <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[12px] text-muted-foreground">
                {row.default ?? "—"}
              </td>
              <td className="min-w-56 px-4 py-2.5 text-muted-foreground">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
