"use client";
import { useState, useRef, useEffect } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import { motion, AnimatePresence } from "framer-motion";
import { SKILL_CATEGORIES } from "@/data/portfolio";
import * as SiIcons from "react-icons/si";
import * as FaIcons from "react-icons/fa";
import * as Fa6Icons from "react-icons/fa6";
import { useLenisReveal } from "@/hooks/useLenisReveal";

// Custom SVG: Neon Database logo (stylized N)
function NeonIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const color = (style?.color as string) ?? "#00E5BF";
  return (
    <svg
      className={className}
      style={{ ...style, color: undefined }}
      viewBox="0 0 25 25"
      width="1em"
      height="1em"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Neon"
    >
      {/* Neon "N" logomark */}
      <path
        d="M2 2h5.5L20 18.5V23H14.5L2 6.5V2Z"
        fill={color}
      />
      <path
        d="M14.5 2H20v15.5L14.5 12V2Z"
        fill={color}
        opacity="0.45"
      />
      <path
        d="M2 8.5 7.5 14V23H2V8.5Z"
        fill={color}
        opacity="0.45"
      />
    </svg>
  );
}

// A safe dynamic dispatcher for technology icons supporting Simple Icons, FontAwesome, and standard classes
function SkillIcon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  // Custom icon overrides
  if (name === "NeonCustom") {
    return <NeonIcon className={className} style={style} />;
  }
  if (name.startsWith("Si")) {
    const Icon = (SiIcons as any)[name];
    if (Icon) return <Icon className={className} style={style} />;
  }
  if (name.startsWith("Fa")) {
    const Icon = (FaIcons as any)[name] || (Fa6Icons as any)[name];
    if (Icon) return <Icon className={className} style={style} />;
  }
  return <i className={`${name} ${className}`} style={style} />;
}

