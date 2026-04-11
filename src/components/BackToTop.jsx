import { useScrollEffects } from '../hooks/useScrollEffects';

/**
 * BackToTop — fixed button in bottom-right corner.
 * Visibility is controlled by useScrollEffects hook (showBtt state).
 */
export default function BackToTop() {
  const { showBtt } = useScrollEffects();

  const handleClick = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <a
      href="#"
      id="btt"
      className={`fixed bottom-7 right-7 z-50 w-11 h-11 rounded-xl flex items-center justify-center text-white no-underline text-[1rem]${showBtt ? ' visible' : ''}`}
      onClick={handleClick}
      aria-label="Back to top"
    >
      <i className="fas fa-arrow-up" />
    </a>
  );
}
