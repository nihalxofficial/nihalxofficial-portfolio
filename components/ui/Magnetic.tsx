"use client";

import { motion } from "framer-motion";

export default function Magnetic({ children }: { children: React.ReactElement }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}
