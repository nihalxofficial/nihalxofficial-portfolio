import { getRequiredRole } from "@/lib/core/session";
import { AdminDataProvider } from "@/components/admin/admin-context";
import { AdminShell } from "@/components/admin/admin-shell";

/**
 * Server-side guard: ensures only accounts with role="admin" can enter the control centre.
 * Unauthenticated users redirect to login, non-admin accounts redirect to /forbidden.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await getRequiredRole("admin");
  return (
    <AdminDataProvider>
      <AdminShell>{children}</AdminShell>
    </AdminDataProvider>
  );
}
