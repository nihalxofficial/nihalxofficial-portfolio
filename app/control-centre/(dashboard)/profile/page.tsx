"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { SectionHeader } from "@/components/admin/ui";
import { useAuth } from "@/components/admin/auth-provider";

/** Human label for a Firebase provider id ("google.com" → "Google"). */
function providerLabel(id: string): string {
  if (id.includes("google")) return "Google";
  if (id.includes("github")) return "GitHub";
  if (id.includes("password")) return "Email & password";
  return id.replace(/\.com$/, "");
}

/**
 * Profile & Security.
 *
 * The `System` sidebar group links here, and the API — not this page — owns who
 * is an admin. This screen only surfaces the already-verified identity from
 * `useAuth()` (the Firebase user plus the `/auth/session` allowlist result) and
 * a sign-out control. There is nothing to edit: authorization lives in the
 * server's ADMIN_UIDS allowlist.
 */
export default function AdminProfilePage() {
  const { user, session, signOut } = useAuth();
  const router = useRouter();

  const methods = user?.providerData?.map((p) => providerLabel(p.providerId)) ?? [];
  const verifiedProviders = methods.length ? methods : ["—"];

  const handleSignOut = async () => {
    await signOut();
    router.replace("/control-centre/login");
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="System"
        title="Profile & Security"
        description="Your signed-in identity and session. Admin access is granted by the server allowlist, never here."
        icon="UserCog"
        actions={
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-[12px] font-medium text-muted transition-colors hover:border-danger/50 hover:text-danger"
          >
            <Icon name="LogOut" className="h-3.5 w-3.5" />
            Sign out
          </button>
        }
      />

      {/* Identity hero */}
      <section className="panel p-5">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl border border-line bg-accent/10 text-accent">
            <Icon name="User" className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[18px] font-semibold text-ink">
              {user?.displayName || session?.name || "Signed-in admin"}
            </p>
            <p className="mono truncate text-[12px] text-muted">
              {user?.email || session?.email || "—"}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Account */}
        <section className="panel p-4">
          <h2 className="text-[13.5px] font-semibold text-ink">Account</h2>
          <dl className="mt-3 space-y-2.5">
            <InfoRow icon="User" label="Name" value={user?.displayName || session?.name || "—"} />
            <InfoRow icon="Mail" label="Email" value={user?.email || session?.email || "—"} />
            <InfoRow
              icon="Shield"
              label="Email verified"
              value={user?.emailVerified ? "Yes" : "No"}
            />
          </dl>
        </section>

        {/* Security */}
        <section className="panel p-4">
          <h2 className="text-[13.5px] font-semibold text-ink">Security</h2>
          <dl className="mt-3 space-y-2.5">
            <InfoRow icon="Activity" label="Sign-in methods" value={verifiedProviders.join(", ")} />
            <InfoRow icon="Code2" label="UID" value={session?.uid || user?.uid || "—"} mono />
            <InfoRow
              icon="Users"
              label="Admins on this site"
              value={session ? String(session.adminCount) : "—"}
            />
          </dl>
          <p className="mt-3 rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[11.5px] text-faint">
            To grant or revoke admin access, edit{" "}
            <span className="mono text-accent">ADMIN_UIDS</span> on the server and restart the API.
          </p>
        </section>
      </div>

      {/* Session status */}
      <section className="panel p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[13.5px] font-semibold text-ink">Session</h2>
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-success">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            VERIFIED
          </span>
        </div>
        <p className="mt-2 text-[12.5px] text-muted">
          Your Better-Auth session is verified and authorized with administrator clearance. Authorization is enforced on every request.
        </p>
      </section>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  mono,
}: {
  icon: string;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon name={icon} className="h-3.5 w-3.5 shrink-0 text-faint" />
      <dt className="w-32 shrink-0 text-[12px] text-faint">{label}</dt>
      <dd className={`min-w-0 flex-1 truncate text-[12.5px] text-ink ${mono ? "mono" : ""}`} title={value}>
        {value}
      </dd>
    </div>
  );
}
