# Handset UI roadmap

What exists, what's next, and where you can weigh in. Items move when real
products need them — [open an issue](https://github.com/handset-hq/handset-ui/issues)
if your use case should reorder this list.

## Shipped

**Messaging** — `inbox`, `thread`, `composer` (GSM-7/UCS-2 segment counter,
optimistic send), `messaging` (two-pane block), `opt-in-form`,
`texting-readiness`.

**Voice** — `click-to-call-button`, `call-log`, `call-transcript` (live-poll),
`voicemail-player`.

**WebRTC softphone** — `dialer`, `call-hud`, `incoming-call-toast`,
`softphone` (browser calling via `@handset/webrtc`, with generated ringtone).

**Numbers & compliance** — `number-picker`, `port-status`, `usage-meter`.

**Blocks & plumbing** — `contact-timeline` (per-contact merge of
conversations, calls, voicemails), `phone-system` (3-tab mega-block),
`next-routes` (the server proxy that keeps your API key off the client).

**Packages** — [`@handset/react`](https://www.npmjs.com/package/@handset/react)
(headless hooks) and [`@handset/webrtc`](https://www.npmjs.com/package/@handset/webrtc)
(carrier-agnostic softphone core).

## Next

- **Call summaries in `call-log`** — the API now returns an AI `summary` on
  transcribed calls and a `call.summary` webhook; surface it in the expanded
  call row and `contact-timeline`.
- **MMS in `composer` and `thread`** — attachment picker, image bubbles,
  `media_urls` passthrough (API support just landed).
- **`use-websocket` upgrade path** — the hooks are polling-first by design;
  a drop-in live transport once the API exposes one.
- **Framework proxies beyond Next.js** — `remix-routes`, `express-routes`
  registry items mirroring `next-routes`.

## Later / exploring

- Agent-assist surfaces on live transcripts (the `call-transcript` primitive
  already polls mid-call).
- Scheduled send + quiet-hours awareness in `composer`.
- Theming presets showing the components under contrasting design systems.
- React Native variants of the messaging primitives.

## Non-goals

- Components that talk to the Handset API from the browser with a raw API
  key. Everything ships against your server proxy (`next-routes`) — the only
  exception is the softphone, which uses short-lived per-seat tokens because
  media can't proxy.
- A themed widget you can't restyle. If a component fights your design
  system, that's a bug.
