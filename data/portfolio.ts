// ─── Portfolio Data ───────────────────────────────────────────────────────────
import { IconType } from "react-icons";
import { 
  FaHome, 
  FaUser, 
  FaServicestack, 
  FaCode, 
  FaProjectDiagram, 
  FaGraduationCap, 
  FaBlog, 
  FaEnvelope 
} from "react-icons/fa";


export const TYPEWRITER_ROLES = [
  // "Frontend Developer",
  "Mern-Stack Development",
  // "Next.js Specialist",
  "Software Architecture",
  "Problem Solving",
];

export const STATS = [
  { value: "3+", label: "Years of experience" },
  { value: "20+", label: "Projects delivered" },
  { value: "15+", label: "Happy clients" },
];

export const SERVICES = [
  {
    icon: "fas fa-code",
    title: "Full-Stack Development",
    desc: "Building fast, responsive interfaces with React, Next & Node. Performance-first, accessible clean code.",
  },
  {
    icon: "fas fa-paint-brush",
    title: "UI/UX Design",
    desc: "Intuitive, user-centered designs from wireframes to polished prototypes. Beautiful and functional.",
  },
  {
    icon: "fas fa-mobile-alt",
    title: "Responsive Web Design",
    desc: "Pixel-perfect layouts on all devices with mobile-first CSS Grid and Flexbox techniques.",
  },
  {
    icon: "fas fa-rocket",
    title: "Web Performance",
    desc: "Optimize load times, Core Web Vitals and runtime performance for lightning-fast sites.",
  },
  {
    icon: "fas fa-shopping-cart",
    title: "E-Commerce Solutions",
    desc: "Custom shopping experiences with secure payments, inventory management and smooth checkout flows.",
  },
  {
    icon: "fas fa-headset",
    title: "Maintenance & Support",
    desc: "Ongoing updates, security patches and proactive support to keep your site running smoothly.",
  },
];

export const SKILL_CATEGORIES = [
  {
    icon: "fab fa-js",
    title: "Frontend",
    skills: [
      { name: "React.js", level: "advanced" },
      { name: "Next.js", level: "advanced" },
      { name: "TypeScript", level: "intermediate" },
      { name: "HTML5 / CSS3", level: "expert" },
      { name: "Tailwind CSS", level: "expert" },
      { name: "Hero / Daisy UI", level: "advanced" },
    ],
  },
  {
    icon: "fas fa-server",
    title: "Backend",
    skills: [
      { name: "Node.js", level: "intermediate" },
      { name: "Express.js", level: "advanced" },
      { name: "Python", level: "advanced" },
      { name: "Golang", level: "intermediate" },
      { name: "MongoDB", level: "intermediate" },
      { name: "REST APIs", level: "expert" },
    ],
  },
  {
    icon: "fas fa-tools",
    title: "Tools",
    skills: [
      { name: "Git / GitHub", level: "expert" },
      { name: "Figma", level: "advanced" },
      { name: "Postman", level: "advanced" },
      { name: "Docker", level: "basic" },
      { name: "Kubernetes", level: "basic" },
      { name: "MongoDB Atlas", level: "expert" },
    ],
  },
];

export const FILTER_TAGS = [
  "All Projects",
  "React",
  "Next.js",
  "Express.js",
  "Python",
  "TypeScript",
  "Golang",
  "Firebase",
];

export interface Project {
  title: string;
  icon: string;
  grad: string;
  tags: string;
  tagBadges: string[];
  chips: string[];
  desc: string;
  features: string[];
  tech: string[];
  challenges?: string;
  improvements?: string;
}

