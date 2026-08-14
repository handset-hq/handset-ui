import { type NextRequest, NextResponse } from "next/server";

/**
 * Demo-only in-memory Handset API used by the live examples on this site.
 * In your app this file is replaced by the real proxy:
 *   npx shadcn@latest add @handset/next-routes
 */

interface DemoMessage {
  id: string;
  conversation_id: string;
  direction: "inbound" | "outbound";
  from: string;
  to: string;
  body: string | null;
  status: string;
  segments: number;
  created_at: string;
}

const NOW = Date.now();
const minutesAgo = (m: number) => new Date(NOW - m * 60_000).toISOString();

const conversations = [
  {
    id: "cnv_demo_maria",
    phone_number_id: "num_demo",
    external_number: "+14155550132",
    last_activity_at: minutesAgo(2),
    last_message_preview: "Perfect, see you at 2!",
    opted_out: false,
  },
  {
    id: "cnv_demo_jordan",
    phone_number_id: "num_demo",
    external_number: "+14155550188",
    last_activity_at: minutesAgo(49),
    last_message_preview: "Can we move my appointment to Friday?",
    opted_out: false,
  },
  {
    id: "cnv_demo_sam",
    phone_number_id: "num_demo",
    external_number: "+14155550107",
    last_activity_at: minutesAgo(60 * 26),
    last_message_preview: "STOP",
    opted_out: true,
  },
];

let counter = 0;

const seedMessages: DemoMessage[] = [
  msg("cnv_demo_maria", "outbound", "Hi Maria! Reminder: your appointment is tomorrow at 2pm. Reply C to confirm or R to reschedule.", 34, "delivered"),
  msg("cnv_demo_maria", "inbound", "C", 30, "received"),
  msg("cnv_demo_maria", "outbound", "You're confirmed for 2pm. We'll text you when we're on the way.", 28, "delivered"),
  msg("cnv_demo_maria", "inbound", "Perfect, see you at 2!", 2, "received"),
  msg("cnv_demo_jordan", "outbound", "Hi Jordan, your invoice #1042 for $180 is ready. Pay online: example.com/i/1042", 60 * 3, "delivered"),
  msg("cnv_demo_jordan", "inbound", "Can we move my appointment to Friday?", 49, "received"),
  msg("cnv_demo_sam", "outbound", "Your order is ready for pickup!", 60 * 27, "delivered"),
  msg("cnv_demo_sam", "inbound", "STOP", 60 * 26, "received"),
];

function msg(cid: string, direction: "inbound" | "outbound", body: string, minAgo: number, status: string): DemoMessage {
  counter += 1;
  return {
    id: `msg_demo_${counter}`,
    conversation_id: cid,
    direction,
    from: direction === "outbound" ? "num_demo" : "+1415555",
    to: direction === "outbound" ? "+1415555" : "num_demo",
    body,
    status,
    segments: 1,
    created_at: minutesAgo(minAgo),
  };
}

// Survives HMR in dev; resets on cold start in prod (fine for a demo).
const g = globalThis as unknown as { __handsetDemo?: DemoMessage[] };
g.__handsetDemo ??= [...seedMessages];
const messages = g.__handsetDemo;

