import { useToast } from '../context/ToastContext';
import SectionHeader from './SectionHeader';
import './ContactSection.css';

const CONTACT_ITEMS = [
  { icon: 'fas fa-envelope',        label: 'Email',    value: 'alex@example.com' },
  { icon: 'fas fa-phone',           label: 'Phone',    value: '+1 (555) 123-4567' },
  { icon: 'fas fa-map-marker-alt',  label: 'Location', value: 'San Francisco, CA', last: true },
];

const SOCIALS = [
  { icon: 'fab fa-github' },
  { icon: 'fab fa-linkedin-in' },
  { icon: 'fab fa-twitter' },
  { icon: 'fab fa-codepen' },
  { icon: 'fab fa-dribbble' },
];

export default function ContactSection() {
  const { showToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast("Message sent! I'll respond within 24 hours.");
    e.target.reset();
  };

  return (
    <section id="contact" className="py-[100px]" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[1200px] mx-auto px-6">

        <SectionHeader
          icon="fas fa-envelope"
          pill="Contact"
          title="Let's Work Together"
          subtitle="Have a project in mind? I'd love to hear about it. Send me a message and let's create something great."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 items-start reveal">

          {/* ── Left: contact info ── */}
          <div className="contact-card h-full">
            <h3 className="font-syne text-[1.3rem] font-bold text-[var(--text-primary)] mb-7">Get In Touch</h3>

            {CONTACT_ITEMS.map(({ icon, label, value, last }) => (
              <div
                key={label}
                className={`flex items-center gap-4 py-[14px]${!last ? ' contact-item-row' : ' mb-7'}`}
              >
                <div className="icon-box w-11 h-11 rounded-xl flex items-center justify-center text-[1rem] flex-shrink-0">
                  <i className={icon} />
                </div>
                <div>
                  <div className="text-[0.78rem] text-[var(--text-muted)] mb-[2px] font-medium">{label}</div>
                  <div className="text-[var(--text-secondary)] text-[0.9rem]">{value}</div>
                </div>
              </div>
            ))}

            {/* Social links */}
            <div className="flex gap-[10px]">
              {SOCIALS.map(({ icon }) => (
                <a key={icon} href="#" className="social-link" onClick={(e) => e.preventDefault()}>
                  <i className={icon} />
                </a>
              ))}
            </div>
          </div>

          {/* ── Right: contact form ── */}
          <div className="contact-card">
            <h3 className="font-syne text-[1.3rem] font-bold text-[var(--text-primary)] mb-7">Send a Message</h3>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[0.82rem] font-semibold text-[var(--text-secondary)] mb-[7px]">Your Name</label>
                  <input type="text" className="form-control" placeholder="John Doe" required />
                </div>
                <div>
                  <label className="block text-[0.82rem] font-semibold text-[var(--text-secondary)] mb-[7px]">Your Email</label>
                  <input type="email" className="form-control" placeholder="john@example.com" required />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-[0.82rem] font-semibold text-[var(--text-secondary)] mb-[7px]">Subject</label>
                <input type="text" className="form-control" placeholder="Project inquiry..." required />
              </div>
              <div className="mb-4">
                <label className="block text-[0.82rem] font-semibold text-[var(--text-secondary)] mb-[7px]">Message</label>
                <textarea className="form-control" placeholder="Tell me about your project..." required />
              </div>
              <button type="submit" className="btn-primary-custom w-full justify-center font-dm text-[0.95rem]">
                <i className="fas fa-paper-plane" /> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
