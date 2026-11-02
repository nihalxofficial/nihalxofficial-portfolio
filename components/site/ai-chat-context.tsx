"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface AiChatContextValue {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  unreadCount: number;
  showTeaser: boolean;
  dismissTeaser: () => void;
}

const AiChatContext = createContext<AiChatContextValue | null>(null);

export function AiChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [showTeaser, setShowTeaser] = useState(true);

  const openChat = useCallback(() => {
    setIsOpen(true);
    setUnreadCount(0);
    setShowTeaser(false);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setUnreadCount(0);
        setShowTeaser(false);
      }
      return next;
    });
  }, []);

  const dismissTeaser = useCallback(() => {
    setShowTeaser(false);
  }, []);

  return (
    <AiChatContext.Provider
      value={{
        isOpen,
        openChat,
        closeChat,
        toggleChat,
        unreadCount,
        showTeaser,
        dismissTeaser,
      }}
    >
      {children}
    </AiChatContext.Provider>
  );
}

export function useAiChat() {
  const context = useContext(AiChatContext);
  if (!context) {
    throw new Error("useAiChat must be used within an AiChatProvider");
  }
  return context;
}

