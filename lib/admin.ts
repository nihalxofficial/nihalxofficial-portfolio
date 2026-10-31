import { API_URL, type Envelope } from "./api";
import { getFirebaseAuth } from "./firebase";

/**
 * Authenticated client for the `/api/v1/admin/*` endpoints.
 *
 * Every request carries the Firebase ID token, which the API verifies before
 * checking the UID allowlist — the dashboard never decides who is an admin.
 */

export type FieldKind =
  | "string"
  | "text"
  | "slug"
  | "url"
  | "list"
  | "boolean"
  | "number"
  | "enum"
  | "date"
  | "object"
  | "objectList";

export interface FieldDef {
  name: string;
  kind: FieldKind;
  required?: boolean;
  options?: readonly string[];
  children?: readonly FieldDef[];
  max?: number;
}

export interface ContentType {
  key: string;
  label: string;
  singleton: boolean;
  titleField: string;
  fields: FieldDef[];
}

export type EntityRecord = Record<string, unknown> & { _id: string };

export interface FieldError {
  field: string;
  message: string;
}

export class AdminApiError extends Error {
  readonly status: number;
  readonly fields: FieldError[];

  constructor(message: string, status: number, fields: FieldError[] = []) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

async function idToken(): Promise<string> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new AdminApiError("Not signed in", 401);
  return user.getIdToken();
}

/** Parses the API envelope, converting failures into AdminApiError. */
async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<{ data: T; meta?: Envelope<T>["meta"]; message: string }> {
  const token = await idToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  const body = (await response.json().catch(() => null)) as
    | (Envelope<T> & { errors?: FieldError[] })
    | null;

  if (!response.ok || !body?.success) {
    throw new AdminApiError(
      body?.message ?? `Request failed with status ${response.status}`,
      response.status,
      body?.errors ?? [],
    );
  }

  return { data: body.data, meta: body.meta, message: body.message };
}

export interface AdminSession {
  uid: string;
  email: string | null;
  name: string | null;
  firebaseConfigured: boolean;
  adminCount: number;
}

export async function verifySession(): Promise<AdminSession> {
  const { data } = await request<AdminSession>("/auth/session", { method: "GET" });
  return data;
}

/**
 * Identity of the signed-in Firebase account, *without* the allowlist check.
 *
 * Used only to explain a rejected sign-in ("your UID is …"), so a fresh
 * registration can be pointed at ADMIN_UIDS instead of a generic error.
 */
export interface AuthStatus {
  uid: string;
  email: string | null;
  name: string | null;
  isAdmin: boolean;
  firebaseConfigured: boolean;
  adminCount: number;
}

export async function fetchAuthStatus(): Promise<AuthStatus> {
  const { data } = await request<AuthStatus>("/auth/status", { method: "GET" });
  return data;
}

export async function fetchContentTypes(): Promise<ContentType[]> {
  const { data } = await request<ContentType[]>("/admin/content/describe", { method: "GET" });
  return data;
}

export async function fetchOverview() {
  const { data } = await request<Overview>("/admin/overview", { method: "GET" });
  return data;
}

export interface Overview {
  counts: {
    projects: number;
    publishedProjects: number;
    featuredProjects: number;
    posts: number;
    publishedPosts: number;
    skills: number;
    messages: number;
    unreadMessages: number;
    media: number;
    mediaBytes: number;
  };
  recentProjects: Array<{ _id: string; title: string; slug: string; updatedAt?: string }>;
  recentMessages: Array<{
    _id: string;
    name: string;
    email: string;
    subject?: string;
    status: string;
    createdAt?: string;
  }>;
  siteName: string | null;
}

export interface ListResult {
  items: EntityRecord[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export async function listContent(
  entity: string,
  options: { page?: number; limit?: number; q?: string } = {},
): Promise<ListResult> {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));
  if (options.q) params.set("q", options.q);

  const query = params.toString();
  const { data, meta } = await request<EntityRecord[]>(
    `/admin/content/${entity}${query ? `?${query}` : ""}`,
    { method: "GET" },
  );

  return {
    items: data,
    meta: meta ?? { page: 1, limit: data.length, total: data.length, totalPages: 1 },
  };
}

export async function readContent(entity: string, id: string): Promise<EntityRecord> {
  const { data } = await request<EntityRecord>(`/admin/content/${entity}/${id}`, { method: "GET" });
  return data;
}

export async function createContent(
  entity: string,
  payload: Record<string, unknown>,
): Promise<EntityRecord> {
  const { data } = await request<EntityRecord>(`/admin/content/${entity}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data;
}

export async function updateContent(
  entity: string,
  id: string,
  payload: Record<string, unknown>,
): Promise<EntityRecord> {
  const { data } = await request<EntityRecord>(`/admin/content/${entity}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return data;
}

export async function deleteContent(entity: string, id: string): Promise<void> {
  await request<unknown>(`/admin/content/${entity}/${id}`, { method: "DELETE" });
}

/** Dashboard form autofill — same Gemini key as the public assistant. */
export interface FormFillResult {
  entity: string;
  fields: Record<string, unknown>;
  missingRequired: string[];
  model: string;
}

export async function fillFormWithAi(input: {
  entity: string;
  notes: string;
  current?: Record<string, unknown>;
}): Promise<FormFillResult> {
  const { data } = await request<FormFillResult>("/admin/ai/form-fill", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: "unread" | "read" | "replied" | "archived";
  location?: string;
  emailDelivered?: boolean;
  createdAt?: string;
}

export async function listMessages(options: { page?: number; status?: string; search?: string } = {}) {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.status) params.set("status", options.status);
  if (options.search) params.set("search", options.search);

  const query = params.toString();
  const { data, meta } = await request<ContactMessage[]>(
    `/admin/messages${query ? `?${query}` : ""}`,
    { method: "GET" },
  );

  return {
    items: data,
    meta: meta ?? { page: 1, limit: data.length, total: data.length, totalPages: 1 },
  };
}

export async function updateMessageStatus(id: string, status: ContactMessage["status"]) {
  await request<unknown>(`/admin/messages/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deleteMessage(id: string) {
  await request<unknown>(`/admin/messages/${id}`, { method: "DELETE" });
}

export interface MediaAsset {
  _id: string;
  name: string;
  url: string;
  displayUrl?: string;
  thumbnailUrl?: string;
  mimeType?: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  folder?: string;
  createdAt?: string;
}

export async function listMedia(page = 1, search?: string) {
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.set("search", search);

  const { data, meta } = await request<MediaAsset[]>(`/admin/media?${params.toString()}`, {
    method: "GET",
  });

  return {
    items: data,
    meta: meta ?? { page: 1, limit: data.length, total: data.length, totalPages: 1 },
  };
}

/** `image` accepts a raw base64 string or a full `data:image/...;base64,` uri. */
export async function uploadMedia(input: {
  image: string;
  name?: string;
  mimeType?: string;
  folder?: string;
}) {
  const { data } = await request<MediaAsset>("/admin/media", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data;
}

export async function uploadMediaFromUrl(url: string, name?: string) {
  const { data } = await request<MediaAsset>("/admin/media/from-url", {
    method: "POST",
    body: JSON.stringify({ url, name }),
  });
  return data;
}

export async function deleteMedia(id: string) {
  await request<unknown>(`/admin/media/${id}`, { method: "DELETE" });
}

/** `shortDescription` → `Short description`, for auto-generated form labels. */
export function humanize(name: string): string {
  const spaced = name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();

  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}