export async function GET(_req: NextRequest, ctx: { params: Promise<{ handset: string[] }> }) {
  const { handset } = await ctx.params;
  const [resource, id] = handset;

  if (resource === "conversations" && !id) {
    const sorted = [...conversations].sort((a, b) => Date.parse(b.last_activity_at) - Date.parse(a.last_activity_at));
    return NextResponse.json({ data: sorted, has_more: false, next_cursor: null });
  }
  if (resource === "conversations" && id) {
    const convo = conversations.find((c) => c.id === id);
    if (!convo) return NextResponse.json({ error: { code: "not_found", message: "No such conversation" } }, { status: 404 });
    return NextResponse.json(convo);
  }
  if (resource === "messages") {
    const cid = _req.nextUrl.searchParams.get("conversation_id");
    const data = messages
      .filter((m) => !cid || m.conversation_id === cid)
      .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
    return NextResponse.json({ data, has_more: false, next_cursor: null });
  }
  if (resource === "voicemails" && !id) {
    return NextResponse.json({ data: voicemails, has_more: false, next_cursor: null });
  }
  if (resource === "voicemails" && id) {
    const vm = voicemails.find((v) => v.id === id);
    if (!vm) return NextResponse.json({ error: { code: "not_found", message: "No such voicemail" } }, { status: 404 });
    return NextResponse.json(vm);
  }
  if (resource === "calls" && !id) {
    const data = calls.map(materializeCall).sort((a, b) => Date.parse(b.started_at) - Date.parse(a.started_at));
    return NextResponse.json({ data, has_more: false, next_cursor: null });
  }
  if (resource === "calls" && id && handset[2] === "transcript") {
    return transcriptFor(id);
  }
  if (resource === "calls" && id) {
    const call = calls.find((c) => c.id === id);
    if (!call) return NextResponse.json({ error: { code: "not_found", message: "No such call" } }, { status: 404 });
    return NextResponse.json(materializeCall(call));
  }
  if (resource === "phone_numbers" && id === "available") {
    const area = _req.nextUrl.searchParams.get("area_code") ?? "415";
    const localities = ["San Rafael", "Sausalito", "Mill Valley", "Novato", "San Francisco", "Larkspur"];
    const data = Array.from({ length: 6 }, (_, i) => ({
      phone_number: `+1${area}555${String(100 + i * 37).padStart(4, "0")}`,
      locality: localities[i % localities.length],
      region: "CA",
      capabilities: ["sms", "mms", "voice"],
      monthly_price_usd: "2.00",
    }));
    return NextResponse.json({ data });
  }
  if (resource === "phone_numbers" && id) {
    const num = phoneNumbers.find((n) => n.id === id);
    if (!num) return NextResponse.json({ error: { code: "not_found", message: "No such number" } }, { status: 404 });
    return NextResponse.json(materializeNumber(num));
  }
  if (resource === "port_ins" && id) {
    const port = portIns.find((p) => p.id === id);
    if (!port) return NextResponse.json({ error: { code: "not_found", message: "No such port" } }, { status: 404 });
    return NextResponse.json(materializePort(port));
  }
  if (resource === "usage") {
    return NextResponse.json({
      object: "usage_summary",
      mode: "test",
      start: new Date(NOW - 12 * 86_400_000).toISOString(),
      end: new Date(NOW).toISOString(),
      data: [
        { kind: "sms_segment_outbound", quantity: 4218 },
        { kind: "sms_segment_inbound", quantity: 1877 },
        { kind: "voice_minute_outbound", quantity: 342 },
        { kind: "voice_minute_inbound", quantity: 518 },
        { kind: "transcription_minute", quantity: 296 },
        { kind: "number_month", quantity: 12 },
      ],
    });
  }
  if (resource === "demo-audio") {
    return new NextResponse(new Uint8Array(demoWav()), {
      headers: { "content-type": "audio/wav", "cache-control": "public, max-age=3600" },
    });
  }
  return NextResponse.json({ error: { code: "not_found", message: "Unknown route" } }, { status: 404 });
}

// ---------- numbers / porting demo data ----------

interface DemoNumber {
  id: string;
  phone_number: string;
  campaign_id?: string | null;
  messaging_ready: boolean;
  created_at: string;
  /** Purchased in this session: campaign attaches at +8s, ready at +20s. */
  boughtAt?: number;
}

const phoneNumbers: DemoNumber[] = [
  { id: "num_demo", phone_number: "+14155550100", campaign_id: "cmp_demo", messaging_ready: true, created_at: minutesAgo(60 * 24 * 30) },
  { id: "num_demo_pending", phone_number: "+14155550177", campaign_id: "cmp_demo_2", messaging_ready: false, created_at: minutesAgo(60 * 24 * 2) },
];

function materializeNumber(num: DemoNumber) {
  if (num.boughtAt === undefined) return { ...num, boughtAt: undefined };
  const elapsed = (Date.now() - num.boughtAt) / 1000;
  return {
    ...num,
    campaign_id: elapsed >= 8 ? "cmp_demo" : null,
    messaging_ready: elapsed >= 20,
    boughtAt: undefined,
  };
}

interface DemoPort {
  id: string;
  phone_numbers: string[];
  /** "live" ports advance by wall-clock; otherwise status is fixed. */
  live?: boolean;
  status: string;
  status_detail?: string | null;
  foc_date?: string | null;
  startedAt: number;
}

const portIns: DemoPort[] = [
  { id: "port_demo_live", phone_numbers: ["+14155550142"], live: true, status: "draft", startedAt: NOW },
  {
    id: "port_demo_action",
    phone_numbers: ["+14155550166"],
    status: "action_needed",
    status_detail: "Account number doesn't match the losing carrier's records.",
    startedAt: NOW,
  },
];

