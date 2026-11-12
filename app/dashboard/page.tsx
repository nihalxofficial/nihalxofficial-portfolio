import { redirect } from "next/navigation";
import { ADMIN_BASE } from "@/lib/admin-routes";

export default function DashboardRedirect() {
  redirect(ADMIN_BASE);
}

