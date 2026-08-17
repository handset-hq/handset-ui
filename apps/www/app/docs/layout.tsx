import Link from "next/link";
import type { Metadata } from "next";
import { DocsSidebar } from "@/components/docs/sidebar";
import { Wordmark } from "@/components/wordmark";

export const metadata: Metadata = {
  title: { default: "Docs — Handset UI", template: "%s — Handset UI" },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <header className="flex items-center justify-between border-b py-4">
        <div className="flex items-baseline gap-6">
          <Link href="/" className="flex items-baseline gap-1.5">
            <Wordmark className="h-[13px] w-auto text-foreground" />
            <span className="text-sm font-semibold tracking-tight text-primary">UI</span>
          </Link>
          <Link href="/docs" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Docs
          </Link>
        </div>
        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
          <a className="transition-colors hover:text-foreground" href="https://github.com/handset-hq/handset-ui">
            GitHub
          </a>
          <a className="transition-colors hover:text-foreground" href="https://docs.handset.dev">
            API docs
          </a>
        </nav>
      </header>
      <div className="grid gap-10 py-8 md:grid-cols-[200px_1fr]">
        <aside className="md:sticky md:top-8 md:self-start">
          <DocsSidebar />
        </aside>
        <main className="min-w-0 pb-24">{children}</main>
      </div>
    </div>
  );
}
