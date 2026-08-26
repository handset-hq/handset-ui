"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface MessageTemplate {
  id: string;
  name: string;
  /** Body text, optionally with {{variable}} placeholders. */
  body: string;
}

export interface MessageTemplatesProps {
  templates: MessageTemplate[];
  /** Values substituted for {{keys}} in a template body before it's used. */
  variables?: Record<string, string>;
  /** Receives the merged body (and the source template) when one is chosen. */
  onSelect: (body: string, template: MessageTemplate) => void;
  className?: string;
}

/** Substitute {{keys}} in `body` from `vars`; unknown keys are left untouched. */
export function mergeTemplate(body: string, vars: Record<string, string> = {}): string {
  return body.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, key) => (key in vars ? vars[key] : m));
}

/**
 * A saved-message picker with {{variable}} merge. Each row previews the body
 * with the current variables substituted; "Use" hands the merged text to your
 * composer. Bring your own templates (from your DB, config, or state).
 */
export function MessageTemplates({ templates, variables = {}, onSelect, className }: MessageTemplatesProps) {
  const [openId, setOpenId] = React.useState<string | null>(null);

  if (templates.length === 0) {
    return (
      <p className={cn("rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground", className)}>
        No templates yet.
      </p>
    );
  }

  return (
    <div className={cn("divide-y rounded-lg border", className)}>
      {templates.map((t) => {
        const merged = mergeTemplate(t.body, variables);
        const isOpen = openId === t.id;
        return (
          <div key={t.id} className="p-3">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : t.id)}
                aria-expanded={isOpen}
                className="min-w-0 flex-1 text-left text-sm font-medium"
              >
                {t.name}
              </button>
              <button
                type="button"
                onClick={() => onSelect(merged, t)}
                className="shrink-0 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Use
              </button>
            </div>
            <p className={cn("mt-1 whitespace-pre-wrap text-sm text-muted-foreground", !isOpen && "line-clamp-2")}>
              {merged}
            </p>
          </div>
        );
      })}
    </div>
  );
}
