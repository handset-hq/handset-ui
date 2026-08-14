"use client";

import * as React from "react";
import { MessageSquare, Phone, Voicemail as VoicemailIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Messaging } from "@/components/handset/messaging";
import { CallLog } from "@/components/handset/call-log";
import { VoicemailList } from "@/components/handset/voicemail-player";

export interface PhoneSystemProps {
  /** Scope to one tenant. Usually unnecessary — your proxy routes scope server-side. */
  tenantId?: string;
  /** Which tab opens first. */
  defaultTab?: "messages" | "calls" | "voicemail";
  className?: string;
}

const TABS = [
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "calls", label: "Calls", icon: Phone },
  { id: "voicemail", label: "Voicemail", icon: VoicemailIcon },
] as const;

/**
 * The whole phone system in one component: texting, call history, and
 * voicemail behind three tabs. Drop it on a page; your product has a
 * phone system.
 */
export function PhoneSystem({ tenantId, defaultTab = "messages", className }: PhoneSystemProps) {
  const [tab, setTab] = React.useState<(typeof TABS)[number]["id"]>(defaultTab);

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div role="tablist" aria-label="Phone system" className="flex gap-1 border-b pb-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
              tab === id ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 pt-3">
        {tab === "messages" ? <Messaging tenantId={tenantId} className="h-full" /> : null}
        {tab === "calls" ? (
          <div className="h-full overflow-y-auto">
            <CallLog tenantId={tenantId} />
          </div>
        ) : null}
        {tab === "voicemail" ? (
          <div className="h-full overflow-y-auto">
            <VoicemailList tenantId={tenantId} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
