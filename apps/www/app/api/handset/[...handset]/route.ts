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
  return NextResponse.json({ error: { code: "not_found", message: "Unknown route" } }, { status: 404 });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ handset: string[] }> }) {
  const { handset } = await ctx.params;
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
