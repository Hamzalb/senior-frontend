"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef   = useRef<HTMLDivElement>(null);
  const ringRef  = useRef<HTMLDivElement>(null);

  // Track whether we're on a device that actually has a pointer
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only activate on non-touch devices
    if (window.matchMedia("(hover: none)").matches) return;
    setVisible(true);

    let mouseX = -200, mouseY = -200;
    let ringX  = -200, ringY  = -200;
    let hovering = false;
    let raf: number;

    const LERP = 0.13; // ring lag — lower = more lag

    // Selectors that trigger the hover morph
    const HOVER_SELECTOR = "a, button, [role='button'], input, textarea, select, label, [data-cursor='pointer']";

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Detect hover over interactive elements
      const target = e.target as Element;
      hovering = !!target.closest(HOVER_SELECTOR);
    };

    const onLeave  = () => { mouseX = -200; mouseY = -200; };
    const onEnter  = () => { /* cursor reappears naturally on next move */ };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    function tick() {
      // Lerp ring position toward the cursor
      ringX += (mouseX - ringX) * LERP;
      ringY += (mouseY - ringY) * LERP;

      const dot  = dotRef.current;
      const ring = ringRef.current;
      if (!dot || !ring) { raf = requestAnimationFrame(tick); return; }

      // Dot snaps instantly
      dot.style.transform  = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

      // Ring follows with lag
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

      // Morph on hover
      if (hovering) {
        ring.style.width        = "48px";
        ring.style.height       = "48px";
        ring.style.borderRadius = "12px";
        ring.style.borderColor  = "rgba(168,85,247,0.9)";
        ring.style.boxShadow    = "0 0 14px 3px rgba(168,85,247,0.45)";
        ring.style.background   = "rgba(168,85,247,0.06)";
        dot.style.width         = "5px";
        dot.style.height        = "5px";
        dot.style.opacity       = "0.6";
      } else {
        ring.style.width        = "30px";
        ring.style.height       = "30px";
        ring.style.borderRadius = "50%";
        ring.style.borderColor  = "rgba(168,85,247,0.55)";
        ring.style.boxShadow    = "0 0 8px 2px rgba(168,85,247,0.25)";
        ring.style.background   = "transparent";
        dot.style.width         = "7px";
        dot.style.height        = "7px";
        dot.style.opacity       = "1";
      }

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none will-change-transform"
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: "radial-gradient(circle, #d8b4fe 0%, #a855f7 60%, transparent 100%)",
          boxShadow: "0 0 6px 2px rgba(168,85,247,0.7)",
          transition: "width 0.2s, height 0.2s, opacity 0.2s",
        }}
      />

      {/* Trailing ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[9998] pointer-events-none will-change-transform"
        style={{
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          border: "1.5px solid rgba(168,85,247,0.55)",
          boxShadow: "0 0 8px 2px rgba(168,85,247,0.25)",
          background: "transparent",
          transition: "width 0.25s cubic-bezier(.22,.68,0,1.4), height 0.25s cubic-bezier(.22,.68,0,1.4), border-radius 0.25s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
        }}
      />
    </>
  );
}
