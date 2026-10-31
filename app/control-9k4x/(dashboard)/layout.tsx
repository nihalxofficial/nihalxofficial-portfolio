import { AdminDataProvider } from "@/components/admin/admin-context";
import { AdminShell } from "@/components/admin/admin-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminDataProvider>
      <AdminShell>{children}</AdminShell>
    </AdminDataProvider>
  );
}
