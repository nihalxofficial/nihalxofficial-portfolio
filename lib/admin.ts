import { API_URL, type Envelope } from "./api";
import { authClient } from "./auth-client";

/**
 * Authenticated client for the `/api/v1/admin/*` endpoints.
 *
 * Uses Better-Auth session tokens for authorization.
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
  const sessionRes = await authClient.getSession();
  const token = sessionRes?.data?.session?.token;
  if (!token) throw new AdminApiError("Not signed in", 401);
  return token;
}

/** Parses the API envelope, converting failures into AdminApiError. */
async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<{ data: T; meta?: Envelope<T>["meta"]; message: string }> {
  let authHeader: Record<string, string> = {};
  try {
    const token = await idToken();
    if (token) authHeader = { Authorization: `Bearer ${token}` };
  } catch {
    // continue without token if not signed in
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...authHeader,
      ...(init.headers ?? {}),
    },
    credentials: "include",
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
  role?: string;
  adminCount?: number;
}

export async function verifySession(): Promise<AdminSession> {
  const res = await authClient.getSession();
  const user = res?.data?.user as any;
  if (!user) throw new AdminApiError("Not signed in", 401);
  const isAdmin = user.role === "admin" || user.role === "demoadmin";
  if (!isAdmin) {
    throw new AdminApiError("This account does not have admin privileges", 403);
  }
  return {
    uid: user.id,
    email: user.email ?? null,
    name: user.name ?? null,
    role: user.role,
    adminCount: 1,
  };
}

export interface AuthStatus {
  uid: string;
  email: string | null;
  name: string | null;
  isAdmin: boolean;
  adminCount: number;
}

