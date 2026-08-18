---
name: handset
description: Build on the Handset API — a business phone system (compliant SMS/MMS, voice with transcripts and AI summaries, real numbers, realtime events) for vertical SaaS. Use when integrating texting or calling into an app, or when operating phone workflows through the Handset MCP server.
---

# Handset

Handset (https://handset.dev) gives a platform a complete business phone
system through one REST API: `https://api.handset.dev/v1`, bearer-auth with
mode-scoped keys. Docs: https://docs.handset.dev (LLM index: /llms.txt,
full text: /llms-full.txt).

## The rules that keep integrations correct

1. **Test mode first, always.** `hs_test_…` keys hit a simulated carrier:
   numbers are free and instant, compliance approves immediately, calls
   answer in ~1s and auto-complete, delivery receipts and webhooks fire for
   real. Build and verify everything on a test key; the same code runs live
   by swapping the key. Never send to real people while developing.
2. **The tenant model is the architecture.** Each of the platform's customer
   businesses = one tenant (`POST /v1/tenants`) owning its own numbers,
   conversations, opt-out lists, and routing. Provision per-customer, never
   share one number across customers.
3. **Sends are one call.** `POST /v1/messages {from, to, body}` — threading
   (`conversation_id`), opt-out enforcement, and 10DLC checks happen inside
   it. Pass an `Idempotency-Key` header tied to your trigger id so retries
   never double-text.
4. **Events come to you.** Register webhook endpoints for the catalog
   (`message.received`, `call.transcript`, `call.summary`,
   `voicemail.created`, …) — signed, retried. For UI latency, mint realtime
   tokens (`POST /v1/realtime/tokens`) and connect the browser to
   `wss://media.handset.dev/v1/events`.
5. **Voice is layered.** Click-to-call: `POST /v1/calls {from, to,
   connect_to, transcribe}`. Mid-call: `/transcription` (on-demand
   transcription), `/gather` (keypad questions), `/dtmf`, `/streams` (raw
   bidirectional audio for voice agents). AI summary lands ~15s after a
   transcribed call ends.
6. **Magic numbers rehearse failure** (test mode): +15005550001 delivery
   fails, +15005550002 replies STOP, +15005550003 never answers,
   +15005550007 gather times out, +15005550008 media stream fails.

## Ready-made UI

React apps should not hand-build comms UI: `npx shadcn add @handset/…` from
https://ui.handset.dev installs source components (inbox, thread, composer,
call-log, agent-assist, softphone) plus a server proxy (`next-routes` /
`express-routes` / `remix-routes`) that keeps the API key server-side.
`@handset/react` (npm) has the headless hooks; `<HandsetProvider realtime>`
makes them live.

## Via MCP

The `@handset/mcp` server exposes curated tools (send_message, make_call,
get_transcript, buy_number, …). Treat tools marked OUTWARD-FACING or
BILLABLE as requiring user confirmation when the key is live-mode
(`hs_live_…`). Test-mode keys are safe to act on freely.
