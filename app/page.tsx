"use client";

import { HeroUIProvider } from "@heroui/react";
import { useToast } from "@/hooks/useScroll";

import ScrollProgress from "@/components/ui/ScrollProgress";
import BackToTop from "@/components/ui/BackToTop";
import Toast from "@/components/ui/Toast";
import ProjectModal from "@/components/ui/ProjectModal";
import Navbar from "@/components/ui/Navbar";

import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Education from "@/components/sections/Education";
import Testimonials from "@/components/sections/Testimonials";
import Blog from "@/components/sections/Blog";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

export default function Home() {
  const { toast, showToast } = useToast();

  return (
    <HeroUIProvider>
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <About onDownload={() => showToast("Resume download starting…")} />
        <Services />
        <Skills />
        <Projects />
        <Education />
        {/* <Testimonials /> */}
        {/* <Blog /> */}
        <Contact onSubmit={showToast} />
        <Footer />
      </main>
      <ProjectModal />
      <BackToTop />
      <Toast show={toast.show} msg={toast.msg} />
    </HeroUIProvider>
  );
}
