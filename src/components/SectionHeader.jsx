/**
 * SectionHeader — reusable pill + heading + subtitle used by every section.
 * Props:
 *   icon    — FA icon class e.g. "fas fa-user"
 *   pill    — pill label text
 *   title   — heading JSX (can have <br/>)
 *   subtitle — paragraph text
 */
export default function SectionHeader({ icon, pill, title, subtitle }) {
  return (
    <div className="mb-16 reveal">
      <div className="inline-flex items-center gap-2 tag-pill border border-[var(--border-accent)] px-[14px] py-[5px] rounded-full text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-[var(--accent)] mb-4">
        <i className={icon} /> {pill}
      </div>
      <h2 className="font-syne text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold text-[var(--text-primary)] mb-4 leading-[1.15]">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[var(--text-secondary)] text-[1.05rem] leading-[1.65] max-w-[540px]">
          {subtitle}
        </p>
      )}
    </div>
  );
}
