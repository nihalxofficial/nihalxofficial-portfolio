import { useTypewriter } from '../hooks/useTypewriter';
import { useToast } from '../context/ToastContext';
import './HeroSection.css';
import heroImg from "../assets/md-nihal-uddin-github.png"

// Smooth scroll helper
function scrollTo(id) {
  const el = document.querySelector(id);
  if (el) window.scrollTo({ top: el.offsetTop - 68, behavior: 'smooth' });
}

export default function HeroSection() {
  const displayed = useTypewriter(); // current typewriter string
  const { showToast } = useToast();

  return (
    <section id="home" className="min-h-screen flex items-center pt-[68px] relative overflow-hidden">
      {/* Animated grid background */}
      <div className="hero-grid-bg" />

      <div className="max-w-[1200px] mx-auto px-6 py-20 flex items-center gap-[60px] relative z-[1] w-full flex-col lg:flex-row">

        {/* ── Left: text content ── */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">

          {/* "Available" badge */}
          <div className="inline-flex items-center gap-2 tag-pill border border-[var(--border-accent)] px-4 py-[6px] rounded-full text-[0.82rem] font-medium mb-7 animate-fadeInUp">
            <span className="w-[7px] h-[7px] rounded-full bg-[var(--accent-2)] animate-pulse2" />
            Available for work
          </div>

          {/* Heading */}
          <h1 className="font-syne text-[clamp(2.6rem,5vw,4rem)] font-extrabold leading-[1.1] mb-5 animate-fadeInUp1">
            Hi, I'm <span className="gradient-text">Md. Nihal Uddin</span>
          </h1>

          {/* Typewriter role */}
          <div className="text-[1.3rem] text-[var(--text-secondary)] mb-6 min-h-[40px] flex items-center gap-1 animate-fadeInUp2">
            <span className="text-[var(--accent)] font-semibold">{displayed}</span>
            <span className="inline-block w-[2px] h-[1.3rem] bg-[var(--accent-2)] animate-blink" />
          </div>

          {/* Tagline */}
          <p className="text-[var(--text-secondary)] leading-[1.7] max-w-[520px] mb-10 text-[1.05rem] animate-fadeInUp3">
            I build beautiful, high-performance web applications & mobile apps using modern technologies. As a MERN Stack developer, I specialize in React, Next.js, and responsive design to create seamless user experiences.
          </p>

          {/* CTA buttons */}
          <div className="flex gap-[14px] flex-wrap animate-fadeInUp4 justify-center lg:justify-start">
            <a
              href="#projects"
              onClick={(e) => { e.preventDefault(); scrollTo('#projects'); }}
              className="btn-primary-custom"
            >
              <i className="fas fa-code" /> View Projects
            </a>
            <a
              href="#contact"
              onClick={(e) => { e.preventDefault(); scrollTo('#contact'); }}
              className="btn-outline-custom"
            >
              <i className="fas fa-paper-plane" /> Contact Me
            </a>
          </div>

          {/* Stats strip */}
          <div className="flex gap-8 mt-12 pt-10 border-t border-[var(--border)] animate-fadeInUp5 justify-center lg:justify-start flex-wrap">
            {[
              { num: '4+',  label: 'Years of experience' },
              { num: '30+', label: 'Projects delivered' },
              { num: '20+', label: 'Happy clients' },
            ].map(({ num, label }) => (
              <div key={label}>
                <div className="font-syne text-[2rem] font-extrabold text-[var(--text-primary)] leading-none">{num}</div>
                <div className="text-[0.82rem] text-[var(--text-muted)] mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: avatar with floating badges ── */}
        <div className="flex justify-center items-center animate-fadeInRight order-first lg:order-last">
          <div className="relative inline-block">
            <div className="hero-avatar ">
              {/* <i className="fas fa-user-tie" /> */}
              <img src={heroImg} alt=""  className=''/>
            </div>
            <div className="floating-badge animate-float" style={{ bottom: '-16px', left: '-20px' }}>
              <span className="dot" /> Open to work
            </div>
            <div className="floating-badge animate-float-delay" style={{ top: '-16px', right: '-20px' }}>
              <i className="fas fa-star" style={{ color: '#f59e0b', fontSize: '12px' }} /> Top Rated Dev
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
