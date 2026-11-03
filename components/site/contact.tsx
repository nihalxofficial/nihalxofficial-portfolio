"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Check, CheckCheck, Copy, Loader2, Send, X, Zap } from "lucide-react";
import { AnimatedProgressBar } from "@/components/ui/animated-progress";
import { Icon } from "@/components/ui/icon";
import { TerminalText } from "@/components/ui/terminal-text";
import { PlusMarks, WindowBar } from "@/components/ui/panel-chrome";
import { Reveal } from "@/components/ui/reveal";
import { sendContactMessage } from "@/lib/api";
import { coordinatesOf, formatCoordinates, mapEmbedUrl, mapsLink } from "@/lib/map";
import { tokenizeCommand, tokenizeOutput } from "@/lib/terminal";
import type { SectionMeta, SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "sent" | "error";

const SUBJECTS = ["💼 Project", "🧑‍💻 Job offer", "🤝 Collab", "👋 Just saying hi"] as const;

const SEND_LOG = [
  "validating payload…",
  "encrypting message (AES-256)…",
  "routing via smtp.devos.net…",
  "delivered ✓",
];

/* ── Ping radar for location ─────────────────────────────────────────── */
function PingRadar() {
  return (
    <div className="relative w-full aspect-square max-w-[150px] mx-auto">
      {[1, 0.72, 0.44].map((s) => (
        <div
          key={s}
          className="absolute inset-0 m-auto rounded-full border border-acc/20"
          style={{ width: `${s * 100}%`, height: `${s * 100}%` }}
        />
      ))}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div
          className="absolute inset-0 orbit-ring"
          style={{
            ["--d" as string]: "6s",
            background:
              "conic-gradient(from 0deg, color-mix(in srgb, var(--acc) 40%, transparent), transparent 25%)",
          }}
        />
      </div>
      <div className="absolute left-0 right-0 top-1/2 h-px bg-acc/15" />
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-acc/15" />
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="ping-ring absolute inset-0 m-auto w-full h-full rounded-full border border-acc/60"
          style={{ animationDelay: `${i}s` }}
        />
      ))}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="block w-3 h-3 rounded-full bg-acc shadow-[0_0_16px_var(--acc)]" />
      </div>
      <div className="absolute left-1/2 top-1/2 translate-x-2 -translate-y-6 font-mono text-[9px] text-acc whitespace-nowrap font-bold">
        CHATTOGRAM · BD
      </div>
    </div>
  );
}

/* ── Field wrapper ───────────────────────────────────────────────────── */
function Field({
  id,
  label,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={id} className={cn("flex flex-col", className)}>
      <span className="font-mono mb-1.5 block text-[9.5px] text-acc">{label}</span>
      <div
        className={cn(
          "rounded-lg border bg-black/30 transition focus-within:border-acc focus-within:glow-sm",
          error ? "border-red-400/60" : "border-white/10"
        )}
      >
        {children}
      </div>
      {error && <span className="font-mono text-[11px] text-red-400 mt-0.5">✗ {error}</span>}
    </label>
  );
}

