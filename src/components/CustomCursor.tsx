"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Effect 1: detect touch-only device (no hover capability)
  useEffect(() => {
    if (!window.matchMedia("(hover: none)").matches) {
      setVisible(true);
    }
  }, []);

  // Effect 2: start RAF loop only after elements are mounted (visible=true)
  useEffect(() => {
    if (!visible) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = window.innerWidth / 2;
    let ry = window.innerHeight / 2;
    let hovering = false;
    let clicking  = false;
    let raf: number;

    const RING_LERP = 0.15;
    const HOVER_SEL = "a, button, [role='button'], input, textarea, select, label, [data-cursor='pointer']";

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      hovering = e.target instanceof Element ? !!e.target.closest(HOVER_SEL) : false;
    };
    const onDown  = () => { clicking = true; };
    const onUp    = () => { clicking = false; };

    document.addEventListener("mousemove",  onMove,  { passive: true });
    document.addEventListener("mousedown",  onDown,  { passive: true });
    document.addEventListener("mouseup",    onUp,    { passive: true });

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      rx = lerp(rx, mx, RING_LERP);
      ry = lerp(ry, my, RING_LERP);

      const dot  = dotRef.current;
      const ring = ringRef.current;

      if (dot) {
        dot.style.left      = `${mx}px`;
        dot.style.top       = `${my}px`;
        dot.style.transform = clicking
          ? "translate(-50%,-50%) scale(0.55)"
          : "translate(-50%,-50%) scale(1)";
      }

      if (ring) {
        ring.style.left      = `${rx}px`;
        ring.style.top       = `${ry}px`;
        ring.style.transform = clicking
          ? "translate(-50%,-50%) scale(0.82)"
          : "translate(-50%,-50%)";

        if (hovering) {
          ring.style.width           = "50px";
          ring.style.height          = "50px";
          ring.style.borderRadius    = "12px";
          ring.style.borderColor     = "rgba(192,132,252,0.9)";
          ring.style.boxShadow       = "0 0 14px 4px rgba(168,85,247,0.4)";
          ring.style.backgroundColor = "rgba(168,85,247,0.05)";
        } else {
          ring.style.width           = "30px";
          ring.style.height          = "30px";
          ring.style.borderRadius    = "50%";
          ring.style.borderColor     = "rgba(168,85,247,0.55)";
          ring.style.boxShadow       = "0 0 8px 2px rgba(168,85,247,0.25)";
          ring.style.backgroundColor = "transparent";
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove",  onMove);
      document.removeEventListener("mousedown",  onDown);
      document.removeEventListener("mouseup",    onUp);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      {/* Trailing ring — positioned via left/top (no transition on position) */}
      <div
        ref={ringRef}
        className="fixed z-[9997] pointer-events-none"
        style={{
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          border: "1.5px solid rgba(168,85,247,0.55)",
          boxShadow: "0 0 8px 2px rgba(168,85,247,0.25)",
          backgroundColor: "transparent",
          left: `${window.innerWidth / 2}px`,
          top:  `${window.innerHeight / 2}px`,
          transform: "translate(-50%,-50%)",
          transition: [
            "width 0.26s cubic-bezier(.34,1.56,.64,1)",
            "height 0.26s cubic-bezier(.34,1.56,.64,1)",
            "border-radius 0.26s ease",
            "border-color 0.2s ease",
            "box-shadow 0.2s ease",
            "background-color 0.2s ease",
            "transform 0.1s ease",
          ].join(", "),
        }}
      />

      {/* Dot — snaps instantly to cursor */}
      <div
        ref={dotRef}
        className="fixed z-[9999] pointer-events-none"
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: "radial-gradient(circle, #f3e8ff 0%, #c084fc 40%, #a855f7 100%)",
          boxShadow: "0 0 6px 2px rgba(168,85,247,0.7)",
          left: `${window.innerWidth / 2}px`,
          top:  `${window.innerHeight / 2}px`,
          transform: "translate(-50%,-50%)",
          transition: "transform 0.08s ease",
        }}
      />
    </>
  );
}
