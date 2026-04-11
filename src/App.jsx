import './app.css';

// ── Contexts ──────────────────────────────────────────────────────────────
import { ThemeProvider }  from './context/ThemeContext';
import { ToastProvider }  from './context/ToastContext';
import { ModalProvider }  from './context/ModalContext';

// ── Hooks ─────────────────────────────────────────────────────────────────
import { useReveal }      from './hooks/useReveal';

// ── Components ────────────────────────────────────────────────────────────
import Navbar             from './components/Navbar';
import HeroSection         from './components/HeroSection';
import AboutSection        from './components/AboutSection';
import ServicesSection     from './components/ServicesSection';
import SkillsSection       from './components/SkillsSection';
import ProjectsSection     from './components/ProjectsSection';
import ProjectModal        from './components/ProjectModal';
import EducationSection    from './components/EducationSection';
import TestimonialsSection from './components/TestimonialsSection';
import BlogSection         from './components/BlogSection';
import ContactSection      from './components/ContactSection';
import Footer              from './components/Footer';
import BackToTop           from './components/BackToTop';

/**
 * AppContent — inner wrapper that can safely call hooks.
 * useReveal() sets up the IntersectionObserver for all .reveal* elements
 * after every render so newly mounted sections are observed.
 */
function AppContent() {
  // Attach scroll-reveal observer once on mount
  useReveal();

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <SkillsSection />
        <ProjectsSection />
        {/* <EducationSection /> */}
        {/* <TestimonialsSection /> */}
        {/* <BlogSection /> */}
        <ContactSection />
      </main>
      <Footer />

      {/* Global overlays / utilities */}
      <ProjectModal />   {/* reads ModalContext — renders when a project is opened */}
      <BackToTop />      {/* fixed bottom-right; visible after 400px scroll */}
    </>
  );
}

/**
 * App — wraps everything in the three context providers:
 *   ThemeProvider  → dark/light toggle, persisted to localStorage
 *   ToastProvider  → global toast notifications + renders the Toast UI
 *   ModalProvider  → project modal open/close state + PROJECTS data
 */
export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ModalProvider>
          <AppContent />
        </ModalProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
