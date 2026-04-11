import SectionHeader from './SectionHeader';
import './SkillsSection.css';

// Each skill card: header icon + category title + list of skills with level badge
const SKILL_GROUPS = [
  {
    icon: 'fab fa-js',
    category: 'Frontend',
    skills: [
      { name: 'React.js',     level: 'advanced' },
      { name: 'Vue.js',       level: 'advanced' },
      { name: 'TypeScript',   level: 'expert' },
      { name: 'HTML5 / CSS3', level: 'expert' },
      { name: 'Tailwind CSS', level: 'advanced' },
    ],
  },
  {
    icon: 'fas fa-server',
    category: 'Backend',
    skills: [
      { name: 'Node.js',    level: 'advanced' },
      { name: 'Express.js', level: 'advanced' },
      { name: 'Python',     level: 'intermediate' },
      { name: 'MongoDB',    level: 'intermediate' },
      { name: 'REST APIs',  level: 'expert' },
    ],
  },
  {
    icon: 'fas fa-tools',
    category: 'Tools',
    skills: [
      { name: 'Git / GitHub',  level: 'expert' },
      { name: 'Figma',         level: 'advanced' },
      { name: 'Jest / Testing',level: 'intermediate' },
      { name: 'Docker',        level: 'basic' },
      { name: 'Agile / Scrum', level: 'intermediate' },
    ],
  },
];

export default function SkillsSection() {
  return (
    <section id="skills" className="py-[100px] section-secondary">
      <div className="max-w-[1200px] mx-auto px-6">

        <SectionHeader
          icon="fas fa-layer-group"
          pill="Skills"
          title="My Technical Stack"
          subtitle="Technologies I work with daily, and the proficiency level I've reached through years of practice."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 reveal-stagger">
          {SKILL_GROUPS.map(({ icon, category, skills }) => (
            <div className="skill-card" key={category}>
              {/* Card header */}
              <div className="flex items-center gap-[14px] mb-6">
                <div className="icon-box w-12 h-12 rounded-xl flex items-center justify-center text-[1.2rem]">
                  <i className={icon} />
                </div>
                <h3 className="font-syne text-[1.05rem] font-bold text-[var(--text-primary)]">{category}</h3>
              </div>

              {/* Skill rows */}
              <ul className="list-none">
                {skills.map(({ name, level }, idx) => (
                  <li
                    key={name}
                    className={`flex justify-between items-center py-[10px] text-[0.9rem]${idx < skills.length - 1 ? ' skill-list-row' : ' text-[var(--text-secondary)]'}`}
                  >
                    {name}
                    <span className={`skill-level ${level}`}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
