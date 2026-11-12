/**
 * Role helpers shared by server actions, layouts and middlewares.
 * Follows the multi-role model from Sparq-Electronic-store.
 */

export type RoleCarrier = {
  role?: string | null;
  activeRole?: string | null;
  roles?: string[] | string | null;
} | null | undefined;

/** The user's active role, lowercased, or "" when unknown. */
export function roleOf(user: RoleCarrier): string {
  return ((user as any)?.activeRole || user?.role || "").toLowerCase();
}

/**
 * Normalises the approved-roles field into a lowercase, de-duplicated list.
 */
export function rolesOf(user: RoleCarrier): string[] {
  const raw = (user as any)?.roles;
  const list: unknown[] = Array.isArray(raw)
    ? raw
    : typeof raw === "string" && raw.length > 0
      ? raw.split(",")
      : [user?.role, (user as any)?.activeRole];

  const seen = new Set<string>();
  for (const entry of list) {
    const value = typeof entry === "string" ? entry.toLowerCase().trim() : "";
    if (value) seen.add(value);
  }
  return Array.from(seen);
}

/**
 * Admin check. True when the account holds 'admin' or 'demoadmin' in its roles.
 */
export function isAdminRole(user: RoleCarrier): boolean {
  const pool = rolesOf(user);
  if (pool.length > 0) return pool.includes("admin") || pool.includes("demoadmin");
  const role = roleOf(user);
  return role === "admin" || role === "demoadmin";
}

/**
 * True when the account holds `wanted` anywhere in its approved array.
 */
export function hasRole(user: RoleCarrier, wanted: string): boolean {
  const needle = wanted.toLowerCase();
  const pool = rolesOf(user);
  if (pool.length > 0) return pool.includes(needle);
  return roleOf(user) === needle;
}

