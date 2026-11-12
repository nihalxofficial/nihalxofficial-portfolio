import { Metadata } from "next";
import ForbiddenView from "@/components/shared/ForbiddenView";

export const metadata: Metadata = {
  title: "403 Forbidden - Access Denied",
  description: "You do not have permission to access the control centre.",
  robots: { index: false, follow: false, nocache: true },
};

export default function ForbiddenPage() {
  return <ForbiddenView />;
}