/** Contact — real API-backed form, terminal panel, map, and availability stats. */
export function Contact({
  settings,
  section,
  index,
}: {
  settings: SiteSettings | null;
  section?: SectionMeta;
  index: number;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [resultMsg, setResultMsg] = useState("");
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  const [sendLog, setSendLog] = useState(0);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const contact   = settings?.contact ?? {};
  const socials   = (settings?.socialLinks ?? []).filter((link) => link.url);
  const mapSrc    = mapEmbedUrl(contact);
  const coords    = coordinatesOf(contact);
  const externalMap = mapsLink(contact);

  /* Animated send log */
  useEffect(() => {
    if (status !== "sending") return;
    if (sendLog >= SEND_LOG.length) {
      const t = setTimeout(() => setStatus("sent"), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setSendLog((n) => n + 1), 520);
    return () => clearTimeout(t);
  }, [status, sendLog]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;

    // Client-side validation
    const er: Record<string, string> = {};
    if (form.name.trim().length < 2)            er.name    = "name must be at least 2 characters";
    if (!/^\S+@\S+\.\S+$/.test(form.email))     er.email   = "enter a valid email address";
    if (form.message.trim().length < 10)         er.message = "message must be at least 10 characters";
    setErrors(er);
    if (Object.keys(er).length) return;

    setSendLog(0);
    setStatus("sending");

    try {
      await sendContactMessage({
        name:    form.name.trim(),
        email:   form.email.trim(),
        subject: subject,
        message: form.message.trim(),
      });
      // Status transitions to "sent" after log completes (via effect above)
    } catch (error) {
      setStatus("error");
      setResultMsg(error instanceof Error ? error.message : "Message could not be sent.");
    }
  }

  function reset() {
    setStatus("idle");
    setForm({ name: "", email: "", message: "" });
    setResultMsg("");
    setSendLog(0);
  }

  const rows = [
    contact.email     && { icon: "Mail",       label: "Email",        value: contact.email,    href: `mailto:${contact.email}` },
    contact.phone     && { icon: "Phone",      label: "Phone",        value: contact.phone,    href: `tel:${contact.phone}` },
    contact.location  && { icon: "MapPin",     label: "Location",     value: contact.location },
    contact.availability && { icon: "CircleDot", label: "Availability", value: contact.availability },
  ].filter(Boolean) as Array<{ icon: string; label: string; value: string; href?: string }>;

  const session = [
    { cmd: "ping creative_ideas",     out: "Pinging ideas… latency < 20ms" },
    { cmd: "whoami",                  out: contact.availability || "full-stack developer" },
    { cmd: "./start-conversation.sh", out: "Building something awesome together!" },
  ];

  const inputCls = "w-full bg-transparent outline-none px-3 py-2.5 text-sm placeholder:text-slate-600";

  return (
    <section id="contact" className="relative py-14">
      {/* ViewHeader */}
      <div className="mb-8">
        <p className="eyebrow mb-2 font-mono text-xs text-acc">{"// get in touch"}</p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Let&apos;s Work <span className="text-grad">Together</span>
        </h2>
        {section?.description && (
          <p className="text-sm text-slate-400 max-w-xl">{section.description}</p>
        )}
      </div>

      {/* Balanced 2-Column Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr] items-start min-w-0 max-w-full">
        {/* ── LEFT COLUMN: Form + Terminal Console ────────────────────── */}
        <div className="space-y-5 min-w-0">
          {/* Main Message Form */}
          <Reveal>
            <div className="hud !rounded-2xl overflow-hidden border border-white/10 hover:border-acc/40 transition-colors">
              {/* Window Bar Header */}
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/10 bg-white/[0.02]">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                <span className="font-mono ml-3 text-xs text-slate-400">
                  contact.sh — compose message
                </span>
                <span className="ml-auto font-mono text-[10px] text-acc uppercase tracking-widest">
                  PORT:5000
                </span>
              </div>

              {/* Idle: form */}
              {status === "idle" && (
                <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4" noValidate>
                  {/* Subject chips */}
                  <div>
                    <span className="font-mono text-[9.5px] text-acc uppercase tracking-widest">
                      {">"} select subject
                    </span>
                    <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                      {SUBJECTS.map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setSubject(s)}
                          className={`chip !text-xs !py-1.5 cursor-pointer transition ${
                            subject === s ? "on !border-acc text-acc bg-acc/10" : ""
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name + email */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field id="contact-name" label="// your name" error={errors.name}>
                      <input
                        id="contact-name"
                        className={inputCls}
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </Field>
                    <Field id="contact-email" label="// email address" error={errors.email}>
                      <input
                        id="contact-email"
                        type="email"
                        className={inputCls}
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </Field>
                  </div>

                  {/* Message */}
                  <Field id="contact-message" label="// message brief" error={errors.message}>
                    <textarea
                      id="contact-message"
                      className={`${inputCls} resize-none h-32`}
                      maxLength={500}
                      placeholder="Tell me about your project, timeline, budget or inquiry…"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </Field>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <span className="font-mono text-[11px] text-slate-500">
                      {form.message.length}/500 chars
                    </span>
                    <button
                      type="submit"
                      className="btn-primary inline-flex items-center justify-center gap-2 whitespace-nowrap px-6 py-2.5 rounded-xl font-mono text-xs font-bold cursor-pointer"
                    >
                      <span>Send Message</span>
                      <Send size={13} className="shrink-0" />
                    </button>
                  </div>
                </form>
              )}

              {/* Sending: animated log */}
              {status === "sending" && (
                <div className="p-6 min-h-[300px] font-mono text-sm space-y-2.5">
                  <div className="flex items-center gap-2 text-acc font-bold">
                    <Loader2 size={16} className="animate-spin" /> transmitting payload…
                  </div>
                  {SEND_LOG.slice(0, sendLog).map((line, i) => (
                    <div key={i} className="rise text-slate-300 flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>{line}</span>
                    </div>
                  ))}
                  <div className="mt-5 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-grad transition-all duration-500"
                      style={{ width: `${(sendLog / SEND_LOG.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Sent: success */}
              {status === "sent" && (
                <div className="p-8 sm:p-10 text-center rise space-y-3">
                  <div className="mx-auto w-14 h-14 rounded-full grid place-items-center bg-emerald-400/10 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_25px_rgba(52,211,153,.5)]">
                    <Check size={28} />
                  </div>
                  <h3 className="font-display text-2xl font-bold mt-3 text-white">
                    Transmission Sent!
                  </h3>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto">
                    Thanks {form.name.split(" ")[0] || "there"}! Your message has been safely received. I&apos;ll reply within 24 hours.
                  </p>
                  <button
                    onClick={reset}
                    className="mt-4 btn-ghost inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-mono cursor-pointer"
                  >
                    <span>Write another message</span>
                  </button>
                </div>
              )}

              {/* Error */}
              {status === "error" && (
                <div className="p-8 text-center rise space-y-3">
                  <div className="mx-auto w-14 h-14 rounded-full grid place-items-center bg-red-500/10 border-2 border-red-400 text-red-400">
                    <X size={24} />
                  </div>
                  <h3 className="font-display text-xl font-bold mt-2 text-white">
                    Transmission Failed
                  </h3>
                  <p className="text-slate-400 text-sm">{resultMsg}</p>
                  <button
                    onClick={reset}
                    className="mt-4 btn-ghost inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-mono cursor-pointer"
                  >
                    <span>Try again</span>
                  </button>
                </div>
              )}
            </div>
          </Reveal>

          {/* Interactive Bash Terminal (Balanced Left Bottom) */}
          <Reveal delay={80}>
            <div className="code-window relative flex flex-col overflow-hidden rounded-2xl border border-white/10">
              <PlusMarks className="z-10" />
              <WindowBar title="bash — contact session" />
              <div className="flex-1 space-y-1.5 p-4 bg-[#020515]/90">
                {session.map((line) => (
                  <div key={line.cmd}>
                    <p className="font-mono text-[11.5px] leading-relaxed">
                      <span className="text-acc font-bold">$</span>{" "}
                      <TerminalText tokens={tokenizeCommand(line.cmd)} className="text-slate-200" />
                    </p>
                    <p className="font-mono text-[11.5px] leading-relaxed">
                      <span className="text-emerald-400">›</span>{" "}
                      <TerminalText tokens={tokenizeOutput(line.out)} className="text-slate-400" />
                    </p>
                  </div>
                ))}
                <p className="font-mono pt-1 text-[11.5px] text-acc flex items-center gap-1">
                  <span className="text-slate-500">$</span>
                  <span>ready for transmission</span>
                  <span className="caret">▌</span>
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ── RIGHT COLUMN: Channels + Availability & Socials + Map ────── */}
        <div className="space-y-5 min-w-0">
          {/* Direct Communication Channels + Radar */}
          <Reveal delay={60}>
            <div className="hud !rounded-2xl p-5 border border-white/10 hover:border-acc/40 transition-colors">
              <div className="font-mono text-[10.5px] text-acc uppercase tracking-widest mb-3">
                {"// direct telemetry channels"}
              </div>
              <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                <div className="space-y-2 min-w-0">
                  {/* Email copy row */}
                  {contact.email && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(contact.email!);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/10 hover:border-acc/60 bg-white/[0.02] cursor-pointer text-left transition group"
                    >
                      <Icon name="Mail" className="h-4 w-4 text-acc shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[9.5px] font-mono text-slate-500 uppercase">
                          email
                        </span>
                        <span className="block text-xs sm:text-sm truncate text-white">
                          {contact.email}
                        </span>
                      </span>
                      <span className="ml-auto text-slate-500 group-hover:text-acc shrink-0">
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </span>
                    </button>
                  )}

                  {/* Other contact rows */}
                  {rows
                    .filter((r) => r.label !== "Email")
                    .map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.02]"
                      >
                        <Icon name={row.icon} className="h-4 w-4 text-acc shrink-0" />
                        <span className="min-w-0">
                          <span className="block text-[9.5px] font-mono text-slate-500 uppercase">
                            {row.label}
                          </span>
                          <span className="block text-xs sm:text-sm text-slate-200 truncate">
                            {row.value}
                          </span>
                        </span>
                      </div>
                    ))}
                </div>

                {/* Ping radar */}
                <div className="hidden sm:block w-[120px] shrink-0">
                  <PingRadar />
                </div>
              </div>
              {coords && (
                <div className="mt-3 font-mono text-[10px] text-slate-500 text-center border-t border-white/5 pt-2">
                  {formatCoordinates(coords)}
                </div>
              )}
            </div>
          </Reveal>

          {/* Availability & Social Matrix (Integrated & Balanced) */}
          <Reveal delay={100}>
            <div className="hud !rounded-2xl p-5 border border-white/10 hover:border-acc/40 transition-colors space-y-4">
              <div>
                <div className="font-mono text-[10.5px] text-acc uppercase tracking-widest mb-2">
                  {"// availability & engagement"}
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-white">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span>{contact.availability || "Open for freelance & full-time roles"}</span>
                </div>
                <div className="mt-3.5 space-y-2.5">
                  {[
                    ["Response Time", 95, "< 24 Hours"],
                    ["Contract Capacity", 65, "2 Slots Open"],
                  ].map(([label, v, tag]) => (
                    <div key={label as string}>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">{label}</span>
                        <span className="font-mono text-acc font-semibold">{tag}</span>
                      </div>
                      <AnimatedProgressBar
                        value={v as number}
                        className="mt-1 h-1.5 bg-white/10"
                        barClassName="bg-grad shadow-[0_0_8px_var(--acc)]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Matrix */}
              {socials.length > 0 && (
                <div className="pt-3 border-t border-white/5">
                  <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-2.5">
                    {"// connect across network"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {socials.map((link) => (
                      <a
                        key={link.platform}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.platform}
                        title={link.platform}
                        className="h-9 w-9 rounded-xl border border-white/10 grid place-items-center text-slate-300 hover:text-acc hover:border-acc/60 hover:-translate-y-0.5 hover:glow-sm transition"
                      >
                        <Icon name={link.icon || link.platform} className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Reveal>

          {/* Map Window */}
          {mapSrc && (
            <Reveal delay={140}>
              <div className="code-window relative flex flex-col overflow-hidden rounded-2xl border border-white/10">
                <PlusMarks className="z-10" />
                <WindowBar title="location · live telemetry map">
                  {externalMap && (
                    <a
                      href={externalMap}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono inline-flex items-center gap-1 text-[9.5px] uppercase tracking-widest text-slate-400 hover:text-acc transition-colors"
                    >
                      open in maps
                      <Icon name="ArrowUpRight" className="h-3 w-3" />
                    </a>
                  )}
                </WindowBar>
                <iframe
                  src={mapSrc}
                  title={`Map of ${contact.location || "my location"}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block h-36 w-full border-0 grayscale-[80%] contrast-[1.1] hue-rotate-180 invert"
                />
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/5 px-4 py-2 bg-white/[0.02]">
                  <span className="font-mono inline-flex items-center gap-1.5 text-[9.5px] uppercase tracking-widest text-slate-400">
                    <Icon name="MapPin" className="h-3 w-3 text-acc" />
                    {contact.location || "coordinates"}
                  </span>
                  {coords && (
                    <span className="font-mono ml-auto text-[10px] text-acc">
                      {formatCoordinates(coords)}
                    </span>
                  )}
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
