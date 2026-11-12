"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "../auth";
import { hasRole, isAdminRole } from "./roles";

type Role = "admin" | "user";

/** Reads the better-auth session for the current request. */
const readSession = async () => {
  try {
    return await auth.api.getSession({
      headers: await headers(),
    });
  } catch {
    return null;
  }
};

/** The signed-in user, or null when the request has no session. */
export const getUserSession = async () => {
  const session = await readSession();
  if (!session?.user) return null;
  return session.user;
};

/** The session token expected as a Bearer credential. */
export const getToken = async (): Promise<string | null> => {
  const session = await readSession();
  return session?.session?.token ?? null;
};

/**
 * Returns the current user if their approved roles contains `role`,
 * otherwise redirects.
 * If not authenticated -> redirects to /control-centre/login
 * If authenticated but lacking the required role -> redirects to /forbidden
 */
export const getRequiredRole = async (role: Role) => {
  const user = await getUserSession();

  if (!user) {
    redirect("/control-centre/login");
  }

  const hasAccess = role === "admin" ? isAdminRole(user) : hasRole(user, role);

  if (!hasAccess) {
    redirect("/forbidden");
  }

  return user;
};

