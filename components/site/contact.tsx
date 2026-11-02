"use client";

import { useState, type FormEvent, type ReactNode } from "react";
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

/** Contact — details, a live terminal/map column and a compact glass form. */
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
  const [message, setMessage] = useState("");

  const contact = settings?.contact ?? {};
  const socials  = (settings?.socialLinks ?? []).filter((link) => link.url);
  const mapSrc   = mapEmbedUrl(contact);
  const coords   = coordinatesOf(contact);
  const externalMap = mapsLink(contact);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus("sending");
    setMessage("");

    try {
      await sendContactMessage({
        name:    String(data.get("name")    ?? "").trim(),
        email:   String(data.get("email")   ?? "").trim(),
        subject: String(data.get("subject") ?? "").trim(),
        message: String(data.get("message") ?? "").trim(),
      });

      form.reset();
      setStatus("sent");
      setMessage("Message sent — I'll reply within 24 hours.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Message could not be sent.");
    }
  }

  const rows = [
    contact.email     && { icon: "Mail",      label: "Email",        value: contact.email,        href: `mailto:${contact.email}` },
    contact.phone     && { icon: "Phone",     label: "Phone",        value: contact.phone,        href: `tel:${contact.phone}` },
    contact.location  && { icon: "MapPin",    label: "Location",     value: contact.location },
    contact.availability && { icon: "CircleDot", label: "Availability", value: contact.availability },
  ].filter(Boolean) as Array<{ icon: string; label: string; value: string; href?: string }>;

  const session = [
    { cmd: "ping creative_ideas",       out: "Pinging your ideas…" },
    { cmd: "whoami",                    out: contact.availability || "full-stack developer" },
    { cmd: "./start-conversation.sh",   out: "Building something awesome together!" },
  ];

  return (
    <section id="contact" className="relative py-12">
      {/* ViewHeader */}
      <p className="eyebrow mb-2 font-mono text-xs text-acc">{"// get in touch"}</p>
      <h2 className="text-3xl font-bold mb-2">
        Let&apos;s Work <span className="text-grad">Together</span>
      </h2>
      {section?.description && (
        <p className="text-sm text-slate-400 mb-8 max-w-xl">{section.description}</p>
      )}

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-6">
        {/* ── Details ─────────────────────────────────────── */}
        <div className="flex h-full flex-col lg:col-span-4">
          {rows.length > 0 && (
            <Reveal delay={80}>
              <ul className="space-y-2">
                {rows.map((row) => (
                  <li key={row.label}>
                    <a
                      href={row.href}
                      className={cn(
                        "group flex items-center gap-3 hud px-3.5 py-2.5 transition",
                        row.href ? "hud-hover cursor-pointer" : "cursor-default"
                      )}
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-acc/10 text-acc">
                        <Icon name={row.icon} className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="font-mono block text-[9.5px] uppercase tracking-widest text-slate-500">
                          {row.label}
                        </span>
                        <span className="mt-0.5 block truncate text-[12.5px]">
                          {row.value}
                        </span>
                      </span>
                      {row.href && (
                        <Icon
                          name="ArrowUpRight"
                          className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-600 transition-all group-hover:-translate-y-0.5 group-hover:text-acc"
                        />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {socials.length > 0 && (
            <Reveal delay={110} className="mt-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-3">
                Social Links
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {socials.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    title={link.platform}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/4 text-slate-400 transition-colors hover:border-acc/60 hover:text-acc"
                  >
                    <Icon name={link.icon} className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </Reveal>
          )}
        </div>

        {/* ── Terminal + map ──────────────────────────────── */}
        <div className="order-3 flex flex-col gap-4 lg:order-2 lg:col-span-4">
          <Reveal delay={120} className={cn("flex flex-col", mapSrc ? null : "flex-1")}>
            <div className="code-window relative flex h-full flex-col overflow-hidden">
              <PlusMarks className="z-10" />
              <WindowBar title="bash — contact" />
              <div className="flex-1 space-y-1.5 p-4">
                {session.map((line) => (
                  <div key={line.cmd}>
                    <p className="font-mono text-[11.5px] leading-relaxed">
                      <span className="text-acc">$</span>{" "}
                      <TerminalText tokens={tokenizeCommand(line.cmd)} className="text-slate-200" />
                    </p>
                    <p className="font-mono text-[11.5px] leading-relaxed">
                      <span className="text-emerald-400">›</span>{" "}
                      <TerminalText tokens={tokenizeOutput(line.out)} className="text-slate-400" />
                    </p>
                  </div>
                ))}
                <p className="font-mono pt-0.5 text-[11.5px] text-acc">
                  <span className="text-slate-500">$</span> <span className="caret">▌</span>
                </p>
              </div>
            </div>
          </Reveal>

          {mapSrc && (
            <Reveal delay={150} className="flex flex-1 flex-col">
              <div className="code-window relative flex h-full flex-col overflow-hidden">
                <PlusMarks className="z-10" />
                <WindowBar title="location · live map">
                  {externalMap && (
                    <a
                      href={externalMap}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono inline-flex items-center gap-1 text-[9.5px] uppercase tracking-widest text-slate-500 hover:text-acc transition-colors"
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
                  className="block min-h-48 w-full flex-1 border-0 grayscale-[80%] contrast-[1.1] hue-rotate-180 invert"
                />

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/5 px-4 py-2">
                  <span className="font-mono inline-flex items-center gap-1.5 text-[9.5px] uppercase tracking-widest text-slate-500">
                    <Icon name="MapPin" className="h-3 w-3 text-acc" />
                    {contact.location || "coordinates"}
                  </span>
                  {coords && (
                    <span className="font-mono ml-auto text-[10.5px] text-acc">
                      {formatCoordinates(coords)}
                    </span>
                  )}
                </div>
              </div>
            </Reveal>
          )}
        </div>

        {/* ── Form ────────────────────────────────────────── */}
        <Reveal delay={100} className="order-2 flex lg:order-3 lg:col-span-4">
          <form
            onSubmit={handleSubmit}
            aria-label="Contact form"
            className="hud relative flex h-full w-full flex-col overflow-hidden p-4 sm:p-5"
          >
            {/* Mac window chrome dots */}
            <div className="flex items-center gap-1.5 mb-4">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              <span className="font-mono ml-auto text-[10px] text-slate-500">contact.sh</span>
            </div>

            <p className="font-mono text-[10px] uppercase tracking-widest text-acc mb-4">
              $ send_message --to nihal
            </p>

            <div className="mt-1 grid gap-3 sm:grid-cols-2">
              <Field id="contact-name" label="// name">
                <input
                  id="contact-name"
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Your name"
                  className="field w-full px-3 py-2 text-sm rounded-lg"
                />
              </Field>

              <Field id="contact-email" label="// email">
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="field w-full px-3 py-2 text-sm rounded-lg"
                />
              </Field>
            </div>

            <div className="mt-3">
              <Field id="contact-subject" label="// subject">
                <input
                  id="contact-subject"
                  name="subject"
                  placeholder="Project, role or just a hello"
                  className="field w-full px-3 py-2 text-sm rounded-lg"
                />
              </Field>
            </div>

            <div className="mt-3 flex flex-1 flex-col">
              <Field id="contact-message" label="// message" className="flex-1">
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={4}
                  placeholder="What you're building, the timeline and what you need from me."
                  className="field flex-1 w-full px-3 py-2 text-sm rounded-lg resize-none"
                />
              </Field>
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-4 btn-primary flex h-10 w-full items-center justify-center gap-2 rounded-lg text-[12.5px] font-semibold disabled:opacity-60"
            >
              {status === "sending" ? (
                <>
                  <Icon name="Loader" className="h-3.5 w-3.5 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  Send message
                  <Icon name="Send" className="h-3.5 w-3.5" />
                </>
              )}
            </button>

            <p
              role="status"
              aria-live="polite"
              className={cn(
                "mt-2.5 flex min-h-5 items-center justify-center gap-1.5 text-[11.5px] transition-opacity",
                status === "error" ? "text-red-400" : "text-emerald-400",
                status === "sent" || status === "error" ? "opacity-100" : "opacity-0"
              )}
            >
              {status === "error" ? (
                <Icon name="X" className="h-3.5 w-3.5" />
              ) : (
                <Icon name="CheckCheck" className="h-3.5 w-3.5" />
              )}
              {message}
            </p>

            <p className="font-mono mt-1 text-center text-[10px] uppercase tracking-widest text-slate-600">
              straight to my inbox · no third-party forms
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  className,
  children,
}: {
  id: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={id} className={cn("flex flex-col", className)}>
      <span className="font-mono mb-1.5 block text-[9.5px] text-acc">
        {label}
      </span>
      {children}
    </label>
  );
}
