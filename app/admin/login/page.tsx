"use client";

import { Button, Input, Label, TextField } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/admin/auth-provider";
import { Icon } from "@/components/ui/icon";

export default function AdminLoginPage() {
  const router = useRouter();
  const { session, loading, signingIn, error, configError, signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (session) router.replace("/admin");
  }, [session, router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void signIn(email, password);
  }

  return (
    <div className="relative grid min-h-screen place-items-center px-5 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-backdrop radial-fade opacity-60" />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-16 h-[420px] w-[680px] -translate-x-1/2 glow-soft opacity-70" />

      <div className="relative w-full max-w-sm">
        <div className="panel p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl grad-accent text-accent-ink">
              <Icon name="LayoutDashboard" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[15px] font-semibold text-ink">Portfolio dashboard</p>
              <p className="mono text-[10px] uppercase tracking-[0.16em] text-faint">
                private · allowlisted accounts only
              </p>
            </div>
          </div>

          {configError ? (
            <div className="mt-6 rounded-xl border border-warning/35 bg-warning/10 p-4">
              <p className="flex items-center gap-2 text-[12.5px] font-medium text-warning">
                <Icon name="Settings" className="h-4 w-4" />
                Firebase web config missing
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-muted">{configError}</p>
              <p className="mono mt-3 rounded-lg border border-line bg-surface-2 px-3 py-2 text-[10.5px] leading-relaxed text-faint">
                portfolio/.env.local
                <br />
                NEXT_PUBLIC_FIREBASE_API_KEY=…
                <br />
                NEXT_PUBLIC_FIREBASE_APP_ID=…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
              <TextField
                type="email"
                value={email}
                onChange={setEmail}
                isRequired
                className="flex flex-col gap-1.5"
              >
                <Label className="mono text-[10px] uppercase tracking-[0.18em] text-faint">
                  Email
                </Label>
                <Input placeholder="you@example.com" autoComplete="username" />
              </TextField>

              <TextField
                type="password"
                value={password}
                onChange={setPassword}
                isRequired
                className="flex flex-col gap-1.5"
              >
                <Label className="mono text-[10px] uppercase tracking-[0.18em] text-faint">
                  Password
                </Label>
                <Input placeholder="••••••••" autoComplete="current-password" />
              </TextField>

              <Button
                type="submit"
                fullWidth
                isDisabled={signingIn || loading}
                className="mt-1 h-11 rounded-lg grad-accent text-[13px] font-semibold text-accent-ink"
              >
                {signingIn || loading ? (
                  <>
                    <Icon name="Loader" className="h-4 w-4 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  <>
                    Sign in
                    <Icon name="ArrowRight" className="h-4 w-4" />
                  </>
                )}
              </Button>

              {error ? (
                <p
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[11.5px] leading-relaxed text-danger"
                >
                  <Icon name="X" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {error}
                </p>
              ) : null}
            </form>
          )}
        </div>

        <p className="mono mt-4 text-center text-[10.5px] text-faint">
          <Link href="/" className="hover:text-accent">
            ← back to the public site
          </Link>
        </p>
      </div>
    </div>
  );
}