export const PROJECTS: Project[] = [
  {
    title: "Finance Dashboard",
    icon: "fas fa-chart-line",
    grad: "g1",
    tags: "React TypeScript",
    tagBadges: ["React", "TS"],
    chips: ["React", "TypeScript", "D3.js"],
    desc: "A comprehensive financial analytics dashboard providing real-time data visualization for stock markets, cryptocurrency, and personal finance tracking with advanced portfolio tools.",
    features: [
      "Real-time stock & crypto data (5s updates)",
      "Interactive charts with Chart.js / D3.js",
      "Portfolio management with risk analysis",
      "Export reports as PDF / CSV / Excel",
    ],
    tech: ["React", "TypeScript", "Chart.js", "Node.js", "MongoDB", "WebSocket"],
    challenges: "Handling real-time WebSocket data without causing excessive re-renders was a major hurdle. We implemented custom debounce hooks and optimized React state management to maintain 60FPS.",
    improvements: "In the future, I plan to integrate machine learning models to provide predictive analytics and automated risk assessment directly within the dashboard.",
  },
  {
    title: "E-Commerce Platform",
    icon: "fas fa-shopping-cart",
    grad: "g2",
    tags: "Vue Firebase",
    tagBadges: ["Vue", "Firebase"],
    chips: ["Vue", "Firebase", "Stripe"],
    desc: "A full-featured e-commerce solution with product discovery, shopping cart, secure payments, and an admin panel for inventory management and sales analytics.",
    features: [
      "Stripe + PayPal payment integration",
      "Admin panel with live analytics",
      "Inventory & order management",
      "Mobile-first responsive UI",
    ],
    tech: ["Vue.js", "Firebase", "Stripe", "Nuxt.js", "Algolia"],
  },
  {
    title: "Project Management",
    icon: "fas fa-tasks",
    grad: "g3",
    tags: "Next.js",
    tagBadges: ["Next.js"],
    chips: ["Next.js", "Node", "Postgres"],
    desc: "A collaborative project management tool built for remote teams, with kanban boards, real-time updates, file sharing, and detailed task tracking.",
    features: [
      "Drag-and-drop kanban boards",
      "Real-time collaboration via WebSockets",
      "File attachments & comments",
      "Deadline reminders & notifications",
    ],
    tech: ["Next.js", "Node.js", "PostgreSQL", "Socket.io", "AWS S3"],
  },
  {
    title: "Fitness Tracker",
    icon: "fas fa-mobile-alt",
    grad: "g4",
    tags: "React",
    tagBadges: ["React Native"],
    chips: ["React Native", "Redux"],
    desc: "A cross-platform mobile fitness app for tracking workouts, nutrition, and health metrics with beautiful visualizations and personalized recommendations.",
    features: [
      "Workout planning & tracking",
      "Calorie & macro tracking",
      "Progress charts & milestones",
      "Apple Health / Google Fit sync",
    ],
    tech: ["React Native", "Redux", "Expo", "Firebase", "HealthKit"],
  },
  {
    title: "Blog Platform",
    icon: "fas fa-blog",
    grad: "g5",
    tags: "Python",
    tagBadges: ["Python", "Django"],
    chips: ["Python", "Django", "PostgreSQL"],
    desc: "A full-featured CMS blog platform with a rich text editor, SEO optimization, tag-based discovery, and a clean reading experience.",
    features: [
      "Rich WYSIWYG editor",
      "SEO optimization & Open Graph",
      "Tag & category system",
      "Comment moderation",
    ],
    tech: ["Python", "Django", "PostgreSQL", "Celery", "Redis"],
  },
  {
    title: "Browser Game",
    icon: "fas fa-gamepad",
    grad: "g6",
    tags: "JavaScript",
    tagBadges: ["JS", "Canvas"],
    chips: ["JavaScript", "Canvas API"],
    desc: "An interactive multiplayer browser game built with pure JavaScript and the Canvas API, featuring smooth animations and real-time leaderboards.",
    features: [
      "Multiplayer via WebSocket",
      "Smooth 60 FPS canvas rendering",
      "Global leaderboard",
      "Mobile touch support",
    ],
    tech: ["JavaScript", "Canvas API", "Node.js", "Socket.io"],
  },
  {
    title: "CRM System",
    icon: "fas fa-address-book",
    grad: "g7",
    tags: "PHP",
    tagBadges: ["PHP", "MySQL"],
    chips: ["PHP", "MySQL", "Bootstrap"],
    desc: "A fully custom CRM platform for managing customer relationships, deal pipelines, and sales team performance with powerful reporting tools.",
    features: [
      "Contact & deal pipeline management",
      "Sales funnel visualizations",
      "Email integration & templates",
      "Role-based access control",
    ],
    tech: ["PHP", "MySQL", "Bootstrap", "jQuery", "Chart.js"],
  },
  {
    title: "Event Manager",
    icon: "fas fa-calendar-alt",
    grad: "g8",
    tags: "Angular Firebase",
    tagBadges: ["Angular", "Firebase"],
    chips: ["Angular", "Firebase", "Maps API"],
    desc: "A smart event planning and management application with ticketing, RSVP tracking, venue management, and real-time attendee check-in.",
    features: [
      "QR code check-in system",
      "Ticket sales & RSVP tracking",
      "Venue & speaker management",
      "Post-event analytics",
    ],
    tech: ["Angular", "Firebase", "Google Maps API", "Stripe"],
  },
  {
    title: "Event Manager",
    icon: "fas fa-calendar-alt",
    grad: "g8",
    tags: "Angular Firebase",
    tagBadges: ["Angular", "Firebase"],
    chips: ["Angular", "Firebase", "Maps API"],
    desc: "A smart event planning and management application with ticketing, RSVP tracking, venue management, and real-time attendee check-in.",
    features: [
      "QR code check-in system",
      "Ticket sales & RSVP tracking",
      "Venue & speaker management",
      "Post-event analytics",
    ],
    tech: ["Angular", "Firebase", "Google Maps API", "Stripe"],
  },
  {
    title: "Event Manager",
    icon: "fas fa-calendar-alt",
    grad: "g8",
    tags: "Angular Firebase",
    tagBadges: ["Angular", "Firebase"],
    chips: ["Angular", "Firebase", "Maps API"],
    desc: "A smart event planning and management application with ticketing, RSVP tracking, venue management, and real-time attendee check-in.",
    features: [
      "QR code check-in system",
      "Ticket sales & RSVP tracking",
      "Venue & speaker management",
      "Post-event analytics",
    ],
    tech: ["Angular", "Firebase", "Google Maps API", "Stripe"],
  },
  {
    title: "Event Manager",
    icon: "fas fa-calendar-alt",
    grad: "g8",
    tags: "Angular Firebase",
    tagBadges: ["Angular", "Firebase"],
    chips: ["Angular", "Firebase", "Maps API"],
    desc: "A smart event planning and management application with ticketing, RSVP tracking, venue management, and real-time attendee check-in.",
    features: [
      "QR code check-in system",
      "Ticket sales & RSVP tracking",
      "Venue & speaker management",
      "Post-event analytics",
    ],
    tech: ["Angular", "Firebase", "Google Maps API", "Stripe"],
  },
];

