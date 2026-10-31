import type {
  BlogPost,
  Portfolio,
  Project,
  SiteSettings,
} from "./types";

/**
 * Read-only access to the public API.
 *
 * Every call is server-side: the public site is rendered on the server, so the
 * browser never needs to know the API origin and the backend can stay private
 * in a Docker network.
 */

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1"
).replace(/\/$/, "");

export interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

export class ApiRequestError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiGet<T>(path: string, revalidate = 60): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate },
    });
  } catch {
    throw new ApiRequestError("The API is unreachable. Is portfolio-server running?", 503);
  }

  const payload = (await response.json().catch(() => null)) as Envelope<T> | null;

  if (!response.ok || !payload?.success) {
    throw new ApiRequestError(
      payload?.message ?? `Request failed with status ${response.status}`,
      response.status,
    );
  }

  return payload.data;
}

/** Never throws: the marketing site should degrade, not crash, if the API is down. */
export async function getPortfolio(): Promise<Portfolio | null> {
  try {
    return await apiGet<Portfolio>("/portfolio", 30);
  } catch {
    return null;
  }
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const portfolio = await apiGet<Portfolio>("/portfolio", 60);
    return portfolio.settings ?? null;
  } catch {
    return null;
  }
}

export async function getProject(slug: string) {
  try {
    return await apiGet<{ project: Project; related: Project[] }>(
      `/portfolio/projects/${encodeURIComponent(slug)}`,
      60,
    );
  } catch {
    return null;
  }
}

export async function getPost(slug: string) {
  try {
    return await apiGet<{ post: BlogPost; related: BlogPost[] }>(
      `/portfolio/posts/${encodeURIComponent(slug)}`,
      60,
    );
  } catch {
    return null;
  }
}

export interface ContactPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

/** Used by the contact form from the browser. */
export async function sendContactMessage(payload: ContactPayload) {
  const response = await fetch(`${API_URL}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => null)) as
    | (Envelope<unknown> & { errors?: Array<{ field: string; message: string }> })
    | null;

  if (!response.ok || !body?.success) {
    const detail = body?.errors?.[0]?.message;
    throw new ApiRequestError(detail ?? body?.message ?? "Message could not be sent", response.status);
  }

  return body;
}
