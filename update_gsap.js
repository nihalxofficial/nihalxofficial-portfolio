const fs = require('fs');
const path = require('path');

const files = [
  "Testimonials.tsx",
  "Skills.tsx",
  "Services.tsx",
  "Education.tsx",
  "Contact.tsx",
  "Blog.tsx",
  "About.tsx"
].map(f => path.join('c:/Users/MY PC/Next.js/portfolio/components/sections', f));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('useReveal')) return;

  // Remove import
  content = content.replace(/import { useReveal } from "@\/hooks\/useReveal";\n?/g, '');
  
  // Add GSAP imports
  content = content.replace(/import {?[^;]+;/, match => `${match}\nimport { useGSAP } from "@gsap/react";\nimport gsap from "gsap";\nimport { useRef } from "react";`);
  
  // Replace useReveal invocation
  content = content.replace(/const ref = useReveal\(\);/g, `const ref = useRef<HTMLElement>(null);\n\n  useGSAP(() => {\n    gsap.from(".reveal, .reveal-stagger > *, .reveal-left, .reveal-right", {\n      scrollTrigger: {\n        trigger: ref.current,\n        start: "top 80%",\n      },\n      y: 40,\n      opacity: 0,\n      stagger: 0.15,\n      duration: 0.8,\n      ease: "power3.out",\n    });\n  }, { scope: ref });`);

  fs.writeFileSync(file, content);
});

console.log('done');
