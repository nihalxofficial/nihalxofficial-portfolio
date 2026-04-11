import SectionHeader from './SectionHeader';
import './EducationSection.css';

const DEGREES = [
  {
    icon: 'fas fa-graduation-cap',
    degree: 'B.Sc. Computer Science',
    years: '2016 – 2020',
    school: 'University of California, Berkeley',
    desc: 'Majored in Computer Science with a focus on Human-Computer Interaction and Web Systems. Graduated Cum Laude with a 3.8 GPA.',
  },
  {
    icon: 'fas fa-book-open',
    degree: 'Full-Stack Web Development',
    years: '2015 – 2016',
    school: 'App Academy (Bootcamp)',
    desc: 'Intensive 16-week program covering React, Node.js, PostgreSQL, and deployment pipelines. Built 5 full-stack capstone projects.',
  },
  {
    icon: 'fas fa-school',
    degree: 'High School Diploma — Science',
    years: '2012 – 2016',
    school: 'Lincoln High School, San Francisco',
    desc: "Excelled in Mathematics and Computer Science electives. Founded the school's first Coding Club.",
  },
];

const CERTS = [
  { icon: 'fab fa-aws',    iconColor: '',        title: 'AWS Certified Developer',       year: '2023', issuer: 'Amazon Web Services · Associate Level' },
  { icon: 'fab fa-js',     iconColor: '#f7df1e', title: 'JavaScript Algorithms & DS',    year: '2022', issuer: 'freeCodeCamp · 300 hrs' },
  { icon: 'fab fa-react',  iconColor: '#61dafb', title: 'React — The Complete Guide',    year: '2022', issuer: 'Udemy · Maximilian Schwarzmüller' },
  { icon: 'fab fa-google', iconColor: '#38bdf8', title: 'Google UX Design Certificate',  year: '2021', issuer: 'Google · Coursera · 6-course series' },
  { icon: 'fab fa-html5',  iconColor: '#ff3e00', title: 'Responsive Web Design',         year: '2020', issuer: 'freeCodeCamp · 300 hrs' },
];

export default function EducationSection() {
  return (
    <section id="education" className="py-[100px] section-secondary">
      <div className="max-w-[1200px] mx-auto px-6">

        <SectionHeader
          icon="fas fa-graduation-cap"
          pill="Education & Certs"
          title={<>Academic Background &<br />Certifications</>}
          subtitle="My formal education and professional certifications that back the work you see above."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* ── Left: Education Timeline ── */}
          <div>
            <h3 className="font-syne text-[1.1rem] font-bold text-[var(--text-primary)] mb-8 flex items-center gap-3 reveal">
              <span className="icon-box w-9 h-9 rounded-lg flex items-center justify-center text-[0.95rem]">
                <i className="fas fa-university" />
              </span>
              Education
            </h3>

            {/* edu-timeline adds the vertical gradient line via ::before pseudo */}
            <div className="edu-timeline flex flex-col gap-8 reveal-stagger">
              {DEGREES.map(({ icon, degree, years, school, desc }) => (
                <div key={degree} className="flex gap-5">
                  {/* Circle dot on the timeline line */}
                  <div className="edu-dot">
                    <i className={icon} />
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-start justify-between flex-wrap gap-2 mb-1">
                      <h4 className="font-syne font-bold text-[var(--text-primary)] text-[1rem]">{degree}</h4>
                      <span className="tag-pill text-[0.72rem] px-3 py-[3px] rounded-full font-semibold">{years}</span>
                    </div>
                    <p className="text-[var(--accent)] text-[0.88rem] font-semibold mb-1">{school}</p>
                    <p className="text-[var(--text-secondary)] text-[0.875rem] leading-[1.65]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Certifications ── */}
          <div>
            <h3 className="font-syne text-[1.1rem] font-bold text-[var(--text-primary)] mb-8 flex items-center gap-3 reveal">
              <span className="icon-box w-9 h-9 rounded-lg flex items-center justify-center text-[0.95rem]">
                <i className="fas fa-certificate" />
              </span>
              Certifications
            </h3>

            <div className="flex flex-col gap-4 reveal-stagger">
              {CERTS.map(({ icon, iconColor, title, year, issuer }) => (
                <div key={title} className="cert-card">
                  <div className="cert-icon" style={iconColor ? { color: iconColor } : {}}>
                    <i className={icon} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="font-syne font-bold text-[var(--text-primary)] text-[0.95rem]">{title}</p>
                      <span className="text-[0.72rem] font-semibold text-[var(--accent)]">{year}</span>
                    </div>
                    <p className="text-[var(--text-muted)] text-[0.8rem] mt-[2px]">{issuer}</p>
                  </div>
                  <i className="fas fa-external-link-alt text-[0.8rem] text-[var(--text-muted)] flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
