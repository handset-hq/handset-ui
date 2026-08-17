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
    ],
  },
  {
    label: "Components",
    items: [
      { title: "Inbox", href: "/docs/components/inbox" },
      { title: "Thread", href: "/docs/components/thread" },
      { title: "Composer", href: "/docs/components/composer" },
      { title: "Voicemail player", href: "/docs/components/voicemail-player" },
      { title: "Click-to-call", href: "/docs/components/click-to-call-button" },
      { title: "Call log", href: "/docs/components/call-log" },
      { title: "Call transcript", href: "/docs/components/call-transcript" },
      { title: "Opt-in form", href: "/docs/components/opt-in-form" },
      { title: "Number picker", href: "/docs/components/number-picker" },
      { title: "Port status", href: "/docs/components/port-status" },
      { title: "Texting readiness", href: "/docs/components/texting-readiness" },
      { title: "Usage meter", href: "/docs/components/usage-meter" },
      { title: "Dialer", href: "/docs/components/dialer" },
      { title: "Call HUD", href: "/docs/components/call-hud" },
      { title: "Incoming call toast", href: "/docs/components/incoming-call-toast" },
      { title: "Next.js routes", href: "/docs/components/next-routes" },
      { title: "Express routes", href: "/docs/components/express-routes" },
      { title: "Remix routes", href: "/docs/components/remix-routes" },
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