/** Live port sim: draft → in_review (5s) → foc_confirmed (25s) → completed (45s). */
function materializePort(port: DemoPort) {
  let status = port.status;
  let foc: string | null = port.foc_date ?? null;
  if (port.live) {
    const elapsed = (Date.now() - port.startedAt) / 1000;
    if (elapsed >= 45) status = "completed";
    else if (elapsed >= 25) status = "foc_confirmed";
    else if (elapsed >= 5) status = "in_review";
    else status = "draft";
    if (status === "foc_confirmed" || status === "completed") {
      foc = new Date(port.startedAt + 3 * 86_400_000).toISOString();
    }
  }
  return {
    id: port.id,
    tenant_id: "tnt_demo",
    phone_numbers: port.phone_numbers,
    status,
    status_detail: status === "action_needed" ? port.status_detail : null,
    entity_name: "Brightside Property Co",
    authorized_person: "Alex Rivera",
    billing_phone_number: port.phone_numbers[0],
    account_number: "••••4821",
    service_address: { street: "128 Main St", city: "San Rafael", state: "CA", postal_code: "94901" },
    foc_date: foc,
    created_at: new Date(port.startedAt).toISOString(),
  };
}

// ---------- voice demo data ----------

interface DemoCall {
  id: string;
  direction: "inbound" | "outbound";
  from: string;
  to: string;
  connect_to?: string | null;
  status: string;
  duration_seconds?: number | null;
  started_at: string;
  ended_at?: string | null;
  /** For simulated live calls: advance status by wall-clock elapsed time. */
  live?: boolean;
}

const voicemails = [
  {
    id: "vm_demo_1",
    call_id: "call_demo_vm",
    from: "+14155550163",
    duration_seconds: 23,
    transcript:
      "Hi, this is Dana from unit 4B. The kitchen faucet is leaking again, worse than last time. Can someone come by tomorrow morning? Thanks.",
    audio_url: "/api/handset/demo-audio",
    created_at: minutesAgo(38),
  },
  {
    id: "vm_demo_2",
    call_id: "call_demo_vm2",
    from: "+14155550117",
    duration_seconds: 12,
    transcript: "Hey, just confirming Thursday at 10. Call me back if that changed.",
    audio_url: "/api/handset/demo-audio",
    created_at: minutesAgo(60 * 5),
  },
];

const calls: DemoCall[] = [
  { id: "call_demo_1", direction: "outbound", from: "num_demo", to: "+14155550132", connect_to: "+14155550199", status: "completed", duration_seconds: 154, started_at: minutesAgo(31), ended_at: minutesAgo(28) },
  { id: "call_demo_vm", direction: "inbound", from: "+14155550163", to: "num_demo", status: "voicemail", duration_seconds: 23, started_at: minutesAgo(39), ended_at: minutesAgo(38) },
  { id: "call_demo_2", direction: "inbound", from: "+14155550188", to: "num_demo", status: "missed", started_at: minutesAgo(60 * 4), ended_at: minutesAgo(60 * 4) },
];

/** Simulated live calls: dialing → ringing (2s) → in_progress (5s) → completed (17s). */
function materializeCall(call: DemoCall) {
  if (!call.live) return { ...call, live: undefined };
  const elapsed = (Date.now() - Date.parse(call.started_at)) / 1000;
  let status = "dialing";
  let duration: number | null = null;
  let ended: string | null = null;
  if (elapsed >= 17) {
    status = "completed";
    duration = Math.round(elapsed - 5);
    ended = new Date(Date.parse(call.started_at) + 17_000).toISOString();
  } else if (elapsed >= 5) status = "in_progress";
  else if (elapsed >= 2) status = "ringing";
  return { ...call, status, duration_seconds: duration, ended_at: ended, live: undefined };
}

const TRANSCRIPTS: Record<string, { speaker: string; text: string; afterSeconds: number }[]> = {
  call_demo_1: [
    { speaker: "agent", text: "Hi Maria, it's Alex from Brightside Property. You asked about the parking spot?", afterSeconds: 0 },
    { speaker: "customer", text: "Yes! Is spot 12 still available?", afterSeconds: 0 },
    { speaker: "agent", text: "It is — I can add it to your lease at forty a month starting September.", afterSeconds: 0 },
    { speaker: "customer", text: "Perfect, let's do that.", afterSeconds: 0 },
  ],
};

const LIVE_SCRIPT = [
  { speaker: "agent", text: "Hi, this is the demo agent — thanks for trying click-to-call.", afterSeconds: 7 },
  { speaker: "customer", text: "Wow, it really bridged the call.", afterSeconds: 10 },
  { speaker: "agent", text: "Every word of this is arriving through the transcript API in real time.", afterSeconds: 13 },
  { speaker: "customer", text: "Alright, I'm sold.", afterSeconds: 16 },
];

