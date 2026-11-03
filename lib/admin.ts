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

export interface MessageReply {
  _id?: string;
  to: string;
  subject: string;
  body: string;
  delivered?: boolean;
  sentAt?: string;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: "unread" | "read" | "replied" | "archived";
  location?: string;
  userAgent?: string;
  emailDelivered?: boolean;
  replies?: MessageReply[];
  createdAt?: string;
  updatedAt?: string;
}

export type MessageSort =
  | "newest"
  | "oldest"
  | "name"
  | "email"
  | "subject"
  | "status"
  | "updated";

export interface MessageListOptions {
  page?: number;
  limit?: number;
  status?: ContactMessage["status"] | "all";
  search?: string;
  sort?: MessageSort;
  dir?: "asc" | "desc";
  delivery?: "delivered" | "failed" | "all";
  from?: string;
  to?: string;
}

export async function listMessages(options: MessageListOptions = {}) {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));
  if (options.status && options.status !== "all") params.set("status", options.status);
  if (options.search) params.set("search", options.search);
  if (options.sort && options.sort !== "newest") params.set("sort", options.sort);
  if (options.sort && options.dir) params.set("dir", options.dir);
  if (options.delivery && options.delivery !== "all") params.set("delivery", options.delivery);
  if (options.from) params.set("from", options.from);
  if (options.to) params.set("to", options.to);

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

/** Full document including the reply thread; marks an unread message as read. */
export async function getMessage(id: string): Promise<ContactMessage> {
  const { data } = await request<ContactMessage>(`/admin/messages/${id}`, { method: "GET" });
  return data;
}

export async function replyToMessage(input: {
  id: string;
  to: string;
  subject: string;
  body: string;
  ccOwner: boolean;
}): Promise<{ replies: MessageReply[]; status: ContactMessage["status"] }> {
  const { data } = await request<{
    replies: MessageReply[];
    status: ContactMessage["status"];
  }>(`/admin/messages/${input.id}/reply`, {
    method: "POST",
    body: JSON.stringify({
      to: input.to,
      subject: input.subject,
      body: input.body,
      ccOwner: input.ccOwner,
    }),
  });
  return data;
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

/** Mirrors the server `AnalyticsOverview` shape (portfolio-server analytics.service). */
export interface AnalyticsOverview {
  range: { days: number; from: string };
  totals: {
    pageViews: number;
    sessions: number;
    uniqueVisitors: number;
    onlineNow: number;
    avgDurationMs: number;
    bounceRate: number;
  };
  timeline: Array<{ bucket: string; pageViews: number; sessions: number }>;
  topPages: Array<{ path: string; views: number }>;
  sources: Array<{ source: string; views: number }>;
  browsers: Array<{ name: string; count: number }>;
  oses: Array<{ name: string; count: number }>;
  devices: Array<{ name: string; count: number }>;
  countries: Array<{ country: string; code: string; lat?: number; lng?: number; count: number }>;
  newVsReturning: { newVisitors: number; returningVisitors: number };
  recent: Array<{
    path: string;
    city: string;
    country: string;
    browser: string;
    device: string;
    at: string;
  }>;
}

export async function fetchAnalyticsOverview(days = 7): Promise<AnalyticsOverview> {
  const { data } = await request<AnalyticsOverview>(`/admin/analytics/overview?days=${days}`, {
    method: "GET",
  });
  return data;
}

/** Mirrors the server `AnalyticsRealtime` shape; polled client-side (no WebSockets). */
export interface AnalyticsRealtime {
  onlineNow: number;
  pages: Array<{ path: string; count: number }>;
  countries: Array<{ country: string; code: string; lat?: number; lng?: number; count: number }>;
  events: Array<{
    path: string;
    city: string;
    country: string;
    browser: string;
    device: string;
    at: string;
  }>;
}

export async function fetchAnalyticsRealtime(): Promise<AnalyticsRealtime> {
  const { data } = await request<AnalyticsRealtime>("/admin/analytics/realtime", { method: "GET" });
  return data;
}

/** Per-project engagement metrics; mirrors the server `ProjectPerformanceMetric`. */
export interface ProjectPerformanceMetric {
  slug: string;
  title: string;
  thumbnailUrl: string;
  category: string;
  views: number;
  uniqueVisitors: number;
  clicks: number;
  totalDurationMs: number;
  avgDurationSec: number;
  ctr: number;
}

/** Mirrors the server `ProjectAnalyticsOverview` shape (analytics.service). */
export interface ProjectAnalyticsOverview {
  range: { days: number; from: string };
  totals: {
    totalProjectViews: number;
    totalProjectClicks: number;
    totalUniqueVisitors: number;
    avgEngagementDurationSec: number;
  };
  mostViewedProject: ProjectPerformanceMetric | null;
  mostEngagedProject: ProjectPerformanceMetric | null;
  projects: ProjectPerformanceMetric[];
  viewsComparison: Array<{ title: string; slug: string; views: number; clicks: number }>;
  /** One row per time bucket; `bucket` plus a `<slug>: views` entry each. */
  timeline: Array<Record<string, string | number>>;
}

export async function fetchProjectAnalytics(days = 30): Promise<ProjectAnalyticsOverview> {
  const { data } = await request<ProjectAnalyticsOverview>(
    `/admin/analytics/projects?days=${days}`,
    { method: "GET" },
  );
  return data;
}

/** `shortDescription` → `Short description`, for auto-generated form labels. */
export function humanize(name: string): string {
  const spaced = name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();

  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}
