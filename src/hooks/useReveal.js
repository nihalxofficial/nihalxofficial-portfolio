import { useEffect } from 'react';

/**
 * useReveal — attaches an IntersectionObserver to all elements matching
 * the selectors .reveal, .reveal-stagger, .reveal-left, .reveal-right.
 *
 * When an element enters the viewport it gets the class "revealed",
 * which triggers the CSS transition defined in app.css.
 *
 * Call this once in App.jsx (or any top-level component) so it runs
 * after the full DOM is rendered.
 */
export function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            // Stop watching once revealed — no re-hide on scroll up
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    // Small delay so React has finished rendering all components
    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal, .reveal-stagger, .reveal-left, .reveal-right')
        .forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []); // Run once on mount
}
