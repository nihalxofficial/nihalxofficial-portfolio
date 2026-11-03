"use client";

import { Button, Input, Label, TextField } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  AuthDivider,
  AuthError,
  AuthShell,
  ConfigNotice,
  FieldLabel,
  SocialButtons,
} from "@/components/admin/auth-card";
import { useAuth } from "@/components/admin/auth-provider";
import { Icon } from "@/components/ui/icon";
import { ADMIN_BASE, adminHref } from "@/lib/admin-routes";

export default function AdminLoginPage() {
  const router = useRouter();
  const { session, loading, signingIn, error, configError, signIn, signInWith, clearError } =
    useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (session) router.replace(ADMIN_BASE);
  }, [session, router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void signIn(email, password);
  }

  return (
    <AuthShell
      eyebrow="private · allowlisted accounts only"
      title="Sign in"
      subtitle="The dashboard is not linked from the site. Sign in with your allowlisted account to continue."
      footer={
        <>
          <span>New here?</span>
          <Link href={adminHref("register")} className="text-accent hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {configError ? (
        <ConfigNotice message={configError} />
      ) : (
        <>
          <div className="mt-5">
            <SocialButtons disabled={signingIn || loading} onProvider={(provider) => void signInWith(provider)} />
          </div>

          <AuthDivider label="or use email" />

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <TextField
              type="email"
              value={email}
              onChange={setEmail}
              isRequired
              className="flex flex-col gap-1.5"
            >
              <Label>
                <FieldLabel>Email</FieldLabel>
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
              <Label>
                <FieldLabel>Password</FieldLabel>
              </Label>
              <Input placeholder="••••••••" autoComplete="current-password" />
            </TextField>

            <Button
              type="submit"
              fullWidth
              isDisabled={signingIn || loading}
              className="mt-1 h-11 rounded-xl grad-accent text-[13px] font-semibold text-accent-ink hover:glow-sm transition-all cursor-pointer"
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

            <AuthError message={error} />
          </form>
        </>
      )}
    </AuthShell>
  );
}
