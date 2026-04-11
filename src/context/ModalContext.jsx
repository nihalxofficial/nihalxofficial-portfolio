import { createContext, useContext, useState, useEffect } from 'react';

// ModalContext stores which project (by index) is currently open in the modal.
// ProjectsSection opens it; Modal component reads and renders it.
const ModalContext = createContext();

// Static project data — lives here so both Projects grid and Modal share it
export const PROJECTS = [
  { title:'Finance Dashboard',   icon:'fa-chart-line',    grad:'g1', desc:'A comprehensive financial analytics dashboard providing real-time data visualization for stock markets, cryptocurrency, and personal finance tracking with advanced portfolio tools.', features:['Real-time stock & crypto data (5s updates)','Interactive charts with Chart.js / D3.js','Portfolio management with risk analysis','Export reports as PDF / CSV / Excel'], tech:['React','TypeScript','Chart.js','Node.js','MongoDB','WebSocket'] },
  { title:'E-Commerce Platform', icon:'fa-shopping-cart', grad:'g2', desc:'A full-featured e-commerce solution with product discovery, shopping cart, secure payments, and an admin panel for inventory management and sales analytics.', features:['Stripe + PayPal payment integration','Admin panel with live analytics','Inventory & order management','Mobile-first responsive UI'], tech:['Vue.js','Firebase','Stripe','Nuxt.js','Algolia'] },
  { title:'Project Management',  icon:'fa-tasks',         grad:'g3', desc:'A collaborative project management tool built for remote teams, with kanban boards, real-time updates, file sharing, and detailed task tracking.', features:['Drag-and-drop kanban boards','Real-time collaboration via WebSockets','File attachments & comments','Deadline reminders & notifications'], tech:['Next.js','Node.js','PostgreSQL','Socket.io','AWS S3'] },
  { title:'Fitness Tracker',     icon:'fa-mobile-alt',    grad:'g4', desc:'A cross-platform mobile fitness app for tracking workouts, nutrition, and health metrics with beautiful visualizations and personalized recommendations.', features:['Workout planning & tracking','Calorie & macro tracking','Progress charts & milestones','Apple Health / Google Fit sync'], tech:['React Native','Redux','Expo','Firebase','HealthKit'] },
  { title:'Blog Platform',       icon:'fa-blog',          grad:'g5', desc:'A full-featured CMS blog platform with a rich text editor, SEO optimization, tag-based discovery, and a clean reading experience.', features:['Rich WYSIWYG editor','SEO optimization & Open Graph','Tag & category system','Comment moderation'], tech:['Python','Django','PostgreSQL','Celery','Redis'] },
  { title:'Browser Game',        icon:'fa-gamepad',       grad:'g6', desc:'An interactive multiplayer browser game built with pure JavaScript and the Canvas API, featuring smooth animations and real-time leaderboards.', features:['Multiplayer via WebSocket','Smooth 60 FPS canvas rendering','Global leaderboard','Mobile touch support'], tech:['JavaScript','Canvas API','Node.js','Socket.io'] },
  { title:'CRM System',          icon:'fa-address-book',  grad:'g7', desc:'A fully custom CRM platform for managing customer relationships, deal pipelines, and sales team performance with powerful reporting tools.', features:['Contact & deal pipeline management','Sales funnel visualizations','Email integration & templates','Role-based access control'], tech:['PHP','MySQL','Bootstrap','jQuery','Chart.js'] },
  { title:'Event Manager',       icon:'fa-calendar-alt',  grad:'g8', desc:'A smart event planning and management application with ticketing, RSVP tracking, venue management, and real-time attendee check-in.', features:['QR code check-in system','Ticket sales & RSVP tracking','Venue & speaker management','Post-event analytics'], tech:['Angular','Firebase','Google Maps API','Stripe'] },
];

export function ModalProvider({ children }) {
  const [activeIndex, setActiveIndex] = useState(null); // null = closed

  // Open modal for project at index i
  const openModal  = (i) => { setActiveIndex(i); document.body.style.overflow = 'hidden'; };
  const closeModal = ()  => { setActiveIndex(null); document.body.style.overflow = ''; };

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <ModalContext.Provider value={{ activeIndex, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}
