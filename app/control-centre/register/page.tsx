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

export default function AdminRegisterPage() {
  const router = useRouter();
  const { session, loading, signingIn, error, configError, register, signInWith, clearError } =
    useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mismatch, setMismatch] = useState("");

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (session) router.replace(ADMIN_BASE);
  }, [session, router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirm) {
      setMismatch("The two passwords do not match.");
      return;
    }

    setMismatch("");
    void register(name, email, password);
  }

  return (
    <AuthShell
      eyebrow="first account · then ADMIN_UIDS"
      title="Create account"
      subtitle="Registering only creates the Firebase account. Access is granted by adding its UID to ADMIN_UIDS on the server."
      footer={
        <>
          <span>Already registered?</span>
          <Link href={adminHref("login")} className="text-accent hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {configError ? (
        <ConfigNotice message={configError} />
      ) : (
        <>
          <div className="mt-5">
            <SocialButtons
              disabled={signingIn || loading}
              onProvider={(provider) => void signInWith(provider)}
            />
          </div>

          <AuthDivider label="or use email" />

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <TextField
              value={name}
              onChange={setName}
              className="flex flex-col gap-1.5"
            >
              <Label>
                <FieldLabel>Name</FieldLabel>
              </Label>
              <Input placeholder="Nihal Uddin" autoComplete="name" />
            </TextField>

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
              <Input placeholder="at least 6 characters" autoComplete="new-password" />
            </TextField>

            <TextField
              type="password"
              value={confirm}
              onChange={setConfirm}
              isRequired
              className="flex flex-col gap-1.5"
            >
              <Label>
                <FieldLabel>Confirm password</FieldLabel>
              </Label>
              <Input placeholder="repeat the password" autoComplete="new-password" />
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
                  Creating…
                </>
              ) : (
                <>
                  Create account
                  <Icon name="ArrowRight" className="h-4 w-4" />
                </>
              )}
            </Button>

            <AuthError message={mismatch || error} />

            <p className="mono rounded-lg border border-line bg-surface-2/60 px-3 py-2 text-[10.5px] leading-relaxed text-faint">
              After registering, copy the UID shown in the error (or in Firebase → Authentication →
              Users) into <span className="text-accent">ADMIN_UIDS</span>.
            </p>
          </form>
        </>
      )}
    </AuthShell>
  );
}
