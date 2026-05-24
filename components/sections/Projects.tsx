"use client";
import { useState, useRef } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import { PROJECTS, FILTER_TAGS } from "@/data/portfolio";
import { useModal } from "@/context/ModalContext";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { motion, AnimatePresence } from "framer-motion";

export default function Projects() {
  const { openModal } = useModal();
  const [activeFilter, setActiveFilter] = useState("All Projects");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const containerRef = useRef<HTMLElement>(null);

  // Filter projects and keep track of original index
  const filteredProjects = PROJECTS
    .map((p, idx) => ({ ...p, originalIdx: idx }))
    .filter((p) => activeFilter === "All Projects" || p.tags.includes(activeFilter));

  // Pagination logic
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterClick = (tag: string) => {
    setActiveFilter(tag);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    const element = document.getElementById("projects");
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

  useGSAP(() => {
    // Initial reveal animation for the section
    gsap.from(".projects-reveal", {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        end: "top 50%",
        scrub: 1,
      },
      y: 40,
      opacity: 0,
      stagger: 0.1,
      ease: "power3.out",
    });

    // Card scrub animation (fade and scale up on scroll)
    const cards = gsap.utils.toArray(".project-card");
    cards.forEach((card: any) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 95%",
          end: "top 75%",
          scrub: 1,
        },
        y: 60,
        opacity: 0,
        scale: 0.95,
      });
    });
  }, { scope: containerRef, dependencies: [currentPage, activeFilter] });

  return (
    <section
      id="projects"
      className="py-[100px]"
      style={{ background: "var(--bg-primary)" }}
      ref={containerRef}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionHeader
          icon="fas fa-folder-open"
          tag="Projects"
          title="Featured Work"
          subtitle="A selection of projects that showcase my skills across different domains and technologies."
        />

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-3 mb-10 projects-reveal">
          {FILTER_TAGS.map((tag) => (
            <button
              key={tag}
              className={`filter-btn ${activeFilter === tag ? "active" : ""}`}
              onClick={() => handleFilterClick(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Projects grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[24px]">
          <AnimatePresence mode="popLayout">
            {paginatedProjects.map((project) => (
              <motion.div
                layout
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                key={`${project.title}-${project.originalIdx}`}
                className="project-card group cursor-pointer will-change-transform"
                onClick={() => openModal(project.originalIdx)}
              >
                {/* Thumbnail */}
                <div className="relative h-[180px] flex items-center justify-center overflow-hidden rounded-t-[14px]">
                  <div className={`project-thumb-bg ${project.grad} absolute inset-0 transition-transform duration-500 group-hover:scale-110`} />
                  
                  {/* Glassmorphism Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-opacity duration-300 z-10 flex items-center justify-center">
                    <span className="bg-gradient-to-r from-blue-600 to-blue-400 text-white border border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:from-blue-500 hover:to-blue-300 hover:shadow-[0_0_25px_rgba(59,130,246,0.9)] px-6 py-2.5 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 tracking-wide">
                      View Details
                    </span>
                  </div>

                    {/* Tag badges */}
                    <div className="absolute top-[12px] left-[12px] z-[2] flex gap-[6px]">
                      {project.tagBadges.map((b) => (
                        <span
                          key={b}
                          className="text-white text-[0.7rem] px-[10px] py-[4px] rounded-full font-medium backdrop-blur-md"
                          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                    
                    <i
                      className={`${project.icon} relative z-[1] text-[3rem] text-white/90 transition-transform duration-500 group-hover:scale-110`}
                      style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))" }}
                    />
                  </div>

                  {/* Info */}
                  <div className="p-[20px] bg-[var(--card-bg)] border-t border-[var(--border)] transition-colors duration-300 group-hover:bg-[var(--tag-bg)] rounded-b-[14px]">
                    <h3
                      className="font-syne text-[1.1rem] font-bold mb-[8px] transition-colors duration-300 group-hover:text-[var(--accent)]"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {project.title}
                    </h3>
                    <p className="text-[0.85rem] mb-[16px] line-clamp-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      {project.desc}
                    </p>
                    <div className="flex gap-[8px] flex-wrap">
                      {project.chips.map((chip) => (
                        <span
                          key={chip}
                          className="tag-pill text-[0.7rem] px-[12px] py-[4px] rounded-full font-semibold tracking-wide"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 mt-14"
          >
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-full font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: "var(--tag-bg)", color: "var(--text-primary)" }}
            >
              <i className="fas fa-chevron-left mr-2" /> Prev
            </button>
            
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-10 h-10 rounded-full font-medium flex items-center justify-center transition-all ${
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
              className="px-4 py-2 rounded-full font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: "var(--tag-bg)", color: "var(--text-primary)" }}
            >
              Next <i className="fas fa-chevron-right ml-2" />
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
