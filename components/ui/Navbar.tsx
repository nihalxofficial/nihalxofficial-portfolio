"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { NAV_LINKS } from "@/data/portfolio";
import { FaBriefcase } from "react-icons/fa";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Magnetic from "./Magnetic";

function smoothScroll(href: string) {
  if (href === "#") return;
  const el = document.querySelector(href);
  if (el) window.scrollTo({ top: (el as HTMLElement).offsetTop - 68, behavior: "smooth" });
}

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("#home");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px" }
    );

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    smoothScroll(href);
    setMobileOpen(false);
  }

  return (
    <>
      <nav
        className="fixed top-0 w-full z-[100] backdrop-blur-xl transition-all duration-300"
        style={{ background: "var(--nav-bg)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-[68px] flex items-center justify-between">
          {/* Logo */}
          <Magnetic>
            <a
              href="#home"
              onClick={(e) => handleNavClick(e, "#home")}
              className="font-syne font-extrabold text-[1.4rem] gradient-text no-underline block"
            >
              nihalxofficial
            </a>
          </Magnetic>

          {/* Desktop links */}
          <ul className="hidden lg:flex items-center gap-1 list-none m-0 p-0">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Magnetic>
                    <a
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className="no-underline px-[14px] py-2 rounded-lg text-[0.9rem] font-medium transition-all duration-200 flex items-center gap-2"
                      style={{
                        color: activeSection === link.href ? "var(--text-primary)" : "var(--text-secondary)",
                        background: activeSection === link.href ? "var(--tag-bg)" : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (activeSection !== link.href) {
                          (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                          (e.currentTarget as HTMLElement).style.background = "var(--tag-bg)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeSection !== link.href) {
                          (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                        }
                      }}
                    >
                      <Icon size={14} />
                      {link.label}
                    </a>
                  </Magnetic>
                </li>
              );
            })}
            <li>
              <Magnetic>
                <a
                  href="#contact"
                  onClick={(e) => handleNavClick(e, "#contact")}
                  className="nav-cta no-underline flex items-center gap-2 ml-2 block"
                >
                  <FaBriefcase size={14} /> Hire Me
                </a>
              </Magnetic>
            </li>
          </ul>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Theme toggle pill */}
            <motion.button
              className="theme-toggle magnetic"
              onClick={(e) => toggleTheme(e.clientX, e.clientY)}
              aria-label="Toggle theme"
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="toggle-thumb"
                initial={false}
                animate={{
                  x: theme === "light" ? 24 : 0,
                  rotate: theme === "light" ? 180 : 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <i className={theme === "dark" ? "fas fa-moon" : "fas fa-sun"} />
              </motion.div>
            </motion.button>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden bg-transparent border-none text-[1.3rem] cursor-pointer p-2"
              style={{ color: "var(--text-primary)" }}
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menu"
            >
              <i className={mobileOpen ? "fas fa-times" : "fas fa-bars"} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile nav */}
      <div className={`mobile-nav ${mobileOpen ? "open" : ""}`}>
        {NAV_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="flex items-center gap-2"
              style={{
                color: activeSection === link.href ? "var(--accent)" : "var(--text-secondary)",
                background: activeSection === link.href ? "var(--tag-bg)" : "transparent",
              }}
            >
              <Icon size={16} />
              {link.label}
            </a>
          );
        })}
      </div>
    </>
  );
}