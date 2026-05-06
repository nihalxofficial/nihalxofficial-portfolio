"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@heroui/react";
import { useModal } from "@/context/ModalContext";

export default function ProjectModal() {
  const { isOpen, project, closeModal } = useModal();

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      size="3xl"
      scrollBehavior="inside"
      placement="center"
      hideCloseButton={true}
      classNames={{
        base: "border border-[var(--border)] rounded-3xl my-16",
        header: "gradient-bg text-white rounded-t-3xl px-7 py-5",
        body: "p-7",
        wrapper: "flex items-center justify-center pt-24 pb-16",
        backdrop: "z-50",
      }}
    >
      <ModalContent
        style={{
          background: "var(--bg-card)",
          maxHeight: "85vh",
          marginTop: "100px",
        }}
      >
        {project && (
          <>
            <ModalHeader className="relative">
              <h2
                className="font-syne text-xl font-bold"
                style={{ color: "#fff" }}
              >
                {project.title}
              </h2>
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-lg p-2 transition-colors z-10"
                aria-label="Close modal"
              >
                <i className="fas fa-times" />
              </button>
            </ModalHeader>

            <ModalBody className="p-0 overflow-hidden">
              {/* Split layout container: scrollable on mobile, hidden on desktop so right side can scroll */}
              <div 
                className="flex gap-7 flex-col md:flex-row h-full max-h-[75vh] p-7 overflow-y-auto md:overflow-y-hidden"
                data-lenis-prevent="true"
              >
                {/* LEFT: Fixed large image on desktop */}
                <div
                  className={`flex-shrink-0 rounded-2xl flex items-center justify-center text-[6rem] text-white/90 ${project.grad} md:sticky md:top-0`}
                  style={{ width: "100%", maxWidth: "320px", height: "320px", margin: "0 auto" }}
                >
                  <i
                    className={project.icon}
                    style={{
                      filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
                    }}
                  />
                </div>

                {/* RIGHT: Scrollable content on desktop */}
                <div 
                  className="flex-1 flex flex-col md:overflow-y-auto custom-scrollbar md:pr-4"
                  data-lenis-prevent="true"
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: "var(--accent)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 10,
                      }}
                    >
                      Main Technology Stack Used
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.tech.map((t) => (
                        <span key={t} className="tech-chip">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: "var(--accent)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 10,
                      }}
                    >
                      Brief Description
                    </div>
                    <p
                      className="border-l-[6px] border-[var(--accent)] bg-[var(--accent-glow)] p-5 rounded-xl"
                      style={{
                        color: "var(--text-secondary)",
                        lineHeight: 1.7,
                        marginBottom: 24,
                        fontSize: "0.9rem",
                      }}
                    >
                      {project.desc}
                    </p>

                    <div
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: "var(--accent)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 10,
                      }}
                    >
                      Key Features
                    </div>
                    <ul
                      style={{ listStyle: "none", marginBottom: 24, padding: 0 }}
                    >
                      {project.features.map((f, i) => (
                        <li
                          key={i}
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.88rem",
                            padding: "5px 0",
                            display: "flex",
                            gap: 8,
                            alignItems: "flex-start",
                          }}
                        >
                          <span
                            style={{
                              color: "var(--accent-2)",
                              flexShrink: 0,
                              marginTop: 1,
                            }}
                          >
                            ▹
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>

                    {project.challenges && (
                      <>
                        <div
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            color: "var(--accent)",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            marginBottom: 10,
                          }}
                        >
                          Challenges Faced
                        </div>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            lineHeight: 1.7,
                            marginBottom: 24,
                            fontSize: "0.9rem",
                          }}
                        >
                          {project.challenges}
                        </p>
                      </>
                    )}

                    {project.improvements && (
                      <>
                        <div
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            color: "var(--accent)",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            marginBottom: 10,
                          }}
                        >
                          Potential Improvements & Future Plans
                        </div>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            lineHeight: 1.7,
                            marginBottom: 24,
                            fontSize: "0.9rem",
                          }}
                        >
                          {project.improvements}
                        </p>
                      </>
                    )}
                  </div>

                  <div
                    className="flex gap-3 pt-4 mt-auto sticky bottom-0 bg-[var(--bg-card)] pb-2"
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <a
                      href="#"
                      className="btn-primary-custom"
                      style={{ fontSize: "0.85rem", padding: "10px 20px" }}
                    >
                      <i className="fab fa-github" /> View Code
                    </a>
                    <a
                      href="#"
                      className="btn-outline-custom"
                      style={{ fontSize: "0.85rem", padding: "10px 20px" }}
                    >
                      <i className="fas fa-external-link-alt" /> Live Demo
                    </a>
                  </div>
                </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}