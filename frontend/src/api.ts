// On GitHub Pages there is no same-origin backend, so API calls fail
// gracefully (pages show a retryable error box). Point VITE_API_BASE at a
// live backend URL to make the Pages demo fully functional.
const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "/api/v1";
let csrfToken = "";
export function setCsrf(value: string) {
  csrfToken = value;
}
export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
export async function api<T = Record<string, unknown>>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const method = options.method || "GET";
  const isForm = options.body instanceof FormData;
  const response = await fetch(API_BASE + path, {
    ...options,
    credentials: "include",
    headers: {
      ...(!isForm ? { "Content-Type": "application/json" } : {}),
      ...(method !== "GET" && csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({
    detail: "The service returned an unreadable response. Please retry.",
  }));
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("/auth/"))
      window.dispatchEvent(new Event("kutumb-session-expired"));
    const message = Array.isArray(data.detail)
      ? data.detail
          .map(
            (e: { loc: string[]; msg: string }) =>
              `${e.loc.slice(1).join(".")}: ${e.msg}`,
          )
          .join("; ")
      : data.detail || "The service is unavailable. Please try again.";
    throw new ApiError(message, response.status, data.code);
  }
  return data as T;
}
export const send = <T = Record<string, unknown>>(
  path: string,
  body: unknown,
  method = "POST",
  key?: string,
) =>
  api<T>(path, {
    method,
    body: JSON.stringify(body),
    headers: key ? { "Idempotency-Key": key } : {},
  });
export interface List<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}
export interface Member {
  id: string;
  client_id?: string;
  public_id?: string;
  name: string;
  name_gu?: string;
  dob: string;
  relationship: string;
  status?: string;
  joined_at?: string;
}
export interface Address {
  address_line: string;
  locality: string;
  taluka: string;
  district: string;
  pincode: string;
}
export interface Family {
  id: string;
  public_id: string;
  status: string;
  revision: number;
  address: Address;
  representative_id: string;
  members: Member[];
  updated_at: string;
}
export interface Application {
  id: string;
  reference: string | null;
  kind: string;
  branch: string;
  status: string;
  revision: number;
  step: number;
  district: string;
  payload: Record<string, unknown>;
  family_id?: string;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  events: {
    id: string;
    from_status: string;
    to_status: string;
    action: string;
    reason: string;
    actor_role: string;
    created_at: string;
  }[];
}
export interface Scheme {
  id: string;
  slug: string;
  name: string;
  name_gu: string;
  category: string;
  department: string;
  summary: string;
  summary_gu: string;
  benefit_type: string;
  eligibility: string | string[];
  documents: string | string[];
  application_url?: string;
  source_url: string;
  status: string;
  capability: string;
  updated_at: string;
  revision?: number;
}
