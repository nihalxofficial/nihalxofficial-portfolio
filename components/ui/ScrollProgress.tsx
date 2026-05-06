"use client";
import { useScrollProgress } from "@/hooks/useScroll";

export default function ScrollProgress() {
  const progress = useScrollProgress();
  return (
    <div
      id="scroll-progress"
      style={{ width: `${progress}%` }}
    />
  );
}
