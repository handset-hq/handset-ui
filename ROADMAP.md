# Handset UI roadmap

What exists, what's next, and where you can weigh in. Items move when real
products need them — [open an issue](https://github.com/handset-hq/handset-ui/issues)
if your use case should reorder this list.

## Shipped

**Messaging** — `inbox`, `thread`, `composer` (GSM-7/UCS-2 segment counter,
optimistic send), `messaging` (two-pane block), `opt-in-form`,
`texting-readiness`.

**Messaging primitives** — `message-bubble`, `delivery-status`,
`message-group` (iMessage-style same-side clustering), `date-divider`
(Today / Yesterday / weekday / short date). Extracted from `thread`, which
now composes them and inserts day dividers automatically. Install any one on
its own to build a custom conversation view.

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

**Numbers & compliance** — `number-picker`, `port-status`, `usage-meter`,
`brand-registration-form`, `campaign-registration-form`, `e911-address-form`
(10DLC + E911 registration, validated client-side and POSTed through your
proxy), `compliance-status` (brand + campaign approval tracker: badge,
rejection reason, assigned throughput; polls while pending). The proxy
routes now expose `POST /brands`, `/campaigns`, `/e911_addresses` and the
matching reads.

**Blocks & plumbing** — `contact-timeline` (per-contact merge of
conversations, calls, voicemails), `phone-system` (3-tab mega-block),
`next-routes` / `express-routes` / `remix-routes` (the server proxy that
keeps your API key off the client, for Next.js, Express, and
Remix / React Router 7).

**Realtime** — `<HandsetProvider realtime>` connects the browser to the
event stream (`wss://media.handset.dev/v1/events`, short-lived tokens via
your proxy): hooks refetch the instant events happen and polling drops to
a 60s safety net. `useHandsetEvents` exposes the raw stream.

**Packages** — [`@handset/react`](https://www.npmjs.com/package/@handset/react)
(headless hooks) and [`@handset/webrtc`](https://www.npmjs.com/package/@handset/webrtc)
(carrier-agnostic softphone core).

## Next

Prioritized by capability-to-UI gap — the Handset API supports each of these
today with no component to drive it.

1. **Voice routing** — `business-hours-editor` (weekly schedule + timezone per
   business) and `voicemail-inbox` (list + unread wrapping `voicemail-player`).
2. **Porting** — `port-in-wizard` (the create/submit flow; we ship `port-status`
   for viewing only).
3. **Observability** — `event-log` / `webhook-inspector` dogfooding
   `useHandsetEvents`; doubles as the debugger the docs describe.

## Later / exploring

- `message-templates` with `{{variable}}` merge, `quick-replies`, and a
  `broadcast-composer` (send-to-many that respects opt-outs).
- `usage-dashboard` (messages/minutes/spend over time) and a
  `deliverability-panel` (failure-reason breakdown), beyond the single
  `usage-meter`.

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
