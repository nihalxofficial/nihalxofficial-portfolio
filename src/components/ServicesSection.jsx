import SectionHeader from './SectionHeader';
import './ServicesSection.css';

const SERVICES = [
  { icon: 'fas fa-code',          title: 'Frontend Development',    desc: 'Building fast, responsive interfaces with React, Vue, Angular. Performance-first, accessible clean code.' },
  { icon: 'fas fa-paint-brush',   title: 'UI/UX Design',            desc: 'Intuitive, user-centered designs from wireframes to polished prototypes. Beautiful and functional.' },
  { icon: 'fas fa-mobile-alt',    title: 'Responsive Web Design',   desc: 'Pixel-perfect layouts on all devices with mobile-first CSS Grid and Flexbox techniques.' },
  { icon: 'fas fa-rocket',        title: 'Web Performance',         desc: 'Optimize load times, Core Web Vitals, and runtime performance for lightning-fast sites.' },
  { icon: 'fas fa-shopping-cart', title: 'E-Commerce Solutions',    desc: 'Custom shopping experiences with secure payments, inventory management, and smooth checkout flows.' },
  { icon: 'fas fa-headset',       title: 'Maintenance & Support',   desc: 'Ongoing updates, security patches, and proactive support to keep your site running smoothly.' },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-[100px]" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[1200px] mx-auto px-6">

        <SectionHeader
          icon="fas fa-cog"
          pill="Services"
          title="What I Can Do For You"
          subtitle="I offer a full range of frontend-focused services to help bring your digital vision to life."
        />

        {/* Stagger grid — CSS does the stagger animation via .reveal-stagger */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 reveal-stagger">
          {SERVICES.map(({ icon, title, desc }) => (
            <div className="service-card" key={title}>
              <div className="icon-box w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-[1.3rem] mb-5">
                <i className={icon} />
              </div>
              <h3 className="font-syne text-[1.1rem] font-bold mb-[10px] text-[var(--text-primary)]">{title}</h3>
              <p className="text-[var(--text-secondary)] text-[0.9rem] leading-[1.65]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
