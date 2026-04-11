import SectionHeader from './SectionHeader';
import './TestimonialsSection.css';

// Star renderer helper
const Stars = ({ count, half = false }) => (
  <div className="flex gap-1 mb-4 relative z-[1]">
    {Array.from({ length: count }).map((_, i) => (
      <i key={i} className="fas fa-star text-[#f59e0b] text-[0.85rem]" />
    ))}
    {half && <i className="fas fa-star-half-alt text-[#f59e0b] text-[0.85rem]" />}
  </div>
);

const TESTIMONIALS = [
  {
    stars: 5,
    quote: 'Alex completely transformed our outdated website into a sleek, fast platform. The attention to detail and responsiveness throughout the project was outstanding. Delivered ahead of schedule!',
    initials: 'SR',
    gradient: 'linear-gradient(135deg,var(--accent),var(--accent-2))',
    name: 'Sarah Reynolds',
    role: 'CEO, Brightwave Digital',
  },
  {
    stars: 5,
    quote: 'Working with Alex was a pleasure from start to finish. The React dashboard he built cut our reporting time by 60%. Code quality is exceptional — well-structured, documented, and easy to maintain.',
    initials: 'MK',
    gradient: 'linear-gradient(135deg,#059669,#22d3ee)',
    name: 'Marcus Kim',
    role: 'CTO, FinTrack Analytics',
  },
  {
    stars: 4, half: true,
    quote: 'Our e-commerce conversion rate jumped 34% after Alex redesigned the checkout flow. He brings both strong technical skills and real product thinking. Will definitely work with him again.',
    initials: 'LP',
    gradient: 'linear-gradient(135deg,#ea580c,#f59e0b)',
    name: 'Laura Park',
    role: 'Head of Product, ShopNest',
  },
  {
    stars: 5,
    quote: "Alex's deep knowledge of performance optimization is rare. He brought our Lighthouse score from 52 to 96. The site now loads in under 1.2s globally. An absolute pro.",
    initials: 'DJ',
    gradient: 'linear-gradient(135deg,#7c3aed,#6366f1)',
    name: 'Daniel Johnson',
    role: 'Engineering Lead, Velocity SaaS',
  },
  {
    stars: 5,
    quote: 'Hired Alex to build a Vue.js component library for our design system. The output was clean, well-tested, and the Storybook docs were incredibly thorough. Highly recommend!',
    initials: 'AT',
    gradient: 'linear-gradient(135deg,#0891b2,#22d3ee)',
    name: 'Aisha Thompson',
    role: 'Design Systems Lead, Corevo',
  },
  {
    stars: 5,
    quote: 'Our startup needed a polished MVP in 6 weeks — Alex delivered it in 5. Investors were impressed by the UI quality. His communication and ability to translate business needs into code is top-tier.',
    initials: 'RN',
    gradient: 'linear-gradient(135deg,#be185d,#f43f5e)',
    name: 'Ryan Nguyen',
    role: 'Co-founder, Launchpad AI',
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-[100px]" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[1200px] mx-auto px-6">

        <SectionHeader
          icon="fas fa-quote-left"
          pill="Testimonials"
          title="What Clients Say"
          subtitle="Kind words from people I've had the pleasure of working with."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 reveal-stagger">
          {TESTIMONIALS.map(({ stars, half, quote, initials, gradient, name, role }) => (
            <div key={name} className="testimonial-card">
              {/* Stars */}
              <Stars count={stars} half={half} />

              {/* Quote body */}
              <p className="text-[var(--text-secondary)] text-[0.9rem] leading-[1.72] mb-6 relative z-[1]">
                {quote}
              </p>

              {/* Author row */}
              <div className="flex items-center gap-3">
                <div className="testimonial-avatar" style={{ background: gradient }}>
                  {initials}
                </div>
                <div>
                  <p className="font-syne font-bold text-[var(--text-primary)] text-[0.9rem]">{name}</p>
                  <p className="text-[var(--text-muted)] text-[0.78rem]">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
