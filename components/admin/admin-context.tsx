"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/admin/auth-provider";
import { AdminApiError, fetchContentTypes, type ContentType } from "@/lib/admin";

/**
 * Content schema for the dashboard.
 *
 * The API owns the field registry, so the sidebar and every form are built from
 * one `describe` call instead of a duplicated list of fields in the frontend.
 */
interface AdminData {
  types: ContentType[];
  loading: boolean;
  error: string;
  reload: () => void;
}

const AdminContext = createContext<AdminData | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [types, setTypes] = useState<ContentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;
    setLoading(true);

    fetchContentTypes()
      .then((value) => {
        if (!cancelled) {
          setTypes(value);
          setError("");
        }
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(
          cause instanceof AdminApiError
            ? cause.message
            : "Could not load the content schema from the API.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session, nonce]);

  return (
    <AdminContext.Provider value={{ types, loading, error, reload }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminData(): AdminData {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdminData must be used inside <AdminDataProvider>");
  return context;
}
