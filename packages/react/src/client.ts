import type { ApiError } from "./types";

export interface HandsetClientOptions {
  /**
   * Base URL of YOUR backend's Handset proxy routes (not api.handset.dev).
   * Defaults to `/api/handset`. Your server holds the API key and scopes
   * requests to the signed-in user's tenant.
   */
  baseUrl?: string;
  /** Extra headers sent with every request (e.g. a CSRF token). */
  headers?: Record<string, string>;
  /** Custom fetch, for testing or frameworks that wrap fetch. */
  fetch?: typeof globalThis.fetch;
}

export class HandsetRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly docsUrl?: string;

  constructor(status: number, body: Partial<ApiError>) {
    super(body.message ?? `Request failed with status ${status}`);
    this.name = "HandsetRequestError";
    this.status = status;
    this.code = body.code ?? "unknown";
    this.docsUrl = body.docs_url;
  }
}

export class HandsetClient {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;
  private readonly fetchImpl: typeof globalThis.fetch;

  constructor(options: HandsetClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "/api/handset").replace(/\/$/, "");
    this.headers = options.headers ?? {};
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
  }

  async request<T>(
    method: "GET" | "POST" | "PATCH" | "DELETE",
    path: string,
    init: {
      query?: Record<string, string | number | undefined>;
      body?: unknown;
      headers?: Record<string, string>;
      signal?: AbortSignal;
    } = {},
  ): Promise<T> {
    const url = new URL(this.baseUrl + path, typeof window === "undefined" ? "http://localhost" : window.location.origin);
    for (const [k, v] of Object.entries(init.query ?? {})) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
    const res = await this.fetchImpl(url.toString(), {
      method,
      headers: {
        ...(init.body !== undefined ? { "content-type": "application/json" } : {}),
        ...this.headers,
        ...init.headers,
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      signal: init.signal,
    });
    if (!res.ok) {
      let parsed: Partial<ApiError> = {};
      try {
        const json = (await res.json()) as { error?: ApiError };
        parsed = json.error ?? (json as Partial<ApiError>);
      } catch {
        // non-JSON error body; fall through with status only
      }
      throw new HandsetRequestError(res.status, parsed);
    }
    return (await res.json()) as T;
  }
}
