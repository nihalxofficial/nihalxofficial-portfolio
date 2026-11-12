/**
 * Role helpers for single role checking.
 */

export type RoleCarrier = {
  role?: string | null;
} | null | undefined;

/** The user's role, lowercased, or "" when unknown. */
export function roleOf(user: RoleCarrier): string {
  return (user?.role || "").toLowerCase();
}

/** Admin check. True when the account role is 'admin' or 'demoadmin'. */
export function isAdminRole(user: RoleCarrier): boolean {
  const role = roleOf(user);
  return role === "admin" || role === "demoadmin";
}

/** True when the account role matches `wanted`. */
export function hasRole(user: RoleCarrier, wanted: string): boolean {
  return roleOf(user) === wanted.toLowerCase();
}
