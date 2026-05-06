"use client";
import { useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import { SOCIAL_LINKS } from "@/data/portfolio";

interface ContactProps {
  onSubmit: (msg: string) => void;
}

export default function Contact({ onSubmit }: ContactProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {

    // 2. Info Card Scrub (from left)
    gsap.from(".contact-info-card", {
      scrollTrigger: {
        trigger: ".contact-info-card",
        start: "top 90%",
        end: "top 50%",
        scrub: 1,
      },
      x: -100,
      opacity: 0,
    });

    // 3. Form Card Scrub (from right)
    gsap.from(".contact-form-card", {
      scrollTrigger: {
        trigger: ".contact-form-card",
        start: "top 90%",
        end: "top 50%",
        scrub: 1,
      },
      x: 100,
      opacity: 0,
    });
  }, { scope: ref });
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit("Message sent! I'll respond within 24 hours.");
    setForm({ name: "", email: "", subject: "", message: "" });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  return (
    <section
      id="contact"
      className="py-[100px]"
      style={{ background: "var(--bg-primary)" }}
      ref={ref}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionHeader
          icon="fas fa-envelope"
          tag="Contact"
          title="Let's Work Together"
          subtitle="Have a project in mind? I'd love to hear about it. Send me a message and let's create something great."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 items-start">
          {/* Info card */}
          <div className="contact-card h-full contact-info-card will-change-transform">
            <h3
              className="font-syne text-[1.3rem] font-bold mb-7"
              style={{ color: "var(--text-primary)" }}
            >
              Get In Touch
            </h3>

            {[
              { icon: "fas fa-envelope", label: "Email", value: "mdnihaluddinbijoy@gmail.com" },
              { icon: "fas fa-phone", label: "Phone", value: "+880 1745638680" },
              { icon: "fas fa-map-marker-alt", label: "Location", value: "Chattogram, Bangladesh" },
            ].map((item, idx) => (
              <div
                key={item.label}
                className={`flex items-center gap-4 py-[14px] ${idx < 2 ? "contact-item-row" : "mb-7"}`}
              >
                <div className="icon-box w-11 h-11 rounded-xl flex items-center justify-center text-[1rem] flex-shrink-0">
                  <i className={item.icon} />
                </div>
                <div>
                  <div
                    className="text-[0.78rem] mb-[2px] font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {item.label}
                  </div>
                  <div className="text-[0.9rem]" style={{ color: "var(--text-secondary)" }}>
                    {item.value}
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-[10px]">
              {SOCIAL_LINKS.map((s) => (
                <a key={s.icon} href={s.href} className="social-link">
                  <i className={s.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Form card */}
          <div className="contact-card contact-form-card will-change-transform">
            <h3
              className="font-syne text-[1.3rem] font-bold mb-7"
              style={{ color: "var(--text-primary)" }}
            >
              Send a Message
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    className="block text-[0.82rem] font-semibold mb-[7px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-[0.82rem] font-semibold mb-[7px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Your Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label
                  className="block text-[0.82rem] font-semibold mb-[7px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Project inquiry..."
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-[0.82rem] font-semibold mb-[7px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Message
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Tell me about your project..."
                  required
                />
              </div>

              <button type="submit" className="btn-primary-custom w-full justify-center">
                <i className="fas fa-paper-plane" /> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
