# Handset UI roadmap

What exists, what's next, and where you can weigh in. Items move when real
products need them — [open an issue](https://github.com/handset-hq/handset-ui/issues)
if your use case should reorder this list.

## Shipped

**Messaging** — `inbox`, `thread`, `composer` (GSM-7/UCS-2 segment counter,
optimistic send), `messaging` (two-pane block), `opt-in-form`,
`texting-readiness`.

**Voice** — `click-to-call-button`, `call-log` (expanded rows show the AI
call summary, keypad interactions, and transcript), `call-transcript`
(live-poll), `call-keypad` (gather prompts + answered digits, loose
keypresses, sent DTMF — also inside `contact-timeline`), `agent-assist`
(finds the active call by number, starts on-demand transcription, streams
the conversation live, AI summary after hangup), `voicemail-player`.

**MMS** — `composer` attachments via `onPickAttachment` (chips, per-message
MMS footer, ≤10 URLs), image bubbles in `thread`, `media_urls` end to end.

**WebRTC softphone** — `dialer`, `call-hud` (with pop-out keypad),
`dtmf-pad` (in-call tones with real dual-tone feedback),
`incoming-call-toast`, `softphone` (browser calling via `@handset/webrtc`,
with generated ringtone).

**Numbers & compliance** — `number-picker`, `port-status`, `usage-meter`.

**Blocks & plumbing** — `contact-timeline` (per-contact merge of
conversations, calls, voicemails), `phone-system` (3-tab mega-block),
`next-routes` / `express-routes` / `remix-routes` (the server proxy that
keeps your API key off the client, for Next.js, Express, and
Remix / React Router 7).

**Packages** — [`@handset/react`](https://www.npmjs.com/package/@handset/react)
(headless hooks) and [`@handset/webrtc`](https://www.npmjs.com/package/@handset/webrtc)
(carrier-agnostic softphone core).

## Next

- **`use-websocket` upgrade path** — the hooks are polling-first by design;
  a drop-in live transport once the API exposes one.

## Later / exploring

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