function transcriptFor(callId: string) {
  const call = calls.find((c) => c.id === callId);
  if (!call) return NextResponse.json({ error: { code: "not_found", message: "No such call" } }, { status: 404 });
  let segments: { speaker: string; text: string; occurred_at: string }[] = [];
  if (call.live) {
    const elapsed = (Date.now() - Date.parse(call.started_at)) / 1000;
    segments = LIVE_SCRIPT.filter((s) => elapsed >= s.afterSeconds).map((s) => ({
      speaker: s.speaker,
      text: s.text,
      occurred_at: new Date(Date.parse(call.started_at) + s.afterSeconds * 1000).toISOString(),
    }));
  } else {
    segments = (TRANSCRIPTS[callId] ?? []).map((s, i) => ({
      speaker: s.speaker,
      text: s.text,
      occurred_at: new Date(Date.parse(call.started_at) + i * 8000).toISOString(),
    }));
  }
  return NextResponse.json({
    call_id: callId,
    text: segments.map((s) => s.text).join(" "),
    segments,
  });
}

/** A short two-tone chime, generated as a 8kHz 16-bit mono WAV. */
function demoWav(): Buffer {
  const rate = 8000;
  const seconds = 1.2;
  const samples = Math.floor(rate * seconds);
  const data = Buffer.alloc(samples * 2);
  for (let i = 0; i < samples; i++) {
    const t = i / rate;
    const freq = t < 0.6 ? 523.25 : 659.25;
    const envelope = Math.min(1, Math.min(t, seconds - t) * 8) * 0.4;
    const value = Math.round(Math.sin(2 * Math.PI * freq * t) * envelope * 32767);
    data.writeInt16LE(value, i * 2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ handset: string[] }> }) {
  const { handset } = await ctx.params;
  if (handset[0] === "calls") {
    const body = (await req.json()) as { from: string; to: string; connect_to: string };
    counter += 1;
    const call: DemoCall = {
      id: `call_demo_live_${counter}`,
      direction: "outbound",
      from: body.from,
      to: body.to,
      connect_to: body.connect_to,
      status: "dialing",
      started_at: new Date().toISOString(),
      live: true,
    };
    calls.unshift(call);
    return NextResponse.json(materializeCall(call), { status: 202 });
  }
  if (handset[0] === "phone_numbers") {
    const body = (await req.json()) as { phone_number: string };
    counter += 1;
    const num: DemoNumber = {
      id: `num_demo_bought_${counter}`,
      phone_number: body.phone_number,
      campaign_id: null,
      messaging_ready: false,
      created_at: new Date().toISOString(),
      boughtAt: Date.now(),
    };
    phoneNumbers.push(num);
    return NextResponse.json(materializeNumber(num), { status: 201 });
  }
  if (handset[0] !== "messages") {
    return NextResponse.json({ error: { code: "not_found", message: "Unknown route" } }, { status: 404 });
  }
  const body = (await req.json()) as { to: string; body?: string };
  const convo = conversations.find((c) => c.external_number === body.to);
  if (convo?.opted_out) {
    return NextResponse.json(
      { error: { code: "recipient_opted_out", message: "This recipient has opted out" } },
      { status: 422 },
    );
  }
  counter += 1;
  const sent: DemoMessage = {
    id: `msg_demo_${counter}`,
    conversation_id: convo?.id ?? "cnv_demo_maria",
    direction: "outbound",
    from: "num_demo",
    to: body.to,
    body: body.body ?? null,
    status: "delivered",
    segments: 1,
    created_at: new Date().toISOString(),
  };
  messages.push(sent);
  if (convo) {
    convo.last_activity_at = sent.created_at;
    convo.last_message_preview = sent.body ?? "";
  }
  // The demo texts back.
  setTimeout(() => {
    counter += 1;
    messages.push({
      id: `msg_demo_${counter}`,
      conversation_id: sent.conversation_id,
      direction: "inbound",
      from: body.to,
      to: "num_demo",
      body: "Got it, thanks! (demo auto-reply)",
      status: "received",
      segments: 1,
      created_at: new Date().toISOString(),
    });
    if (convo) {
      convo.last_activity_at = new Date().toISOString();
      convo.last_message_preview = "Got it, thanks! (demo auto-reply)";
    }
  }, 2500);
  return NextResponse.json(sent, { status: 202 });
}
