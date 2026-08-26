"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const DOCS_NAV = [
  {
    label: "Getting started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Installation", href: "/docs/installation" },
      { title: "Architecture", href: "/docs/architecture" },
      { title: "Realtime", href: "/docs/realtime" },
      { title: "Softphone setup", href: "/docs/softphone-setup" },
    ],
  },
  {
    label: "Blocks",
    items: [
      { title: "Softphone", href: "/docs/components/softphone" },
      { title: "Phone system", href: "/docs/components/phone-system" },
      { title: "Contact timeline", href: "/docs/components/contact-timeline" },
      { title: "Messaging", href: "/docs/components/messaging" },
      { title: "Agent assist", href: "/docs/components/agent-assist" },
    ],
  },
  {
    label: "Components",
    items: [
      { title: "Inbox", href: "/docs/components/inbox" },
      { title: "Thread", href: "/docs/components/thread" },
      { title: "Composer", href: "/docs/components/composer" },
      { title: "Message bubble", href: "/docs/components/message-bubble" },
      { title: "Message group", href: "/docs/components/message-group" },
      { title: "Delivery status", href: "/docs/components/delivery-status" },
      { title: "Date divider", href: "/docs/components/date-divider" },
      { title: "Voicemail player", href: "/docs/components/voicemail-player" },
      { title: "Voicemail inbox", href: "/docs/components/voicemail-inbox" },
      { title: "Click-to-call", href: "/docs/components/click-to-call-button" },
      { title: "Call log", href: "/docs/components/call-log" },
      { title: "Call transcript", href: "/docs/components/call-transcript" },
      { title: "Number picker", href: "/docs/components/number-picker" },
      { title: "Port status", href: "/docs/components/port-status" },
      { title: "Texting readiness", href: "/docs/components/texting-readiness" },
      { title: "Compliance status", href: "/docs/components/compliance-status" },
      { title: "Usage meter", href: "/docs/components/usage-meter" },
      { title: "Event log", href: "/docs/components/event-log" },
      { title: "Dialer", href: "/docs/components/dialer" },
      { title: "Call HUD", href: "/docs/components/call-hud" },
      { title: "DTMF pad", href: "/docs/components/dtmf-pad" },
      { title: "Incoming call toast", href: "/docs/components/incoming-call-toast" },
      { title: "Next.js routes", href: "/docs/components/next-routes" },
      { title: "Express routes", href: "/docs/components/express-routes" },
      { title: "Remix routes", href: "/docs/components/remix-routes" },
    ],
  },
  {
    label: "Forms",
    items: [
      { title: "Opt-in form", href: "/docs/components/opt-in-form" },
      { title: "Brand registration", href: "/docs/components/brand-registration-form" },
      { title: "Campaign registration", href: "/docs/components/campaign-registration-form" },
      { title: "E911 address", href: "/docs/components/e911-address-form" },
    ],
  },
  {
    label: "Hooks",
    items: [
      { title: "useConversations", href: "/docs/hooks/use-conversations" },
      { title: "useThread", href: "/docs/hooks/use-thread" },
      { title: "useComposer", href: "/docs/hooks/use-composer" },
      { title: "Voice hooks", href: "/docs/hooks/voice" },
      { title: "Number & usage hooks", href: "/docs/hooks/numbers" },
      { title: "Compliance hooks", href: "/docs/hooks/compliance" },
    ],
  },
] as const;

export function DocsSidebar() {
  const pathname = usePathname();
  return (
    <nav className="space-y-6" aria-label="Documentation">
      {DOCS_NAV.map((group) => (
        <div key={group.label}>
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">{group.label}</p>
          <ul className="space-y-px">
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={cn(
                    "block rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    pathname === item.href
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
