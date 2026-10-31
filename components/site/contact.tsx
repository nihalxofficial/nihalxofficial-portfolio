"use client";

import { Button, Input, Label, TextArea, TextField } from "@heroui/react";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { sendContactMessage } from "@/lib/api";
import type { SectionMeta, SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "sent" | "error";

const TERMINAL_LINES = [
  { prompt: "status", value: "open to offers · ready to interview" },
  { prompt: "response", value: "within 24 hours" },
  { prompt: "remote", value: "preferred · worldwide" },
];

/** Contact — details and a terminal on the left, a working form on the right. */
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

  return (
    <section id="contact" className="relative section-pad">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px rule-grad" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-72 glow-soft opacity-60" />

      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div>
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
                <ul className="mt-8 space-y-2.5">
                  {rows.map((row) => (
                    <li key={row.label}>
                      <a
                        href={row.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl border border-line bg-surface/50 px-4 py-3 transition-colors",
                          row.href ? "hover:border-line-strong" : "pointer-events-none",
                        )}
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-accent/10 text-accent">
                          <Icon name={row.icon} className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="mono block text-[10px] uppercase tracking-[0.18em] text-faint">
                            {row.label}
                          </span>
                          <span className="mt-0.5 block truncate text-[13px] text-ink">
                            {row.value}
                          </span>
                        </span>
                        {row.href ? (
                          <Icon
                            name="ArrowUpRight"
                            className="ml-auto h-4 w-4 shrink-0 text-faint transition-transform group-hover:-translate-y-0.5 group-hover:text-accent"
                          />
                        ) : null}
                      </a>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}

            <Reveal delay={140}>
              <div className="mt-5 overflow-hidden rounded-xl border border-line bg-surface/60">
                <div className="flex items-center gap-1.5 border-b border-line px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                  <span className="mono ml-auto text-[10px] uppercase tracking-[0.18em] text-faint">
                    whoami
                  </span>
                </div>
                <div className="space-y-1.5 p-4">
                  {TERMINAL_LINES.map((line) => (
                    <p key={line.prompt} className="mono text-[11px] leading-relaxed">
                      <span className="text-accent">$</span>{" "}
                      <span className="text-muted">{line.prompt}</span>{" "}
                      <span className="text-ink">{line.value}</span>
                    </p>
                  ))}
                  <p className="mono text-[11px] text-accent">
                    <span className="text-muted">$</span> <span className="animate-blink">▌</span>
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={100}>
            <form
              onSubmit={handleSubmit}
              className="panel h-full p-5 sm:p-6"
              aria-label="Contact form"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField name="name" isRequired className="flex flex-col gap-1.5">
                  <Label className="mono text-[10px] uppercase tracking-[0.18em] text-faint">
                    Name
                  </Label>
                  <Input placeholder="Your name" autoComplete="name" />
                </TextField>

                <TextField name="email" type="email" isRequired className="flex flex-col gap-1.5">
                  <Label className="mono text-[10px] uppercase tracking-[0.18em] text-faint">
                    Email
                  </Label>
                  <Input placeholder="you@company.com" autoComplete="email" />
                </TextField>
              </div>

              <TextField name="subject" className="mt-4 flex flex-col gap-1.5">
                <Label className="mono text-[10px] uppercase tracking-[0.18em] text-faint">
                  Subject
                </Label>
                <Input placeholder="Project, role or just a hello" />
              </TextField>

              <TextField name="message" isRequired className="mt-4 flex flex-col gap-1.5">
                <Label className="mono text-[10px] uppercase tracking-[0.18em] text-faint">
                  Message
                </Label>
                <TextArea
                  rows={6}
                  placeholder="Tell me what you're building, the timeline and what you need from me."
                />
              </TextField>

              <Button
                type="submit"
                fullWidth
                isDisabled={status === "sending"}
                className="mt-5 h-11 rounded-lg grad-accent text-[13px] font-semibold text-accent-ink"
              >
                {status === "sending" ? (
                  <>
                    <Icon name="Loader" className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send message
                    <Icon name="Send" className="h-4 w-4" />
                  </>
                )}
              </Button>

              <p
                role="status"
                aria-live="polite"
                className={cn(
                  "mt-3 flex items-center justify-center gap-1.5 text-[12px]",
                  status === "error" ? "text-danger" : "text-success",
                  status === "idle" || status === "sending" ? "invisible" : "visible",
                )}
              >
                {status === "error" ? (
                  <Icon name="X" className="h-3.5 w-3.5" />
                ) : (
                  <Icon name="CheckCheck" className="h-3.5 w-3.5" />
                )}
                {message}
              </p>

              <p className="mt-1 text-center text-[11px] text-faint">
                Delivered straight to my inbox — no third-party forms.
              </p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
