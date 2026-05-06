"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let mouse = { x: -100, y: -100 };
    let isHovering = false;

    // Track theme
    let isDark = document.documentElement.getAttribute("data-theme") !== "light";
    const observer = new MutationObserver(() => {
      isDark = document.documentElement.getAttribute("data-theme") !== "light";
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    class Bubble {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      life: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 6 + 2; // Small bubbles
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * -2 - 0.5; // Float upwards
        // Adjust lightness based on theme (darker bubbles for light mode)
        const lightness = isDark ? 70 : 50;
        this.color = `hsla(${Math.random() * 30 + 200}, 100%, ${lightness}%, `; 
        this.life = 1; 
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 0.025; // Fade speed
        this.size *= 0.98; // Shrink slightly
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.life + ")";
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color + "1)";
        ctx.fill();
      }
    }

    const bubbles: Bubble[] = [];

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    let lastTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      
      // Spawn bubbles (limit rate slightly to ~60fps)
      const now = Date.now();
      if (now - lastTime > 16) { 
        bubbles.push(new Bubble(mouse.x, mouse.y));
        if (Math.random() > 0.6) {
          bubbles.push(new Bubble(mouse.x, mouse.y)); // Chance for extra bubble
        }
        lastTime = now;
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isHoverable = target && (
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") ||
        target.closest("button") ||
        target.classList.contains("magnetic") ||
        target.closest(".project-card")
      );
      
      isHovering = !!isHoverable;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    // Smooth trailing aura
    let trail = { x: -100, y: -100 };

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      // Interpolate trailing circle
      trail.x += (mouse.x - trail.x) * 0.15;
      trail.y += (mouse.y - trail.y) * 0.15;

      // Draw smooth trailing aura
      ctx.beginPath();
      ctx.arc(trail.x, trail.y, isHovering ? 25 : 15, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.25)";
      ctx.shadowBlur = 20;
      ctx.shadowColor = isDark ? "rgba(59, 130, 246, 0.4)" : "rgba(59, 130, 246, 0.6)";
      ctx.fill();

      // Draw bubbles
      for (let i = 0; i < bubbles.length; i++) {
        bubbles[i].update();
        bubbles[i].draw();

        if (bubbles[i].life <= 0 || bubbles[i].size <= 0.1) {
          bubbles.splice(i, 1);
          i--;
        }
      }

      // Draw sharp leading dot only if not hovering
      if (!isHovering) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? "#ffffff" : "#0f172a";
        ctx.shadowBlur = 10;
        ctx.shadowColor = isDark ? "#3B82F6" : "rgba(59, 130, 246, 0.5)";
        ctx.fill();
      }

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 pointer-events-none z-[99999]"
      style={{ mixBlendMode: "normal" }}
    />
  );
}