export default function Skills() {
  const [activeTab, setActiveTab] = useState("All Stack");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(16);
  const containerRef = useRef<HTMLElement>(null);

  // Flatten and deduplicate skills for the "All Stack" view
  const allSkills = Array.from(
    new Map(
      SKILL_CATEGORIES.flatMap((cat) => cat.skills).map((skill) => [skill.name, skill])
    ).values()
  );

  const displayedSkills = activeTab === "All Stack"
    ? allSkills
    : SKILL_CATEGORIES.find((cat) => cat.title === activeTab)?.skills || [];

  // Reset page to 1 whenever active tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Dynamically calculate responsive capacity for exactly 2 lines (compact layout)
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setItemsPerPage(16); // xl: 8 columns * 2 lines = 16 items
      } else if (width >= 1024) {
        setItemsPerPage(12); // lg: 6 columns * 2 lines = 12 items
      } else if (width >= 768) {
        setItemsPerPage(10); // md: 5 columns * 2 lines = 10 items
      } else if (width >= 640) {
        setItemsPerPage(8);  // sm: 4 columns * 2 lines = 8 items
      } else {
        setItemsPerPage(6);  // xs: 3 columns * 2 lines = 6 items
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Pagination bounds
  const totalPages = Math.ceil(displayedSkills.length / itemsPerPage);
  const paginatedSkills = displayedSkills.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    const element = document.getElementById("skills");
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 68,
        behavior: "smooth",
      });
      setTimeout(() => {
        setCurrentPage(page);
      }, 400);
    } else {
      setCurrentPage(page);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "expert":
        return "#22c55e"; // green
      case "advanced":
        return "#6366f1"; // indigo
      case "intermediate":
        return "#f59e0b"; // amber
      case "basic":
      default:
        return "#64748b"; // slate
    }
  };

  const tabsRef = useLenisReveal<HTMLDivElement>({ distance: 30, viewportFraction: 0.35, staggerIndex: 0 });
  const gridRef = useLenisReveal<HTMLDivElement>({ distance: 40, viewportFraction: 0.35, staggerIndex: 1 });

  return (
    <section 
      id="skills" 
      className="py-[100px] section-secondary overflow-hidden" 
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="skills-reveal">
          <SectionHeader
            icon="fas fa-layer-group"
            tag="Skills"
            title="My Technical Stack"
            subtitle="Technologies I work with daily, and the proficiency level I've reached through years of practice."
          />
        </div>

        {/* Dynamic Category Filtering Tabs */}
        <div ref={tabsRef} className="flex flex-wrap gap-3 justify-center mb-12 will-change-transform" style={{ opacity: 0 }}>
          {["All Stack", "Frontend", "Backend", "Tools"].map((tab) => (
            <button
              key={tab}
              className={`filter-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Visual Interactive High-Density Grid */}
        <motion.div 
          ref={gridRef}
          layout 
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4 will-change-transform"
          style={{ opacity: 0 }}
        >
          <AnimatePresence mode="popLayout">
            {paginatedSkills.map((skill) => {
              const accentColor = skill.color || "var(--accent)";
              return (
                <motion.div
                  layout
                  key={skill.name}
                  initial={{ opacity: 0, scale: 0.85, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: -15 }}
                  whileHover={{ 
                    y: -5, 
                    scale: 1.03,
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                  transition={{ 
                    duration: 0.35, 
                    type: "spring", 
                    bounce: 0.15,
                    layout: { type: "spring", stiffness: 220, damping: 26 }
                  }}
                  className="skill-logo-card group relative p-2.5 sm:p-4 rounded-[12px] sm:rounded-[16px] bg-[var(--bg-card)] border border-[var(--border)] flex flex-col items-center justify-center cursor-pointer will-change-transform"
                  style={{
                    "--brand-color": accentColor,
                    "--brand-glow": `${accentColor}26`, // 15% opacity hex
                  } as React.CSSProperties}
                >
                  {/* Decorative glowing background layer */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[12px] sm:rounded-[16px] pointer-events-none"
                    style={{
                      background: `radial-gradient(circle 50px at 50% 50%, ${accentColor}10, transparent 70%)`
                    }}
                  />

                  {/* Icon Container */}
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] transition-all duration-300 group-hover:border-[var(--brand-color)] group-hover:scale-105 group-hover:shadow-[0_0_12px_var(--brand-glow)]">
                    <SkillIcon 
                      name={skill.icon || "FaCode"} 
                      className="text-[1.2rem] sm:text-[1.5rem] transition-transform duration-500 group-hover:rotate-[8deg]" 
                      style={{ color: accentColor }}
                    />
                  </div>

                  {/* Technology Title */}
                  <h3 className="font-syne text-[0.72rem] sm:text-[0.85rem] font-bold text-center tracking-wide mb-1.5 sm:mb-2.5 transition-colors duration-300 group-hover:text-[var(--brand-color)]">
                    {skill.name}
                  </h3>

                  {/* Proficiency Level Indicator */}
                  <div className="flex items-center gap-1.2 sm:gap-1.5 mt-auto">
                    <span 
                      className="w-[4.5px] h-[4.5px] sm:w-[5.5px] h-[5.5px] rounded-full transition-transform duration-300 group-hover:scale-125"
                      style={{ 
                        backgroundColor: getLevelColor(skill.level),
                        boxShadow: `0 0 6px ${getLevelColor(skill.level)}`
                      }}
                    />
                    <span className="text-[0.58rem] sm:text-[0.65rem] font-bold text-[var(--text-secondary)] uppercase tracking-wider group-hover:text-[var(--text-primary)] transition-colors duration-300">
                      {skill.level}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Dynamic Pagination Controls */}
        {totalPages > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 mt-12"
          >
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-full font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed text-[0.85rem]"
              style={{ background: "var(--tag-bg)", color: "var(--text-primary)" }}
            >
              <i className="fas fa-chevron-left mr-2" /> Prev
            </button>
            
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-9 h-9 rounded-full font-medium flex items-center justify-center transition-all text-[0.85rem] ${
                    currentPage === i + 1 ? "bg-[var(--accent)] text-white shadow-[0_0_15px_var(--accent-glow)]" : "bg-[var(--tag-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-full font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed text-[0.85rem]"
              style={{ background: "var(--tag-bg)", color: "var(--text-primary)" }}
            >
              Next <i className="fas fa-chevron-right mr-2" />
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