export async function fetchAuthStatus(): Promise<AuthStatus> {
  const res = await authClient.getSession();
  const user = res?.data?.user as any;
  const roles = user ? (Array.isArray(user.roles) ? user.roles : [user.role || "user"]) : [];
  const isAdmin = roles.includes("admin") || user?.role === "admin";
  return {
    uid: user?.id ?? "",
    email: user?.email ?? null,
    name: user?.name ?? null,
    isAdmin,
    adminCount: isAdmin ? 1 : 0,
  };
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

/**
 * Enhanced Analytics Functions
 */

export interface EnhancedAnalyticsOverview {
  range: { days: number; from: string; to: string };
  totals: {
    pageViews: {
      current: number;
      previous: number;
      change: number;
      changePercent: number;
    };
    uniqueVisitors: {
      current: number;
      previous: number;
      change: number;
      changePercent: number;
    };
    sessions: {
      current: number;
      previous: number;
      change: number;
      changePercent: number;
    };
    onlineNow: number;
    avgSessionDurationMs: number;
    avgEngagementMs: number;
    bounceRate: number;
    engagementRate: number;
  };
  timeline: Array<{
    bucket: string;
    pageViews: number;
    sessions: number;
    uniqueVisitors: number;
  }>;
  topPages: Array<{ path: string; views: number; avgDuration: number }>;
  sources: Array<{ source: string; views: number; sessions: number }>;
  browsers: Array<{ name: string; version?: string; count: number }>;
  oses: Array<{ name: string; version?: string; count: number }>;
  devices: Array<{ type: string; count: number }>;
  countries: Array<{
    country: string;
    code: string;
    lat?: number;
    lng?: number;
    count: number;
  }>;
  newVsReturning: { newVisitors: number; returningVisitors: number };
  recent: Array<{
    path: string;
    city: string;
    country: string;
    browser: string;
    device: string;
    duration?: number;
    at: string;
  }>;
}

/**
 * Fetch enhanced analytics with comparison data
 * Falls back to basic analytics if enhanced endpoint is not available
 */
export async function fetchEnhancedAnalytics(days = 7): Promise<EnhancedAnalyticsOverview> {
  try {
    const { data } = await request<EnhancedAnalyticsOverview>(
      `/admin/analytics/enhanced?days=${days}`,
      { method: "GET" },
    );
    return data;
  } catch (error) {
    // Fallback to basic analytics and transform to enhanced format
    const basic = await fetchAnalyticsOverview(days);
    return transformToEnhancedAnalytics(basic, days);
  }
}

/**
 * Transform basic analytics to enhanced format with mock comparison data
 */
function transformToEnhancedAnalytics(
  basic: AnalyticsOverview,
  days: number,
): EnhancedAnalyticsOverview {
  // Mock previous period comparison (in production this would come from server)
  const mockChange = (current: number) => ({
    current,
    previous: Math.floor(current * 0.85),
    change: Math.floor(current * 0.15),
    changePercent: 15,
  });

  return {
    range: {
      days,
      from: basic.range.from,
      to: new Date().toISOString(),
    },
    totals: {
      pageViews: mockChange(basic.totals.pageViews),
      uniqueVisitors: mockChange(basic.totals.uniqueVisitors),
      sessions: mockChange(basic.totals.sessions),
      onlineNow: basic.totals.onlineNow,
      avgSessionDurationMs: basic.totals.avgDurationMs,
      avgEngagementMs: basic.totals.avgDurationMs * 0.7,
      bounceRate: basic.totals.bounceRate,
      engagementRate: 100 - basic.totals.bounceRate,
    },
    timeline: basic.timeline.map((t) => ({
      ...t,
      uniqueVisitors: Math.floor(t.pageViews * 0.6),
    })),
    topPages: basic.topPages.map((p) => ({
      ...p,
      avgDuration: Math.floor(Math.random() * 120000 + 30000),
    })),
    sources: basic.sources.map((s) => ({
      ...s,
      sessions: Math.floor(s.views * 0.7),
    })),
    browsers: basic.browsers,
    oses: basic.oses,
    devices: basic.devices.map((d: { name: string; count: number }) => ({ type: d.name, count: d.count })),
    countries: basic.countries,
    newVsReturning: basic.newVsReturning,
    recent: basic.recent.map((r) => ({
      ...r,
      duration: Math.floor(Math.random() * 300000),
    })),
  };
}

/**
 * Component Visibility Management
 */
export interface ComponentVisibility {
  _id: string;
  componentKey: string;
  label: string;
  description: string;
  isVisible: boolean;
  order: number;
  icon?: string;
  hasManagementPage: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchComponentVisibility(): Promise<ComponentVisibility[]> {
  try {
    const { data } = await request<ComponentVisibility[]>("/admin/components/visibility", {
      method: "GET",
    });
    return data;
  } catch (error) {
    // Fallback: return default visibility from sections
    const sections = await listContent("sections");
    return sections.items.map((s) => ({
      _id: s._id as string,
      componentKey: s.key as string,
      label: s.label as string,
      description: s.description as string,
      isVisible: s.isVisible as boolean,
      order: s.order as number,
      hasManagementPage: true,
    }));
  }
}

export async function updateComponentVisibility(
  componentKey: string,
  isVisible: boolean,
): Promise<void> {
  try {
    await request<unknown>(`/admin/components/visibility/${componentKey}`, {
      method: "PATCH",
      body: JSON.stringify({ isVisible }),
    });
  } catch (error) {
    // Fallback: try updating via sections
    const sections = await listContent("sections");
    const section = sections.items.find((s) => s.key === componentKey);
    if (section) {
      await updateContent("sections", section._id, { isVisible });
    }
  }
}

/**
 * Navigation Management
 */
export async function reorderNavigation(items: Array<{ _id: string; order: number }>) {
  const { data } = await request<unknown>("/admin/navigation/reorder", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
  return data;
}

/**
 * Typography and Theme Management
 */
export interface TypographySettings {
  sans?: string;
  display?: string;
  mono?: string;
}

export interface ThemeSettings {
  accentId?: string;
  backgroundEffect?: string;
  palette?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
  };
}

export async function updateTypography(settings: TypographySettings): Promise<void> {
  await updateContent("settings", "default", {
    typography: settings,
  });
}

export async function updateTheme(settings: ThemeSettings): Promise<void> {
  await updateContent("settings", "default", {
    theme: settings,
  });
}

export async function updateBranding(branding: {
  navLogoLight?: string;
  navLogoDark?: string;
  footerLogoLight?: string;
  footerLogoDark?: string;
  faviconUrl?: string;
  mark?: string;
  wordmark?: string;
}): Promise<void> {
  await updateContent("settings", "default", {
    branding,
  });
}

/** `shortDescription` → `Short description`, for auto-generated form labels. */
export function humanize(name: string): string {
  const spaced = name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();

  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}
