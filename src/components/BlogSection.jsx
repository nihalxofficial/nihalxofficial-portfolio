import SectionHeader from './SectionHeader';
import './BlogSection.css';

const POSTS = [
  {
    thumbClass: 'b1',
    icon: 'fas fa-bolt',
    tag: 'Performance',
    date: 'Mar 2024 · 8 min read',
    title: 'How I Brought a React App from a 52 to 96 Lighthouse Score',
    desc: 'A step-by-step breakdown of code splitting, lazy loading, image optimization, and caching strategies that made a real-world app blazing fast.',
  },
  {
    thumbClass: 'b2',
    icon: 'fas fa-layer-group',
    tag: 'Architecture',
    date: 'Jan 2024 · 12 min read',
    title: 'Building a Scalable Design System with Vue 3 and Storybook',
    desc: 'How to structure a component library that scales across multiple products — tokens, documentation, versioning, and team adoption strategies.',
  },
  {
    thumbClass: 'b3',
    icon: 'fas fa-user-astronaut',
    tag: 'Career',
    date: 'Nov 2023 · 6 min read',
    title: 'From Bootcamp to Senior Dev in 4 Years: What Actually Worked',
    desc: 'The honest lessons — including the mistakes — from my journey from bootcamp graduate to senior frontend engineer at a Series B startup.',
  },
];

export default function BlogSection() {
  return (
    <section id="blog" className="py-[100px] section-secondary">
      <div className="max-w-[1200px] mx-auto px-6">

        <SectionHeader
          icon="fas fa-pen-nib"
          pill="Blog"
          title="Latest Articles"
          subtitle="Sharing what I learn — React patterns, performance tips, and career advice for developers."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 reveal-stagger">
          {POSTS.map(({ thumbClass, icon, tag, date, title, desc }) => (
            <div key={title} className="blog-card">
              {/* Thumbnail */}
              <div className="blog-thumb">
                <div className={`blog-thumb-bg ${thumbClass}`} />
                <i
                  className={`${icon} relative z-[1] text-[2.2rem] text-white/90`}
                  style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}
                />
              </div>

              {/* Card body */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="tag-pill text-[0.72rem] px-3 py-[3px] rounded-full font-semibold">{tag}</span>
                  <span className="text-[0.75rem] text-[var(--text-muted)]">{date}</span>
                </div>
                <h3 className="font-syne font-bold text-[var(--text-primary)] text-[1rem] leading-[1.35] mb-3">{title}</h3>
                <p className="text-[var(--text-secondary)] text-[0.875rem] leading-[1.65] mb-4">{desc}</p>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="inline-flex items-center gap-2 text-[var(--accent)] font-semibold text-[0.875rem] hover:gap-3 transition-all duration-200"
                >
                  Read Article <i className="fas fa-arrow-right text-[0.75rem]" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
