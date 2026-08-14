import { type NextRequest, NextResponse } from "next/server";

/**
 * Handset proxy routes.
 *
 * Your Handset API key stays on the server; the Handset UI components in the
 * browser call these routes instead. Only the endpoints messaging components
 * need are exposed, and every request is scoped to the tenant you resolve
 * from your own session below.
 *
 * Required env: HANDSET_API_KEY (test or live secret key).
 */

const HANDSET_API = process.env.HANDSET_API_URL ?? "https://api.handset.dev/v1";

/**
 * Resolve which tenant the signed-in user belongs to. THIS IS YOUR AUTH
 * BOUNDARY — wire it to your session (NextAuth, Clerk, your own cookie…).
 *
 * Return a tenant id (tnt_…) to scope reads to that tenant, or null if your
 * account is single-tenant. Throw or return a Response to reject.
 */
async function resolveTenantId(_req: NextRequest): Promise<string | null> {
  // TODO: replace with your session lookup, e.g.:
  //   const session = await auth();
  //   if (!session) throw new Response(null, { status: 401 });
  //   return session.organization.handsetTenantId;
  return null;
}

/** method + exact path (or prefix for /:id routes) the proxy will forward. */
const ALLOWED: { method: string; match: (path: string) => boolean }[] = [
  { method: "GET", match: (p) => p === "conversations" },
  { method: "GET", match: (p) => /^conversations\/[\w]+$/.test(p) },
  { method: "GET", match: (p) => p === "messages" },
  { method: "POST", match: (p) => p === "messages" },
  { method: "GET", match: (p) => p === "voicemails" },
  { method: "GET", match: (p) => /^voicemails\/[\w]+$/.test(p) },
  { method: "GET", match: (p) => p === "calls" },
  { method: "GET", match: (p) => /^calls\/[\w]+$/.test(p) },
  { method: "GET", match: (p) => /^calls\/[\w]+\/transcript$/.test(p) },
  // Consider validating body.connect_to against the signed-in agent's own
  // number before forwarding, so users can't ring arbitrary phones.
  { method: "POST", match: (p) => p === "calls" },
  { method: "GET", match: (p) => p === "phone_numbers/available" },
  { method: "GET", match: (p) => /^phone_numbers\/[\w]+$/.test(p) },
  // Buying a number bills your account — gate this behind an admin check
  // in resolveTenantId (or remove it) if end users shouldn't self-serve.
  { method: "POST", match: (p) => p === "phone_numbers" },
  { method: "GET", match: (p) => /^port_ins\/[\w]+$/.test(p) },
  { method: "GET", match: (p) => p === "usage" },
];

async function proxy(req: NextRequest, params: Promise<{ handset: string[] }>) {
  const apiKey = process.env.HANDSET_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: { code: "server_misconfigured", message: "HANDSET_API_KEY is not set" } },
      { status: 500 },
    );
  }

  const { handset } = await params;
  const path = handset.join("/");
  if (!ALLOWED.some((rule) => rule.method === req.method && rule.match(path))) {
    return NextResponse.json(
      { error: { code: "not_allowed", message: `${req.method} /${path} is not exposed by this proxy` } },
      { status: 404 },
    );
  }

  let tenantId: string | null;
  try {
    tenantId = await resolveTenantId(req);
  } catch (rejection) {
    if (rejection instanceof Response) return rejection;
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Could not resolve tenant" } },
      { status: 401 },
    );
  }

  const url = new URL(`${HANDSET_API}/${path}`);
  req.nextUrl.searchParams.forEach((value, key) => {
    if (key !== "tenant_id") url.searchParams.set(key, value);
  });
  // Server-resolved tenant always wins over anything the browser sent.
  if (tenantId && req.method === "GET") url.searchParams.set("tenant_id", tenantId);

  const upstream = await fetch(url.toString(), {
    method: req.method,
    headers: {
      authorization: `Bearer ${apiKey}`,
      ...(req.method === "POST" ? { "content-type": "application/json" } : {}),
      ...(req.headers.get("idempotency-key")
        ? { "idempotency-key": req.headers.get("idempotency-key")! }
        : {}),
    },
    body: req.method === "POST" ? await req.text() : undefined,
    cache: "no-store",
  });

  const body = await upstream.text();
  return new NextResponse(body, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
  });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ handset: string[] }> }) {
  return proxy(req, ctx.params);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ handset: string[] }> }) {
  return proxy(req, ctx.params);
}
