import SectionHeader from './SectionHeader';
import { useToast } from '../context/ToastContext';
import './AboutSection.css';
import aboutImg from "../assets/md-nihal-uddin-removebg-preview.png"

const HIGHLIGHTS = [
  { strong: '4+ years',       rest: 'professional web development' },
  { strong: '30+ projects',   rest: 'for clients worldwide' },
  { strong: 'React & Next.js', rest: 'expert' },
  { strong: 'UI/UX principles', rest: 'strong foundation' },
  { strong: 'Fortune 500',    rest: 'startups & enterprise clients' },
  { strong: 'Open-source',    rest: 'contributor' },
];

export default function AboutSection() {
  const { showToast } = useToast();

  const handleDownload = () => showToast('Resume download starting…');

  return (
    <section id="about" className="py-[100px] section-secondary">
      <div className="max-w-[1200px] mx-auto px-6">

        <SectionHeader
          icon="fas fa-user"
          pill="About"
          title={<>Passionate Developer.<br />Creative Problem Solver.</>}
          subtitle="A bit about my journey, skills, and what drives me to build amazing digital experiences."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-[72px] items-center">

          {/* Avatar column */}
          <div className="relative max-w-[320px] mx-auto lg:mx-0 reveal-left">
            <div className="about-avatar">
              {/* <i className="fas fa-user-astronaut" /> */}
              <img src={aboutImg} alt="" />
            </div>
            {/* Experience badge overlay */}
            <div className="absolute -bottom-5 -right-5 gradient-bg text-white p-4 rounded-2xl text-center shadow-[0_8px_24px_var(--accent-glow)]">
              <div className="font-syne text-[2rem] font-extrabold leading-none">5+</div>
              <div className="text-[0.72rem] opacity-90 mt-[2px]">Years Experience</div>
            </div>
          </div>

          {/* Bio column */}
          <div className="reveal-right">
            <p className="text-[var(--text-secondary)] leading-[1.75] mb-5">
              I'm a passionate Frontend Developer with 4+ years of experience creating exceptional digital experiences. My journey started during computer science studies, and I've been in love with the craft ever since.
            </p>
            <p className="text-[var(--text-secondary)] leading-[1.75] mb-5">
              I specialize in building responsive, user-friendly web applications using React, Next.js and TypeScript. I believe that great design and rock-solid functionality should always go hand in hand.
            </p>
            <p className="text-[var(--text-secondary)] leading-[1.75] mb-5">
              When not coding, I explore new technologies, contribute to open-source or share knowledge via blog posts and tech talks.
            </p>

            {/* Highlight bullets */}
            <ul className="list-none grid grid-cols-1 sm:grid-cols-2 gap-3 my-7">
              {HIGHLIGHTS.map(({ strong, rest }) => (
                <li key={strong} className="flex items-center gap-[10px] text-[var(--text-secondary)] text-[0.9rem] font-medium before:content-['▹'] before:text-[var(--accent)] before:flex-shrink-0">
                  <strong className="text-[var(--text-primary)]">{strong}</strong> {rest}
                </li>
              ))}
            </ul>

            <button onClick={handleDownload} className="btn-primary-custom mt-2 font-dm">
              <i className="fas fa-download" /> Download Resume
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
