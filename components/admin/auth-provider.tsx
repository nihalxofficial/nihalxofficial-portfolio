"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authClient } from "@/lib/auth-client";
import { type AdminSession } from "@/lib/admin";
import { isAdminRole } from "@/lib/core/roles";

export type SocialProvider = "google" | "github";

export interface AuthUser {
  id: string;
  uid?: string;
  email: string;
  name: string;
  displayName?: string;
  image?: string | null;
  role?: string;
  emailVerified?: boolean;
  providerData?: Array<{ providerId: string }>;
}

interface AuthState {
  user: AuthUser | null;
  session: AdminSession | null;
  loading: boolean;
  signingIn: boolean;
  error: string;
  configError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  signInWith: (provider: SocialProvider) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: sessionData, isPending } = authClient.useSession();

  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState("");

  const user = useMemo<AuthUser | null>(() => {
    if (!sessionData?.user) return null;
    const u = sessionData.user as any;
    return {
      id: u.id,
      uid: u.id,
      email: u.email,
      name: u.name,
      displayName: u.name,
      image: u.image,
      role: u.role,
      emailVerified: true,
      providerData: [{ providerId: "better-auth" }],
    };
  }, [sessionData]);

  const session = useMemo<AdminSession | null>(() => {
    if (!user) return null;
    const isAdmin = isAdminRole(user);
    if (!isAdmin) return null;

    return {
      uid: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      adminCount: 1,
    };
  }, [user]);

  useEffect(() => {
    if (!isPending && user && !isAdminRole(user)) {
      setError("This account does not have admin clearance. Contact the administrator.");
    }
  }, [isPending, user]);

  const signIn = useCallback(async (email: string, password: string) => {
    setSigningIn(true);
    setError("");
    try {
      const res = await authClient.signIn.email({
        email: email.trim(),
        password,
      });
      if (res?.error) {
        setError(res.error.message || "Failed to sign in. Please verify your credentials.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setSigningIn(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setSigningIn(true);
    setError("");
    try {
      const res = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      if (res?.error) {
        setError(res.error.message || "Registration failed.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSigningIn(false);
    }
  }, []);

  const signInWith = useCallback(async (provider: SocialProvider) => {
    setSigningIn(true);
    setError("");
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/control-centre",
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "OAuth sign-in failed");
      setSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      localStorage.removeItem("pf_is_admin");
    } catch {}
    await authClient.signOut();
  }, []);

  const clearError = useCallback(() => setError(""), []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      session,
      loading: isPending,
      signingIn,
      error,
      configError: null,
      signIn,
      register,
      signInWith,
      signOut,
      clearError,
    }),
    [user, session, isPending, signingIn, error, signIn, register, signInWith, signOut, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
