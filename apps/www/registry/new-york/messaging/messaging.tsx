"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Inbox } from "@/components/handset/inbox";
import { Thread } from "@/components/handset/thread";

export interface MessagingProps {
  className?: string;
  /** Scope to one tenant. Usually unnecessary — your proxy routes scope server-side. */
  tenantId?: string;
}

/**
 * A complete two-pane texting surface: inbox on the left, active thread on
 * the right. Drop it on a page and you have messaging in your product.
 */
export function Messaging({ className, tenantId }: MessagingProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  return (
    <div className={cn("grid h-full min-h-0 grid-cols-1 overflow-hidden rounded-lg border md:grid-cols-[280px_1fr]", className)}>
      <Inbox
        tenantId={tenantId}
        selectedId={selectedId}
        onSelect={(c) => setSelectedId(c.id)}
        className={cn("border-b md:border-b-0 md:border-r", selectedId && "hidden md:block")}
      />
      <div className={cn("min-h-0", !selectedId && "hidden md:block")}>
        {selectedId ? (
          <div className="flex h-full min-h-0 flex-col">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="border-b px-4 py-2 text-left text-xs text-muted-foreground md:hidden"
            >
              ← All conversations
            </button>
            <Thread conversationId={selectedId} className="min-h-0 flex-1" />
          </div>
        ) : (
          <Thread conversationId={null} />
        )}
      </div>
    </div>
  );
}
