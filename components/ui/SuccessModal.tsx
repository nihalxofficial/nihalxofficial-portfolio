"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blur Backdrop */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(6px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            onClick={onClose}
            className="fixed inset-0 z-[400] bg-black/50"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[401] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="pointer-events-auto relative w-full max-w-[400px] overflow-hidden rounded-[24px] text-center"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                boxShadow: "0 20px 60px -15px rgba(0,0,0,0.5), var(--shadow-glow)",
              }}
            >
              {/* Colored Header Banner */}
              <div 
                className="w-full pt-10 pb-8 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, var(--accent), var(--accent-2))"
                }}
              >
                {/* Decorative glowing orb inside banner */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-30" 
                  style={{ background: "radial-gradient(circle, white, transparent)" }} 
                />
                <div 
                  className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-20" 
                  style={{ background: "radial-gradient(circle, white, transparent)" }} 
                />
                
                {/* Animated White Plane Icon */}
                <div className="relative mx-auto w-[84px] h-[84px] bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl border border-white/30">
                  <motion.svg 
                    initial={{ x: -25, y: 25, opacity: 0, scale: 0.8 }}
                    animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 14, stiffness: 180, delay: 0.2 }}
                    width="38" height="38" viewBox="0 0 24 24" fill="none" 
                    stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ marginLeft: '-2px', marginTop: '2px' }}
                  >
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </motion.svg>
                </div>
              </div>

              {/* Content Body */}
              <div className="px-8 pt-8 pb-10">
                <h3 
                  className="font-syne text-[1.6rem] font-bold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  Message Sent!
                </h3>
                
                <p 
                  className="mb-8 text-[0.95rem] leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Thank you for reaching out. Your message has been successfully delivered and I will get back to you as soon as possible.
                </p>

                <button
                  onClick={onClose}
                  className="btn-outline-custom w-full justify-center py-[14px]"
                  style={{ borderRadius: "14px" }}
                >
                  Ok, Got It!
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
