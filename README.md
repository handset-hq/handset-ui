# Handset UI

**Texting inside your product, in an afternoon.**

Open-source React components for embedded messaging, built on the
[Handset API](https://handset.dev). Distributed the shadcn way: the CLI copies
the source into your repo, styled with your Tailwind tokens, yours to change.

```bash
# 1. Point the shadcn CLI at the Handset registry
npx shadcn@latest registry add @handset=https://ui.handset.dev/r/{name}.json

# 2. Install a complete texting surface + the server proxy route
npx shadcn@latest add @handset/messaging @handset/next-routes
```

Set `HANDSET_API_KEY` in your env, wire `resolveTenantId()` in the generated
route to your session, and render it:

```tsx
import { HandsetProvider } from "@handset/react";
import { Messaging } from "@/components/handset/messaging";

export default function MessagesPage() {
  return (
    <HandsetProvider>
      <div className="h-[600px]">
        <Messaging />
      </div>
    </HandsetProvider>
  );
}
```

## What's in the registry

| Item | What it is |
| --- | --- |
| `@handset/messaging` | Two-pane texting surface — inbox + thread, responsive to mobile |
| `@handset/inbox` | Conversation list: previews, relative times, STOP badges, infinite scroll |
| `@handset/thread` | Message history: delivery states, opt-out handling, wired composer |
| `@handset/composer` | Draft box with live SMS segment counting and unicode detection |
| `@handset/next-routes` | Next.js proxy route — your API key never reaches the browser |

## Architecture

Two layers, like shadcn-on-Radix:

- **[`@handset/react`](packages/react)** (npm, versioned) — headless hooks:
  `useConversations`, `useThread`, `useComposer`, plus segment math and a tiny
  client. Logic we maintain; bring your own UI if you prefer.
- **The registry** ([`apps/www/registry`](apps/www/registry)) — the visual
  components, copied into your project as source.

Components never hold API keys. They call proxy routes in **your** backend
(added by `@handset/next-routes`); your server holds the Handset key and your
existing session auth decides which tenant each signed-in user sees. The
Handset API handles the rest — numbers, delivery, threading, 10DLC compliance,
STOP/HELP.

## Development

```bash
pnpm install
pnpm --filter @handset/react build   # hooks package
pnpm dev                             # docs site + live demo at localhost:3000
pnpm registry:build                  # compile registry.json → public/r/*.json
```

The docs site serves a mock Handset API (`apps/www/app/api/handset`) so the
demo works with zero setup.

## Requirements

- React 18+ (components target React 19 / Tailwind v4 / shadcn CLI ≥ 3)
- A [Handset](https://handset.dev) account for real traffic — the demo runs on
  mock data without one

## Roadmap

See [ROADMAP.md](ROADMAP.md) — shipped components, what's next (call
summaries, MMS attachments, more framework proxies), and non-goals. Issues
with real use cases move items up the list.

## License

[MIT](LICENSE) © Handset HQ, Inc.
