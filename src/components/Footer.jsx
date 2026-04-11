import './Footer.css';

function scrollTo(id) {
  const el = document.querySelector(id);
  if (el) window.scrollTo({ top: el.offsetTop - 68, behavior: 'smooth' });
}

const LINKS = [
  { href: '#home',      label: 'Home' },
  { href: '#about',     label: 'About' },
  { href: '#services',  label: 'Services' },
  { href: '#skills',    label: 'Skills' },
  { href: '#projects',  label: 'Projects' },
  // { href: '#education', label: 'Education' },
  // { href: '#blog',      label: 'Blog' },
  { href: '#contact',   label: 'Contact' },
];

export default function Footer() {
  return (
    <footer
      className="py-12"
      style={{ background: 'var(--bg-primary)', borderTop: '1px solid var(--border)', transition: 'background 0.5s' }}
    >
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col items-center gap-6">
        <div className="font-syne text-[1.5rem] font-extrabold gradient-text">Alex Morgan</div>

        <div className="flex gap-6 flex-wrap justify-center">
          {LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={(e) => { e.preventDefault(); scrollTo(href); }}
              className="text-[var(--text-muted)] no-underline text-[0.88rem] hover:text-[var(--accent)] transition-colors duration-200"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="text-[var(--text-muted)] text-[0.83rem]">
          © 2024 Alex Morgan. Crafted with{' '}
          <i className="fas fa-heart" style={{ color: '#ef4444', fontSize: '0.8em' }} />{' '}
          All rights reserved.
        </div>
      </div>
    </footer>
  );
}
