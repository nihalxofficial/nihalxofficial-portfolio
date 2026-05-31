"use client";
import { useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import { SOCIAL_LINKS } from "@/data/portfolio";
import SuccessModal from "@/components/ui/SuccessModal";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useScroll";
import { useLenisReveal } from "@/hooks/useLenisReveal";

export default function Contact() {
  const infoRef = useLenisReveal<HTMLDivElement>({ distance: 60, viewportFraction: 0.35, staggerIndex: 0 });
  const formRef = useLenisReveal<HTMLDivElement>({ distance: 80, viewportFraction: 0.35, staggerIndex: 1 });

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast, showToast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: JSON.stringify({
            name: form.name,
            email: form.email,
            subject: form.subject,
            message: form.message
        })
      });

      if (response.ok) {
        setIsModalOpen(true);
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        showToast("Oops! Something went wrong. Please try again.", "error");
      }
    } catch (error) {
      showToast("Network error. Please try again later.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  return (
    <section
      id="contact"
      className="py-[100px]"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionHeader
          icon="fas fa-envelope"
          tag="Contact"
          title="Let's Work Together"
          subtitle="Have a project in mind? I'd love to hear about it. Send me a message and let's create something great."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 items-stretch">
          {/* Info card */}
          <div ref={infoRef} className="contact-card h-full flex flex-col will-change-transform" style={{ opacity: 0 }}>
            <h3
              className="font-syne text-[1.3rem] font-bold mb-7"
              style={{ color: "var(--text-primary)" }}
            >
              Get In Touch
            </h3>

            {/* Map Embed */}
            <div className="w-full h-[180px] rounded-[16px] overflow-hidden mb-7 border border-[var(--border)] relative bg-[var(--img-bg)]">
              <iframe 
                src="https://maps.google.com/maps?q=Baraiyarhat&t=&z=13&ie=UTF8&iwloc=&output=embed"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="map-theme-filter"
              />
            </div>

            {[
              { icon: "fas fa-envelope", label: "Email", value: "mdnihaluddinbijoy@gmail.com" },
              { icon: "fas fa-phone", label: "Phone", value: "+880 1745638680" },
            ].map((item, idx) => (
              <div
                key={item.label}
                className={`flex items-center gap-4 py-[14px] ${idx < 1 ? "contact-item-row" : "mb-7"}`}
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

            <div className="flex gap-[10px] mt-auto">
              {SOCIAL_LINKS.map((s) => (
                <a key={s.icon} href={s.href} className="social-link">
                  <i className={s.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Form card */}
          <div ref={formRef} className="contact-card h-full flex flex-col will-change-transform" style={{ opacity: 0 }}>
            <h3
              className="font-syne text-[1.3rem] font-bold mb-7"
              style={{ color: "var(--text-primary)" }}
            >
              Send a Message
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1">
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

              <button 
                type="submit" 
                className="btn-primary-custom w-full justify-center transition-all duration-300 mt-auto"
                disabled={isSubmitting}
                style={{ 
                  opacity: isSubmitting ? 0.8 : 1, 
                  cursor: isSubmitting ? "not-allowed" : "pointer" 
                }}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin mr-2" /> Sending...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2" /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <SuccessModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <Toast show={toast.show} msg={toast.msg} type={toast.type} />
    </section>
  );
}
