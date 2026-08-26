/**
 * Handset proxy routes for Remix / React Router.
 *
 * Your Handset API key stays on the server; the Handset UI components in the
 * browser call this resource route instead. Only the endpoints the
 * components need are exposed, and every request is scoped to the tenant you
 * resolve from your own session below.
 *
 * The file lands at app/routes/api.handset.$.ts, which serves /api/handset/*
 * — the default base path the components use. Uses only the Web
 * Request/Response API, so it works unchanged on Remix v2 and React
 * Router 7.
 *
 * Required env: HANDSET_API_KEY (test or live secret key).
 */

const HANDSET_API = process.env.HANDSET_API_URL ?? "https://api.handset.dev/v1";

type RouteArgs = {
  request: Request;
  params: { "*"?: string };
};

/**
 * Resolve which tenant the signed-in user belongs to. THIS IS YOUR AUTH
 * BOUNDARY — wire it to your session (remix-auth, your own cookie session…).
 *
 * Return a tenant id (tnt_…) to scope reads to that tenant, or null if your
 * account is single-tenant. Throw a Response to reject.
 */
async function resolveTenantId(_request: Request): Promise<string | null> {
  // TODO: replace with your session lookup, e.g.:
  //   const session = await getSession(request.headers.get("Cookie"));
  //   if (!session.has("userId")) throw new Response(null, { status: 401 });
  //   return session.get("handsetTenantId");
  return null;
}

/** method + exact path (or pattern for /:id routes) the proxy will forward. */
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
  // Agent assist: turn on live transcription mid-call.
  { method: "POST", match: (p) => /^calls\/[\w]+\/transcription$/.test(p) },
  // Realtime: mint short-lived event-stream tokens for the browser.
  { method: "POST", match: (p) => p === "realtime/tokens" },
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
  // 10DLC compliance: register brands & campaigns and read their approval
  // status. Registration bills/commits your account — gate these behind an
  // admin check in resolveTenantId if end users shouldn't self-register.
  { method: "POST", match: (p) => p === "brands" },
  { method: "GET", match: (p) => p === "brands" },
  { method: "GET", match: (p) => /^brands\/[\w]+$/.test(p) },
  { method: "POST", match: (p) => p === "campaigns" },
  { method: "GET", match: (p) => p === "campaigns" },
  { method: "GET", match: (p) => /^campaigns\/[\w]+$/.test(p) },
  // E911 emergency addresses for a tenant's numbers.
  { method: "POST", match: (p) => p === "e911_addresses" },
  { method: "GET", match: (p) => p === "e911_addresses" },
  // Softphone login tokens. Resolve WHICH web client belongs to the
  // signed-in agent in your session logic — don't let users mint tokens
  // for someone else's seat.
  { method: "POST", match: (p) => /^web_clients\/[\w]+\/tokens$/.test(p) },
];

function json(status: number, code: string, message: string): Response {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function proxy({ request, params }: RouteArgs): Promise<Response> {
  const apiKey = process.env.HANDSET_API_KEY;
  if (!apiKey) {
    return json(500, "server_misconfigured", "HANDSET_API_KEY is not set");
  }

  const path = params["*"] ?? "";
  if (!ALLOWED.some((rule) => rule.method === request.method && rule.match(path))) {
    return json(404, "not_allowed", `${request.method} /${path} is not exposed by this proxy`);
  }

  let tenantId: string | null;
  try {
    tenantId = await resolveTenantId(request);
  } catch (rejection) {
    if (rejection instanceof Response) return rejection;
    return json(401, "unauthorized", "Could not resolve tenant");
  }

  const url = new URL(`${HANDSET_API}/${path}`);
  new URL(request.url).searchParams.forEach((value, key) => {
    if (key !== "tenant_id") url.searchParams.set(key, value);
  });
  // Server-resolved tenant always wins over anything the browser sent.
  if (tenantId && request.method === "GET") url.searchParams.set("tenant_id", tenantId);

  const idempotencyKey = request.headers.get("idempotency-key");
  const upstream = await fetch(url.toString(), {
    method: request.method,
    headers: {
      authorization: `Bearer ${apiKey}`,
      ...(request.method === "POST" ? { "content-type": "application/json" } : {}),
      ...(idempotencyKey ? { "idempotency-key": idempotencyKey } : {}),
    },
    body: request.method === "POST" ? await request.text() : undefined,
  });

  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
  });
}

/** GET requests (reads). */
export async function loader(args: RouteArgs): Promise<Response> {
  return proxy(args);
}

/** POST requests (sends, calls, tokens). */
export async function action(args: RouteArgs): Promise<Response> {
  return proxy(args);
}
