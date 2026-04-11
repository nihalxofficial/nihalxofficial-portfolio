import { useModal, PROJECTS } from '../context/ModalContext';
import './ProjectModal.css';

/**
 * ProjectModal — listens to ModalContext.activeIndex.
 * Renders nothing (display:none) when no project is selected.
 * Closes on: × button, backdrop click, Escape key (Escape handled in context).
 */
export default function ProjectModal() {
  const { activeIndex, closeModal } = useModal();

  // Close when clicking the backdrop (not the modal box itself)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closeModal();
  };

  const project = activeIndex !== null ? PROJECTS[activeIndex] : null;

  return (
    <div
      className={`modal-overlay${activeIndex !== null ? ' open' : ''}`}
      onClick={handleOverlayClick}
    >
      {project && (
        <div className="modal-box">
          {/* Header */}
          <div className="flex items-center justify-between px-7 py-5 border-b border-[var(--border)] gradient-bg">
            <h2 className="font-syne text-[1.2rem] text-white font-bold">{project.title}</h2>
            <button
              className="w-8 h-8 bg-white/20 border-none rounded-lg text-white cursor-pointer text-[1.1rem] flex items-center justify-center hover:bg-white/35 transition-colors"
              onClick={closeModal}
            >
              <i className="fas fa-times" />
            </button>
          </div>

          {/* Body */}
          <div className="p-7 overflow-y-auto flex-1">
            <div className="flex gap-7 flex-col md:flex-row">

              {/* Gradient thumbnail */}
              <div
                className={`w-full md:w-[260px] flex-shrink-0 aspect-[4/3] rounded-2xl flex items-center justify-center text-[4rem] text-white/90 ${project.grad}`}
              >
                <i
                  className={`fas ${project.icon}`}
                  style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}
                />
              </div>

              {/* Text content */}
              <div className="modal-content-text flex-1">
                <p>{project.desc}</p>

                <div className="text-[0.82rem] font-bold text-[var(--accent)] uppercase tracking-[0.06em] mb-[10px] mt-4">
                  Key Features
                </div>
                <ul className="modal-features">
                  {project.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>

                <div className="text-[0.82rem] font-bold text-[var(--accent)] uppercase tracking-[0.06em] mb-[10px]">
                  Technologies
                </div>
                <div className="flex flex-wrap gap-[7px] mb-6">
                  {project.tech.map((t) => (
                    <span key={t} className="tech-chip">{t}</span>
                  ))}
                </div>

                <div className="modal-actions">
                  <a href="#" className="btn-primary-custom" style={{ fontSize: '0.85rem', padding: '10px 20px' }}>
                    <i className="fab fa-github" /> View Code
                  </a>
                  <a href="#" className="btn-outline-custom" style={{ fontSize: '0.85rem', padding: '10px 20px' }}>
                    <i className="fas fa-external-link-alt" /> Live Demo
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
