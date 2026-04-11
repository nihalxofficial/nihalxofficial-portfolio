import { useState } from 'react';
import SectionHeader from './SectionHeader';
import { useModal, PROJECTS } from '../context/ModalContext';
import './ProjectsSection.css';

// Filter button labels and their matching tag strings
const FILTERS = [
  { label: 'All Projects', value: 'all' },
  { label: 'React',        value: 'React' },
  { label: 'Vue',          value: 'Vue' },
  { label: 'Next.js',      value: 'Next.js' },
  { label: 'Angular',      value: 'Angular' },
  { label: 'Python',       value: 'Python' },
  { label: 'Firebase',     value: 'Firebase' },
  { label: 'JavaScript',   value: 'JavaScript' },
];

// Each project card's metadata — tags must match FILTERS values for filtering
const PROJECT_CARDS = [
  { idx: 0, tags: ['React', 'TypeScript'], grad: 'g1', icon: 'fa-chart-line',    title: 'Finance Dashboard',   sub: 'Real-time analytics & data viz',     chips: ['React', 'TypeScript', 'D3.js'],         badges: ['React', 'TS'] },
  { idx: 1, tags: ['Vue', 'Firebase'],     grad: 'g2', icon: 'fa-shopping-cart', title: 'E-Commerce Platform', sub: 'Full-featured with payments',         chips: ['Vue', 'Firebase', 'Stripe'],            badges: ['Vue', 'Firebase'] },
  { idx: 2, tags: ['Next.js'],             grad: 'g3', icon: 'fa-tasks',         title: 'Project Management',  sub: 'Collaborative team tool',             chips: ['Next.js', 'Node', 'Postgres'],          badges: ['Next.js'] },
  { idx: 3, tags: ['React'],               grad: 'g4', icon: 'fa-mobile-alt',    title: 'Fitness Tracker',     sub: 'Cross-platform mobile app',           chips: ['React Native', 'Redux'],                badges: ['React Native'] },
  { idx: 4, tags: ['Python'],              grad: 'g5', icon: 'fa-blog',          title: 'Blog Platform',       sub: 'Full CMS with SEO',                   chips: ['Python', 'Django', 'PostgreSQL'],       badges: ['Python', 'Django'] },
  { idx: 5, tags: ['JavaScript'],          grad: 'g6', icon: 'fa-gamepad',       title: 'Browser Game',        sub: 'Multiplayer canvas game',             chips: ['JavaScript', 'Canvas API'],             badges: ['JS', 'Canvas'] },
  { idx: 6, tags: ['PHP'],                 grad: 'g7', icon: 'fa-address-book',  title: 'CRM System',          sub: 'Customer relation management',        chips: ['PHP', 'MySQL', 'Bootstrap'],            badges: ['PHP', 'MySQL'] },
  { idx: 7, tags: ['Angular', 'Firebase'], grad: 'g8', icon: 'fa-calendar-alt',  title: 'Event Manager',       sub: 'Smart event planning app',            chips: ['Angular', 'Firebase', 'Maps API'],      badges: ['Angular', 'Firebase'] },
];

export default function ProjectsSection() {
  const [activeFilter, setActiveFilter] = useState('all');
  const { openModal } = useModal();

  // A card is visible if filter is 'all' or the card's tags include the filter string
  const isVisible = (tags) => activeFilter === 'all' || tags.includes(activeFilter);

  return (
    <section id="projects" className="py-[100px]" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[1200px] mx-auto px-6">

        <SectionHeader
          icon="fas fa-folder-open"
          pill="Projects"
          title="Featured Work"
          subtitle="A selection of projects that showcase my skills across different domains and technologies."
        />

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-3 mb-10 reveal">
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              className={`filter-btn${activeFilter === value ? ' active' : ''}`}
              onClick={() => setActiveFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Project grid — reveal-stagger for CSS entrance animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[18px] reveal-stagger">
          {PROJECT_CARDS.map(({ idx, tags, grad, icon, title, sub, chips, badges }) => (
            <div
              key={idx}
              className="project-card"
              // Inline opacity transition mirrors original JS filter behaviour
              style={{
                display: isVisible(tags) ? '' : 'none',
                opacity: isVisible(tags) ? 1 : 0,
                transition: 'opacity 0.25s ease',
              }}
              onClick={() => openModal(idx)}
            >
              {/* Thumbnail */}
              <div className="relative h-[150px] flex items-center justify-center overflow-hidden">
                <div className={`project-thumb-bg ${grad}`} />
                {/* Tag badges top-left */}
                <div className="absolute top-[10px] left-[10px] z-[2] flex gap-[5px]">
                  {badges.map((b) => (
                    <span key={b} className="bg-black/60 text-white text-[0.7rem] px-[9px] py-[3px] rounded-full font-medium backdrop-blur-sm">
                      {b}
                    </span>
                  ))}
                </div>
                <i
                  className={`fas ${icon} relative z-[1] text-[2.8rem] text-white/90`}
                  style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}
                />
              </div>

              {/* Card body */}
              <div className="p-[18px_20px]">
                <h3 className="font-syne text-[1rem] font-bold text-[var(--text-primary)] mb-[6px]">{title}</h3>
                <p className="text-[0.83rem] text-[var(--text-muted)] mb-[14px]">{sub}</p>
                <div className="flex gap-[6px] flex-wrap">
                  {chips.map((c) => (
                    <span key={c} className="tag-pill text-[0.72rem] px-[10px] py-[3px] rounded-full font-medium">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
