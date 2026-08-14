"use client";

import * as React from "react";
import { HandsetProvider } from "@handset/react";
import { CodeBlock } from "@/components/docs/code-block";

/** Page title + lead paragraph. */
export function DocHeader({ title, lead }: { title: string; lead: string }) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-2xl text-base text-muted-foreground">{lead}</p>
    </header>
  );
}

export function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <section className="mt-10" aria-labelledby={id}>
      <h2 id={id} className="mb-3 text-lg font-semibold tracking-tight">
        {title}
      </h2>
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground [&_p]:max-w-2xl">{children}</div>
    </section>
  );
}

/** Live component preview backed by the site's mock API. */
export function Preview({ children, height = 420 }: { children: React.ReactNode; height?: number }) {
  return (
    <HandsetProvider baseUrl="/api/handset">
      <div className="overflow-hidden rounded-lg border" style={{ height }}>
        {children}
      </div>
    </HandsetProvider>
  );
}

/** Install command block for a registry item. */
export function InstallBlock({ item }: { item: string }) {
  return <CodeBlock code={`npx shadcn@latest add @handset/${item}`} />;
}
