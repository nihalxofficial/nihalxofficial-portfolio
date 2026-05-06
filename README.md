# Md. Nihal Uddin — Portfolio (Next.js 14)

A pixel-perfect Next.js 14 conversion of the original HTML portfolio.
Same design, same colors, same animations — built with Next.js 14, TypeScript, Tailwind CSS v3, and HeroUI.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Project Structure

```
portfolio/
├── app/
│   ├── layout.tsx           ← Root layout (ThemeProvider + ModalProvider)
│   ├── page.tsx             ← Main page (assembles all sections)
│   └── globals.css          ← All CSS variables, dark/light theme, card styles
├── context/
│   ├── ThemeContext.tsx     ← Dark/light theme via Context API
│   └── ModalContext.tsx     ← Project modal state via Context API
├── hooks/
│   ├── useTypewriter.ts     ← Typewriter animation hook
│   ├── useReveal.ts         ← IntersectionObserver scroll-reveal hook
│   └── useScroll.ts         ← Progress bar, back-to-top, toast hooks
├── data/
│   └── portfolio.ts         ← ALL site data (projects, skills, blog, etc.)
└── components/
    ├── ui/
    │   ├── Navbar.tsx        ← Responsive nav + theme toggle pill
    │   ├── ProjectModal.tsx  ← HeroUI Modal for project details
    │   ├── ScrollProgress.tsx
    │   ├── BackToTop.tsx
    │   ├── Toast.tsx
    │   └── SectionHeader.tsx ← Reusable section heading
    └── sections/
        ├── Hero.tsx
        ├── About.tsx
        ├── Services.tsx
        ├── Skills.tsx
        ├── Projects.tsx      ← With filter tabs
        ├── Education.tsx     ← Timeline + certifications
        ├── Testimonials.tsx
        ├── Blog.tsx
        ├── Contact.tsx
        └── Footer.tsx
```

## Customization

Edit data/portfolio.ts to update all text, projects, skills, and links.
Edit app/globals.css CSS variables to change colors.