export const EDUCATION = [
  {
    icon: "fas fa-graduation-cap",
    degree: "Complete Web Developemt",
    period: "2026",
    school: "Programming Hero",
    desc: "This is a comprehensive full-stack web development program that covers a wide range of technologies and concepts including React, Next.js, Node.js, databases and deployment. The program is designed to provide students with the knowledge and skills necessary to build modern web applications.",
  },
  {
    icon: "fas fa-book-open",
    degree: "Computer Science And Technology",
    period: "2023 – 2026",
    school: "Feni Polytechinc Institue",
    desc: "Studying core computer science subjects with a strong focus, learning programming fundamentals while gaining knowledge in database systems and networking concepts and continuously exploring software development.",
  },
  {
    icon: "fas fa-school",
    degree: "High School Diploma — Science",
    period: "2012 – 2016",
    school: "J.B. High School",
    desc: "Completed SSC from the Science group with a strong academic foundation.Developed solid understanding in mathematics, physics, chemistry and biology. Built analytical and problem-solving skills through science-based learning.",
  },
];

export const CERTIFICATIONS = [
  {
    icon: "fas fa-laptop-code",
    iconColor: "#3b82f6",
    title: "Complete Web Development",
    year: "2026",
    issuer: "Programming Hero",
  },
  {
    icon: "fab fa-python",
    iconColor: "#3776AB",
    title: "Crash Course On Python",
    year: "2025",
    issuer: "Coursera",
  },
  {
    icon: "fas fa-database",
    iconColor: "#f97316",
    title: "Database & SQL",
    year: "2025",
    issuer: "Coursera",
  },
  {
    icon: "fas fa-shield-alt",
    iconColor: "#22c55e",
    title: "Cyber Security & Professionals",
    year: "2024",
    issuer: "Web Origin",
  },
  {
    icon: "fas fa-paint-brush",
    iconColor: "#ec4899",
    title: "Web Design & Development",
    year: "2023",
    issuer: "DreamLand It Institue",
  },
  {
    icon: "fas fa-desktop",
    iconColor: "#0ea5e9",
    title: "Computer Office Application",
    year: "2022",
    issuer: "Post Office",
  },
];

