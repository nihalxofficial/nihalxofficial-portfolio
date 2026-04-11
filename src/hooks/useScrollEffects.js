import { useEffect, useState } from 'react';

/**
 * useScrollEffects — handles:
 *  1. Scroll progress bar width (updates #scroll-progress element directly for perf)
 *  2. Back-to-top button visibility
 *
 * Returns { showBtt } — a boolean that Navbar/BackToTop components read.
 */
export function useScrollEffects() {
  const [showBtt, setShowBtt] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // --- Progress bar ---
      const scrollTop  = window.pageYOffset;
      const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
      const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      const bar        = document.getElementById('scroll-progress');
      if (bar) bar.style.width = pct + '%';

      // --- Back-to-top visibility ---
      setShowBtt(scrollTop > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { showBtt };
}
