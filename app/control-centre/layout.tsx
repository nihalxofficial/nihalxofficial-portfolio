import type { Metadata } from "next";
import { AuthProvider } from "@/components/admin/auth-provider";
import { AccentProvider } from "@/components/site/accent-context";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Private content dashboard.",
  // The dashboard must never be indexed, even though the URL is unlisted.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccentProvider>
      <AuthProvider>{children}</AuthProvider>
    </AccentProvider>
  );
}
