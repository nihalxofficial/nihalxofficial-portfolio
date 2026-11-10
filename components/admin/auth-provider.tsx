"use client";

import {
  createUserWithEmailAndPassword,
  GithubAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type AuthProvider as FirebaseProvider,
  type User,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AdminApiError, fetchAuthStatus, verifySession, type AdminSession } from "@/lib/admin";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";

/**
 * Dashboard session.
 *
 * The browser signs in with Firebase (email, Google or GitHub), then asks the
 * API to verify the ID token against the ADMIN_UIDS allowlist. A valid Firebase
 * account that is not on the list is signed straight back out — authorization
 * never happens client-side.
 */
export type SocialProvider = "google" | "github";

interface AuthState {
  user: User | null;
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

const INVALID_CREDENTIALS = "Wrong email or password.";
const NOT_ALLOWLISTED =
  "This account is not an admin. Add its UID to ADMIN_UIDS on the server.";

const PROVIDERS: Record<SocialProvider, () => FirebaseProvider> = {
  google: () => new GoogleAuthProvider(),
  github: () => new GithubAuthProvider(),
};

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
      return "That sign-in method is disabled in the Firebase console.";
    case "auth/admin-restricted-operation":
      return "New account creation is disabled in the Firebase console.";
    case "auth/email-already-in-use":
      return "That email already has an account — sign in instead.";
    case "auth/weak-password":
      return "Use a password with at least 6 characters.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "The sign-in window was closed before it finished.";
    case "auth/popup-blocked":
      return "The browser blocked the sign-in window. Allow popups and try again.";
    case "auth/account-exists-with-different-credential":
      return "That email is already linked to another sign-in method.";
    case "auth/network-request-failed":
      return "Cannot reach Firebase. Check your connection.";
    default:
      return error instanceof Error ? error.message : "Sign-in failed.";
  }
}

/**
 * Turns a rejected `/auth/session` into an actionable message.
 *
 * `/auth/status` still works for accounts outside the allowlist, so the page can
 * name the exact UID the owner has to paste into ADMIN_UIDS.
 */
async function explainRejection(cause: unknown): Promise<string> {
  if (cause instanceof AdminApiError && (cause.status === 401 || cause.status === 403)) {
    try {
      const status = await fetchAuthStatus();
      const who = status.email || status.name || "This account";
      const empty =
        status.adminCount === 0
          ? " ADMIN_UIDS is currently empty, so no account can sign in."
          : "";

      return `${who} is not an admin. Add UID ${status.uid} to ADMIN_UIDS in portfolio-server/.env, restart the API and sign in again.${empty}`;
    } catch {
      return NOT_ALLOWLISTED;
    }
  }

  return messageFor(cause);
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
        try {
          localStorage.removeItem("pf_is_admin");
        } catch {}
        return;
      }

      setLoading(true);

      verifySession()
        .then((value) => {
          setSession(value);
          setError("");
          try {
            localStorage.setItem("pf_is_admin", "true");
          } catch {}
        })
        .catch(async (cause: unknown) => {
          setSession(null);
          try {
            localStorage.removeItem("pf_is_admin");
          } catch {}
          setError(await explainRejection(cause));
          await firebaseSignOut(auth).catch(() => undefined);
        })
        .finally(() => setLoading(false));
    });

    return unsubscribe;
  }, [configured]);

  const guard = useCallback(() => {
    if (configured) return true;
    setError("Firebase web config is missing — see the setup note on this page.");
    return false;
  }, [configured]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!guard()) return;

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
    [guard],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      if (!guard()) return;

      setSigningIn(true);
      setError("");

      try {
        const credential = await createUserWithEmailAndPassword(
          getFirebaseAuth(),
          email.trim(),
          password,
        );

        if (name.trim()) {
          await updateProfile(credential.user, { displayName: name.trim() });
        }
        // onAuthStateChanged then verifies the fresh account against ADMIN_UIDS.
      } catch (cause) {
        setError(messageFor(cause));
      } finally {
        setSigningIn(false);
      }
    },
    [guard],
  );

  const signInWith = useCallback(
    async (provider: SocialProvider) => {
      if (!guard()) return;

      setSigningIn(true);
      setError("");

      try {
        await signInWithPopup(getFirebaseAuth(), PROVIDERS[provider]());
      } catch (cause) {
        setError(messageFor(cause));
      } finally {
        setSigningIn(false);
      }
    },
    [guard],
  );

  const signOut = useCallback(async () => {
    if (!configured) return;
    try {
      localStorage.removeItem("pf_is_admin");
    } catch {}
    await firebaseSignOut(getFirebaseAuth()).catch(() => undefined);
    setSession(null);
    setUser(null);
  }, [configured]);

  const clearError = useCallback(() => setError(""), []);

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
      register,
      signInWith,
      signOut,
      clearError,
    }),
    [user, session, loading, signingIn, error, configured, signIn, register, signInWith, signOut, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