export const TESTIMONIALS = [
  {
    stars: 5,
    text: "Alex completely transformed our outdated website into a sleek, fast platform. The attention to detail and responsiveness throughout the project was outstanding. Delivered ahead of schedule!",
    initials: "SR",
    name: "Sarah Reynolds",
    role: "CEO, Brightwave Digital",
    avatarGrad: "",
  },
  {
    stars: 5,
    text: "Working with Alex was a pleasure from start to finish. The React dashboard he built cut our reporting time by 60%. Code quality is exceptional — well-structured, documented, and easy to maintain.",
    initials: "MK",
    name: "Marcus Kim",
    role: "CTO, FinTrack Analytics",
    avatarGrad: "linear-gradient(135deg,#059669,#22d3ee)",
  },
  {
    stars: 4.5,
    text: "Our e-commerce conversion rate jumped 34% after Alex redesigned the checkout flow. He brings both strong technical skills and real product thinking. Will definitely work with him again.",
    initials: "LP",
    name: "Laura Park",
    role: "Head of Product, ShopNest",
    avatarGrad: "linear-gradient(135deg,#ea580c,#f59e0b)",
  },
  {
    stars: 5,
    text: "Alex's deep knowledge of performance optimization is rare. He brought our Lighthouse score from 52 to 96. The site now loads in under 1.2s globally. An absolute pro.",
    initials: "DJ",
    name: "Daniel Johnson",
    role: "Engineering Lead, Velocity SaaS",
    avatarGrad: "linear-gradient(135deg,#7c3aed,#6366f1)",
  },
  {
    stars: 5,
    text: "Hired Alex to build a Vue.js component library for our design system. The output was clean, well-tested, and the Storybook docs were incredibly thorough. Highly recommend!",
    initials: "AT",
    name: "Aisha Thompson",
    role: "Design Systems Lead, Corevo",
    avatarGrad: "linear-gradient(135deg,#0891b2,#22d3ee)",
  },
  {
    stars: 5,
    text: "Our startup needed a polished MVP in 6 weeks — Alex delivered it in 5. Investors were impressed by the UI quality. His communication and ability to translate business needs into code is top-tier.",
    initials: "RN",
    name: "Ryan Nguyen",
    role: "Co-founder, Launchpad AI",
    avatarGrad: "linear-gradient(135deg,#be185d,#f43f5e)",
  },
];

export const BLOG_POSTS = [
  {
    thumbClass: "b1",
    thumbIcon: "fas fa-bolt",
    tag: "Performance",
    date: "Mar 2024",
    readTime: "8 min read",
    title: "How I Brought a React App from a 52 to 96 Lighthouse Score",
    excerpt:
      "A step-by-step breakdown of code splitting, lazy loading, image optimization, and caching strategies that made a real-world app blazing fast.",
  },
  {
    thumbClass: "b2",
    thumbIcon: "fas fa-layer-group",
    tag: "Architecture",
    date: "Jan 2024",
    readTime: "12 min read",
    title: "Building a Scalable Design System with Vue 3 and Storybook",
    excerpt:
      "How to structure a component library that scales across multiple products — tokens, documentation, versioning, and team adoption strategies.",
  },
  {
    thumbClass: "b3",
    thumbIcon: "fas fa-user-astronaut",
    tag: "Career",
    date: "Nov 2023",
    readTime: "6 min read",
    title: "From Bootcamp to Senior Dev in 4 Years: What Actually Worked",
    excerpt:
      "The honest lessons — including the mistakes — from my journey from bootcamp graduate to senior frontend engineer at a Series B startup.",
  },

];

export const SOCIAL_LINKS = [
  { icon: "fab fa-github", href: "https://github.com/nihalxofficial", label: "GitHub" },
  { icon: "fab fa-linkedin-in", href: "https://www.linkedin.com/in/md-nihal-uddin/", label: "LinkedIn" },
  { icon: "fab fa-twitter", href: "https://x.com/nihalxofficial", label: "Twitter" },
  { icon: "fab fa-facebook-f", href: "#", label: "Facebook" },
  // { icon: "fas fa-laptop-code", href: "#", label: "LeetCode" },
];

export const NAV_LINKS = [
  { href: "#home", label: "Home", icon: FaHome },
  { href: "#about", label: "About", icon: FaUser },
  // { href: "#services", label: "Services", icon: FaServicestack },
  { href: "#skills", label: "Skills", icon: FaCode },
  { href: "#projects", label: "Projects", icon: FaProjectDiagram },
  { href: "#education", label: "Education", icon: FaGraduationCap },
  // { href: "#blog", label: "Blog", icon: FaBlog },
  // { href: "#contact", label: "Contact", icon: FaEnvelope },
];