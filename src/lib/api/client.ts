/**
 * API client. All data flows through here.
 *
 * Mock mode (current): served from src/lib/mock/db.ts, shaped exactly like
 * the frozen LLD-B contracts. Real mode: flip USE_REAL_API to true and the
 * same functions hit the gateway — only BASE_URL needs to change.
 */

const USE_REAL_API = process.env.NEXT_PUBLIC_USE_REAL_API === "true";
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1";

interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  trace_id?: string;
}

export class ContractError extends Error {
  constructor(public problem: ApiError) {
    super(problem.detail);
    this.name = "ContractError";
  }
}

/** Methods that write a decision or spend model tokens — the frozen contract
 * requires an Idempotency-Key on every one, so a double tap on hotel wifi
 * cannot produce two scoring runs or two calibration entries. */
const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function newIdempotencyKey(): string {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
    return cryptoObj.randomUUID();
  }
  // Non-secure context fallback (contract only requires minLength 8).
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  if (WRITE_METHODS.has(method) && !headers.has("Idempotency-Key")) {
    headers.set("Idempotency-Key", newIdempotencyKey());
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    method,
    headers,
  });

  if (!res.ok) {
    const problem = (await res.json().catch(() => ({}))) as Partial<ApiError>;
    throw new ContractError({
      type: problem.type ?? "about:blank",
      title: problem.title ?? "Request failed",
      status: res.status,
      detail: problem.detail ?? `HTTP ${res.status}`,
      instance: problem.instance,
      trace_id: problem.trace_id,
    });
  }
  return res.json() as Promise<T>;
}

export const http = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
};

export const isRealApi = (): boolean => USE_REAL_API;
