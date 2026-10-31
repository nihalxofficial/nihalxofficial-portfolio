"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { PlusMarks, WindowBar } from "@/components/ui/panel-chrome";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { sendContactMessage } from "@/lib/api";
import { coordinatesOf, formatCoordinates, mapEmbedUrl, mapsLink } from "@/lib/map";
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
  const socials = (settings?.socialLinks ?? []).filter((link) => link.url);
  const mapSrc = mapEmbedUrl(contact);
  const coords = coordinatesOf(contact);
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
        name: String(data.get("name") ?? "").trim(),
        email: String(data.get("email") ?? "").trim(),
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
    contact.email && { icon: "Mail", label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    contact.phone && { icon: "Phone", label: "Phone", value: contact.phone, href: `tel:${contact.phone}` },
    contact.location && { icon: "MapPin", label: "Location", value: contact.location },
    contact.availability && { icon: "CircleDot", label: "Availability", value: contact.availability },
  ].filter(Boolean) as Array<{ icon: string; label: string; value: string; href?: string }>;

  // The terminal reads like a shell session, and the last line is the promise
  // the form makes to whoever is typing.
  const session = [
    { cmd: "ping creative_ideas", out: "Pinging your ideas…" },
    { cmd: "whoami", out: contact.availability || "full-stack developer" },
    { cmd: "./start-conversation.sh", out: "Building something awesome together!" },
  ];

  return (
    <section id="contact" className="relative section-pad">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px rule-grad" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-72 glow-soft opacity-60" />

      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-6">
          {/* ── Details ─────────────────────────────────────────────────── */}
          <div className="flex h-full flex-col lg:col-span-4">
            <Reveal>
              <SectionHeading
                index={index}
                label={section?.label || "Get In Touch"}
                title={section?.heading || "Let's Build Something Great Together"}
                description={
                  section?.description ||
                  "Have a product to ship or a role to fill? Send a message and I'll get back to you."
                }
              />
            </Reveal>

            {rows.length > 0 ? (
              <Reveal delay={80}>
                <ul className="mt-7 space-y-2">
                  {rows.map((row) => (
                    <li key={row.label}>
                      <a
                        href={row.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl border border-line bg-surface/40 px-3.5 py-2.5 transition-colors",
                          row.href ? "hover:border-accent/45" : "cursor-default",
                        )}
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-accent/10 text-accent transition-shadow group-hover:shadow-[0_0_18px_-6px_var(--accent-glow)]">
                          <Icon name={row.icon} className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="mono block text-[9.5px] uppercase tracking-[0.18em] text-faint">
                            {row.label}
                          </span>
                          <span className="mt-0.5 block truncate text-[12.5px] text-ink">
                            {row.value}
                          </span>
                        </span>
                        {row.href ? (
                          <Icon
                            name="ArrowUpRight"
                            className="ml-auto h-3.5 w-3.5 shrink-0 text-faint transition-all group-hover:-translate-y-0.5 group-hover:text-accent"
                          />
                        ) : null}
                      </a>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}

            {socials.length > 0 ? (
              <Reveal delay={110} className="mt-auto pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  {socials.map((link) => (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.platform}
                      title={link.platform}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface/40 text-muted transition-colors hover:border-accent/45 hover:text-accent"
                    >
                      <Icon name={link.icon} className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </Reveal>
            ) : null}
          </div>

          {/* ── Terminal + map ──────────────────────────────────────────── */}
          <div className="order-3 flex flex-col gap-4 lg:order-2 lg:col-span-4">
            <Reveal delay={120} className={cn("flex flex-col", mapSrc ? null : "flex-1")}>
              <div className="code-window relative flex h-full flex-col overflow-hidden">
                <PlusMarks className="z-10" />
                <WindowBar title="bash — contact" />

                <div className="flex-1 space-y-1.5 p-4">
                  {session.map((line) => (
                    <div key={line.cmd}>
                      <p className="mono text-[11.5px] leading-relaxed">
                        <span className="text-accent">$</span>{" "}
                        <span className="text-ink">{line.cmd}</span>
                      </p>
                      <p className="mono text-[11.5px] leading-relaxed text-muted">
                        <span className="text-success">›</span> {line.out}
                      </p>
                    </div>
                  ))}
                  <p className="mono pt-0.5 text-[11.5px] text-accent">
                    <span className="text-muted">$</span> <span className="animate-blink">▌</span>
                  </p>
                </div>
              </div>
            </Reveal>

            {mapSrc ? (
              <Reveal delay={150} className="flex flex-1 flex-col">
                <div className="code-window relative flex h-full flex-col overflow-hidden">
                  <PlusMarks className="z-10" />
                  <WindowBar title="location · live map">
                    {externalMap ? (
                      <a
                        href={externalMap}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mono inline-flex items-center gap-1 text-[9.5px] uppercase tracking-[0.14em] text-faint transition-colors hover:text-accent"
                      >
                        open in maps
                        <Icon name="ArrowUpRight" className="h-3 w-3" />
                      </a>
                    ) : null}
                  </WindowBar>

                  <iframe
                    src={mapSrc}
                    title={`Map of ${contact.location || "my location"}`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="block min-h-48 w-full flex-1 border-0 grayscale-[45%] contrast-[1.05] dark:invert dark:hue-rotate-180 dark:grayscale-[65%] dark:contrast-[0.92]"
                  />

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line px-4 py-2">
                    <span className="mono inline-flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.16em] text-faint">
                      <Icon name="MapPin" className="h-3 w-3 text-accent" />
                      {contact.location || "coordinates"}
                    </span>
                    {coords ? (
                      <span className="mono ml-auto text-[10.5px] text-accent">
                        {formatCoordinates(coords)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Reveal>
            ) : null}
          </div>

          {/* ── Form ────────────────────────────────────────────────────── */}
          <Reveal delay={100} className="order-2 flex lg:order-3 lg:col-span-4">
            <form
              onSubmit={handleSubmit}
              aria-label="Contact form"
              className="glass-panel relative flex h-full w-full flex-col overflow-hidden p-4 sm:p-5"
            >
              <p className="mono text-[10px] uppercase tracking-[0.2em] text-accent">
                Send me a message
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field id="contact-name" label="Name">
                  <input
                    id="contact-name"
                    name="name"
                    required
                    autoComplete="name"
                    placeholder="Your name"
                    className="field"
                  />
                </Field>

                <Field id="contact-email" label="Email">
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                    className="field"
                  />
                </Field>
              </div>

              <div className="mt-3">
                <Field id="contact-subject" label="Subject">
                  <input
                    id="contact-subject"
                    name="subject"
                    placeholder="Project, role or just a hello"
                    className="field"
                  />
                </Field>
              </div>

              <div className="mt-3 flex flex-1 flex-col">
                <Field id="contact-message" label="Message" className="flex-1">
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={4}
                    placeholder="What you're building, the timeline and what you need from me."
                    className="field flex-1"
                  />
                </Field>
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg grad-accent text-[12.5px] font-semibold text-accent-ink transition-shadow hover:shadow-[0_10px_34px_-12px_var(--accent-glow)] disabled:opacity-60"
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
                  status === "error" ? "text-danger" : "text-success",
                  status === "sent" || status === "error" ? "opacity-100" : "opacity-0",
                )}
              >
                {status === "error" ? (
                  <Icon name="X" className="h-3.5 w-3.5" />
                ) : (
                  <Icon name="CheckCheck" className="h-3.5 w-3.5" />
                )}
                {message}
              </p>

              <p className="mono mt-1 text-center text-[10px] uppercase tracking-[0.14em] text-faint">
                straight to my inbox · no third-party forms
              </p>
            </form>
          </Reveal>
        </div>
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
      <span className="mono mb-1.5 block text-[9.5px] uppercase tracking-[0.18em] text-faint">
        {label}
      </span>
      {children}
    </label>
  );
}
