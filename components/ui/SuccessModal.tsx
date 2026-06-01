"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFallback?: boolean;
  onPrimaryAction?: () => void;
  messageText?: string;
}

export default function SuccessModal({ 
  isOpen, 
  onClose,
  isFallback = false,
  onPrimaryAction,
  messageText = ""
}: SuccessModalProps) {
  const [isCopied, setIsCopied] = useState(false);

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

  async function handleCopy() {
    if (!messageText) return;
    try {
      await navigator.clipboard.writeText(messageText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }

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
                  background: isFallback 
                    ? "linear-gradient(135deg, #3b82f6, #6366f1)" 
                    : "linear-gradient(135deg, var(--accent), var(--accent-2))"
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
                
                {/* Animated Icon */}
                <div className="relative mx-auto w-[84px] h-[84px] bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl border border-white/30">
                  {isFallback ? (
                    <motion.svg
                      initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                      width="36" height="36" viewBox="0 0 24 24" fill="none"
                      stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </motion.svg>
                  ) : (
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
                  )}
                </div>
              </div>

              {/* Content Body */}
              <div className="px-8 pt-8 pb-10">
                <h3 
                  className="font-syne text-[1.5rem] font-bold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  {isFallback ? "Ready to Send!" : "Message Sent!"}
                </h3>
                
                <p 
                  className="mb-8 text-[0.92rem] leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {isFallback 
                    ? "We've beautifully formatted your message. Click below to open your preferred mail client and send it instantly, or copy the content to paste manually."
                    : "Thank you for reaching out. Your message has been successfully delivered and I will get back to you as soon as possible."}
                </p>

                {isFallback ? (
                  <div className="flex flex-col gap-3">
                    {/* Primary Trigger Mailto Action */}
                    <button
                      onClick={() => {
                        if (onPrimaryAction) onPrimaryAction();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-[14px] px-6 font-semibold text-[0.9rem] rounded-xl text-white shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                      style={{
                        background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                        cursor: "pointer"
                      }}
                    >
                      <i className="fas fa-paper-plane" /> Open Email App
                    </button>

                    {/* Secondary Clipboard Copy Action */}
                    {messageText && (
                      <button
                        onClick={handleCopy}
                        className="w-full flex items-center justify-center gap-2 py-[13px] px-6 font-semibold text-[0.88rem] rounded-xl transition-all duration-300 border border-dashed hover:bg-white/5 active:scale-[0.98]"
                        style={{
                          borderColor: "var(--border)",
                          color: isCopied ? "var(--accent)" : "var(--text-secondary)",
                          cursor: "pointer"
                        }}
                      >
                        {isCopied ? (
                          <>
                            <i className="fas fa-check text-green-400" /> Copied to Clipboard!
                          </>
                        ) : (
                          <>
                            <i className="fas fa-copy" /> Copy Message Text
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={onClose}
                      className="text-[0.82rem] font-medium mt-2 hover:underline transition-all duration-200"
                      style={{ color: "var(--text-muted)", cursor: "pointer" }}
                    >
                      Close Window
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onClose}
                    className="btn-outline-custom w-full justify-center py-[14px]"
                    style={{ borderRadius: "14px", cursor: "pointer" }}
                  >
                    Ok, Got It!
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
