"use client";

import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, type User } from "firebase/auth";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AdminApiError, verifySession, type AdminSession } from "@/lib/admin";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";

/**
 * Dashboard session.
 *
 * The browser signs in with Firebase, then asks the API to verify the ID token
 * against the ADMIN_UIDS allowlist. A valid Firebase account that is not on the
 * list is signed straight back out — authorization never happens client-side.
 */
interface AuthState {
  user: User | null;
  session: AdminSession | null;
  loading: boolean;
  signingIn: boolean;
  error: string;
  configError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const INVALID_CREDENTIALS = "Wrong email or password.";
const NOT_ALLOWLISTED =
  "This account is not an admin. Add its UID to ADMIN_UIDS on the server.";

function messageFor(error: unknown): string {
  if (error instanceof AdminApiError) {
    return error.status === 403 || error.status === 401 ? NOT_ALLOWLISTED : error.message;
  }

  const code = (error as { code?: string })?.code ?? "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return INVALID_CREDENTIALS;
    case "auth/too-many-requests":
      return "Too many attempts. Wait a minute and try again.";
    case "auth/operation-not-allowed":
      return "Email/password sign-in is disabled in the Firebase console.";
    case "auth/network-request-failed":
      return "Cannot reach Firebase. Check your connection.";
    default:
      return error instanceof Error ? error.message : "Sign-in failed.";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseConfigured();

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(configured);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!configured) return;

    const auth = getFirebaseAuth();

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        setSession(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      verifySession()
        .then((value) => {
          setSession(value);
          setError("");
        })
        .catch(async (cause: unknown) => {
          setSession(null);
          setError(messageFor(cause));
          await firebaseSignOut(auth).catch(() => undefined);
        })
        .finally(() => setLoading(false));
    });

    return unsubscribe;
  }, [configured]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!configured) {
        setError("Firebase web config is missing — see the setup note on this page.");
        return;
      }

      setSigningIn(true);
      setError("");

      try {
        await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
        // onAuthStateChanged finishes the allowlist check.
      } catch (cause) {
        setError(messageFor(cause));
      } finally {
        setSigningIn(false);
      }
    },
    [configured],
  );

  const signOut = useCallback(async () => {
    if (!configured) return;
    await firebaseSignOut(getFirebaseAuth()).catch(() => undefined);
    setSession(null);
    setUser(null);
  }, [configured]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      session,
      loading,
      signingIn,
      error,
      configError: configured
        ? null
        : "NEXT_PUBLIC_FIREBASE_API_KEY / APP_ID are empty. Copy them from the Firebase console → Project settings → Your apps → Web app config.",
      signIn,
      signOut,
    }),
    [user, session, loading, signingIn, error, configured, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
