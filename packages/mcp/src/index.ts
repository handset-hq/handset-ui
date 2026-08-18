/**
 * @handset/mcp — the Handset API as an MCP server.
 *
 * Give any MCP client (Claude Code, Claude Desktop, Cursor, …) a business
 * phone system: send texts, place calls, read live transcripts and AI
 * summaries, buy numbers, provision tenants.
 *
 * Safety model: test-mode keys (hs_test_…) run against Handset's simulated
 * carrier — free, instant, no real phones — and are the default expectation.
 * Live keys are refused unless HANDSET_ALLOW_LIVE=1 is set, because a live
 * key lets the agent text and call real people at real cost.
 *
 * Config:
 *   HANDSET_API_KEY     required, hs_test_… (or hs_live_… with the override)
 *   HANDSET_API_URL     optional, defaults to https://api.handset.dev/v1
 *   HANDSET_ALLOW_LIVE  set to 1 to permit a live-mode key
 *
 * `handset-mcp --skill` prints the companion agent skill (SKILL.md).
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API = process.env.HANDSET_API_URL ?? "https://api.handset.dev/v1";
const KEY = process.env.HANDSET_API_KEY ?? "";

if (process.argv.includes("--skill")) {
  const here = dirname(fileURLToPath(import.meta.url));
  process.stdout.write(readFileSync(join(here, "..", "skill", "SKILL.md"), "utf8"));
  process.exit(0);
}

if (!KEY) {
  console.error(
    "HANDSET_API_KEY is not set. Use a test-mode key (hs_test_…) — get one at https://handset.dev/early-access",
  );
  process.exit(1);
}
if (KEY.startsWith("hs_live_") && process.env.HANDSET_ALLOW_LIVE !== "1") {
  console.error(
    "Refusing to start with a LIVE key: this server would let the agent text and call real people at real cost.\n" +
      "Use your hs_test_… key (simulated carrier, free), or set HANDSET_ALLOW_LIVE=1 if you really mean it.",
  );
  process.exit(1);
}

const MODE = KEY.startsWith("hs_test_") ? "test" : "live";

async function api(method: string, path: string, body?: unknown, query?: Record<string, unknown>) {
  const url = new URL(`${API}${path}`);
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const err = (json as { error?: { code?: string; message?: string } }).error;
    throw new Error(`${res.status} ${err?.code ?? ""}: ${err?.message ?? text.slice(0, 300)}`);
  }
  return json;
}

function out(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}

const server = new McpServer({ name: "handset", version: "0.1.0" });

// ── Tenants & numbers ──────────────────────────────────────────────────────

server.registerTool(
  "list_tenants",
  {
    description:
      "List tenants on this Handset account. A tenant is one of your customers' businesses — it owns numbers, conversations, and opt-out lists.",
    inputSchema: { limit: z.number().int().min(1).max(100).optional() },
  },
  async ({ limit }) => out(await api("GET", "/tenants", undefined, { limit: limit ?? 25 })),
);

server.registerTool(
  "create_tenant",
  {
    description: "Create a tenant (one customer business). Returns the tenant with its tnt_… id.",
    inputSchema: {
      name: z.string().describe("Display name, e.g. 'Ridge Plumbing'"),
      timezone: z.string().optional().describe("IANA timezone, e.g. America/Phoenix"),
    },
  },
  async ({ name, timezone }) => out(await api("POST", "/tenants", { name, timezone })),
);

server.registerTool(
  "search_numbers",
  {
    description: "Search purchasable phone numbers by area code. Free and instant in test mode.",
    inputSchema: { area_code: z.string().describe("3-digit US area code, e.g. 415") },
  },
  async ({ area_code }) =>
    out(await api("GET", "/phone_numbers/available", undefined, { area_code, limit: 5 })),
);

server.registerTool(
  "buy_number",
  {
    description:
      "BILLABLE in live mode (monthly rental): purchase a phone number for a tenant. In test mode numbers are free and simulated. Confirm with the user before buying on a live key.",
    inputSchema: {
      tenant_id: z.string().describe("tnt_… id that will own the number"),
      phone_number: z.string().describe("E.164 number from search_numbers"),
    },
  },
  async ({ tenant_id, phone_number }) =>
    out(await api("POST", "/phone_numbers", { tenant_id, phone_number })),
);

server.registerTool(
  "list_numbers",
  {
    description: "List the account's phone numbers, optionally for one tenant.",
    inputSchema: { tenant_id: z.string().optional() },
  },
  async ({ tenant_id }) => out(await api("GET", "/phone_numbers", undefined, { tenant_id })),
);

// ── Messaging ──────────────────────────────────────────────────────────────

server.registerTool(
  "send_message",
  {
    description:
      "OUTWARD-FACING: send an SMS (or MMS with media_urls) from a tenant number. In live mode this texts a real person and bills per segment — confirm with the user first. Test mode is simulated and free. Replies thread by conversation_id.",
    inputSchema: {
      from: z.string().describe("num_… id or the tenant's E.164 number"),
      to: z.string().describe("Recipient E.164, e.g. +14155550142"),
      body: z.string().max(1600),
      media_urls: z.array(z.string().url()).max(10).optional().describe("HTTPS media URLs (makes it an MMS)"),
    },
  },
  async ({ from, to, body, media_urls }) =>
    out(await api("POST", "/messages", { from, to, body, media_urls })),
);

server.registerTool(
  "list_conversations",
  {
    description: "List message threads, newest activity first.",
    inputSchema: { tenant_id: z.string().optional(), limit: z.number().int().max(100).optional() },
  },
  async ({ tenant_id, limit }) =>
    out(await api("GET", "/conversations", undefined, { tenant_id, limit: limit ?? 25 })),
);

server.registerTool(
  "get_thread",
  {
    description: "Read one conversation's messages, oldest first.",
    inputSchema: { conversation_id: z.string().describe("cnv_… id") },
  },
  async ({ conversation_id }) =>
    out(await api("GET", "/messages", undefined, { conversation_id, limit: 100 })),
);

// ── Voice ──────────────────────────────────────────────────────────────────

server.registerTool(
  "make_call",
  {
    description:
      "OUTWARD-FACING: place a click-to-call — dials connect_to (the agent's phone) first, then to (the customer), and bridges them; both see the tenant number. Live mode rings real phones and bills per minute — confirm with the user first. Test mode simulates the whole lifecycle. Set transcribe for live transcript + AI summary.",
    inputSchema: {
      from: z.string().describe("num_… id or tenant E.164 (the caller ID both parties see)"),
      to: z.string().describe("Customer's E.164"),
      connect_to: z.string().describe("Agent's E.164 — their phone rings first"),
      transcribe: z.boolean().optional(),
    },
  },
  async ({ from, to, connect_to, transcribe }) =>
    out(await api("POST", "/calls", { from, to, connect_to, transcribe })),
);

server.registerTool(
  "get_call",
  {
    description:
      "Retrieve a call: status, duration, AI summary (arrives ~15s after a transcribed call ends), and the event timeline (gathers, keypresses, streams).",
    inputSchema: { call_id: z.string().describe("call_… id") },
  },
  async ({ call_id }) => out(await api("GET", `/calls/${call_id}`)),
);

server.registerTool(
  "list_calls",
  {
    description: "List calls with status and duration, newest first.",
    inputSchema: { tenant_id: z.string().optional(), limit: z.number().int().max(100).optional() },
  },
  async ({ tenant_id, limit }) =>
    out(await api("GET", "/calls", undefined, { tenant_id, limit: limit ?? 25 })),
);

server.registerTool(
  "get_transcript",
  {
    description: "Read a call's transcript so far — callable mid-call for live transcription.",
    inputSchema: { call_id: z.string() },
  },
  async ({ call_id }) => out(await api("GET", `/calls/${call_id}/transcript`)),
);

server.registerTool(
  "start_transcription",
  {
    description:
      "Turn on live transcription for an in-progress call (either direction). Idempotent. Billed per transcribed minute; an AI summary generates after hangup.",
    inputSchema: { call_id: z.string() },
  },
  async ({ call_id }) => out(await api("POST", `/calls/${call_id}/transcription`)),
);

server.registerTool(
  "list_voicemails",
  {
    description: "List voicemails with transcripts and time-limited audio URLs.",
    inputSchema: { tenant_id: z.string().optional() },
  },
  async ({ tenant_id }) => out(await api("GET", "/voicemails", undefined, { tenant_id })),
);

server.registerTool(
  "get_usage",
  {
    description: "This month's usage by kind (segments, minutes, transcription, streams…). Test-mode usage is metered but never billed.",
    inputSchema: {},
  },
  async () => out(await api("GET", "/usage")),
);

console.error(`handset-mcp: ${MODE} mode against ${API}`);
await server.connect(new StdioServerTransport());
