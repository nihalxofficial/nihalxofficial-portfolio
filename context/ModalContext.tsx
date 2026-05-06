"use client";

import React, { createContext, useContext, useState } from "react";
import { Project, PROJECTS } from "@/data/portfolio";

interface ModalContextValue {
  isOpen: boolean;
  project: Project | null;
  openModal: (index: number) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue>({
  isOpen: false,
  project: null,
  openModal: () => {},
  closeModal: () => {},
});

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [project, setProject] = useState<Project | null>(null);

  function openModal(index: number) {
    setProject(PROJECTS[index]);
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    setIsOpen(false);
    setProject(null);
    document.body.style.overflow = "";
  }

  return (
    <ModalContext.Provider value={{ isOpen, project, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}
