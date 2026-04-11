import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

// Smooth scroll helper — scrolls to section minus nav height
function scrollTo(id) {
  const el = document.querySelector(id);
  if (el) window.scrollTo({ top: el.offsetTop - 68, behavior: 'smooth' });
}

const NAV_LINKS = [
  { href: '#home',      label: 'Home' },
  { href: '#about',     label: 'About' },
  { href: '#services',  label: 'Services' },
  { href: '#skills',    label: 'Skills' },
  { href: '#projects',  label: 'Projects' },
  // { href: '#education', label: 'Education' },
  // { href: '#blog',      label: 'Blog' },
  { href: '#contact',   label: 'Contact' },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLink = (href) => {
    scrollTo(href);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Scroll progress bar (positioned fixed, updated by useScrollEffects) */}
      <div id="scroll-progress" />

      <nav className="fixed top-0 w-full z-[100] backdrop-blur-xl">
        <div className="max-w-[1200px] mx-auto px-6 h-[68px] flex items-center justify-between">

          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => { e.preventDefault(); handleLink('#home'); }}
            className="font-syne font-extrabold text-[1.4rem] gradient-text no-underline"
          >
            nihalxofficial
          </a>

          {/* Desktop links */}
          <ul className="hidden lg:flex items-center gap-1 list-none">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={(e) => { e.preventDefault(); handleLink(href); }}
                  className="text-[var(--text-secondary)] no-underline px-[14px] py-2 rounded-lg text-[0.9rem] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--tag-bg)] transition-all duration-200"
                >
                  {label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#contact"
                onClick={(e) => { e.preventDefault(); handleLink('#contact'); }}
                className="nav-cta no-underline flex items-center gap-2"
              >
                <i className="fas fa-briefcase" /> Hire Me
              </a>
            </li>
          </ul>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Theme toggle pill */}
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              <div className="toggle-thumb">
                <i className={`fas ${theme === 'dark' ? 'fa-moon' : 'fa-sun'}`} />
              </div>
            </button>

            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden bg-transparent border-none text-[var(--text-primary)] text-[1.3rem] cursor-pointer p-2"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menu"
            >
              <i className="fas fa-bars" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile nav drawer */}
      <div className={`mobile-nav${mobileOpen ? ' open' : ''}`}>
        {NAV_LINKS.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            onClick={(e) => { e.preventDefault(); handleLink(href); }}
          >
            {label}
          </a>
        ))}
      </div>
    </>
  );
}
