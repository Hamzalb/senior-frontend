"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    setVisible(true);

    let mx = -400, my = -400;
    let rx = -400, ry = -400;
    let hovering = false;
    let clicking  = false;
    let raf: number;

    const RING_LERP = 0.18;

    const HOVER_SEL = "a, button, [role='button'], input, textarea, select, label, [data-cursor='pointer']";

    const onMove  = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      hovering = !!(e.target as Element).closest(HOVER_SEL);
    };
    const onDown  = () => { clicking = true; };
    const onUp    = () => { clicking = false; };
    const onLeave = () => { mx = -400; my = -400; };

    document.addEventListener("mousemove",  onMove);
    document.addEventListener("mousedown",  onDown);
    document.addEventListener("mouseup",    onUp);
    document.addEventListener("mouseleave", onLeave);

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

    function tick() {
      rx = lerp(rx, mx, RING_LERP);
      ry = lerp(ry, my, RING_LERP);

      const dot  = dotRef.current;
      const ring = ringRef.current;

      if (dot) {
        const sc = clicking ? "scale(0.6)" : "scale(1)";
        dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%) ${sc}`;
      }

      if (ring) {
        const sc = clicking ? "scale(0.82)" : "scale(1)";
        ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%) ${sc}`;
        if (hovering) {
          ring.style.width        = "52px";
          ring.style.height       = "52px";
          ring.style.borderRadius = "14px";
          ring.style.borderColor  = "rgba(192,132,252,0.95)";
          ring.style.boxShadow    = "0 0 16px 4px rgba(168,85,247,0.45), 0 0 32px 8px rgba(168,85,247,0.15)";
          ring.style.background   = "rgba(168,85,247,0.06)";
        } else {
          ring.style.width        = "32px";
          ring.style.height       = "32px";
          ring.style.borderRadius = "50%";
          ring.style.borderColor  = "rgba(168,85,247,0.6)";
          ring.style.boxShadow    = "0 0 10px 3px rgba(168,85,247,0.3), 0 0 22px 6px rgba(168,85,247,0.1)";
          ring.style.background   = "transparent";
        }
      }

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove",  onMove);
      document.removeEventListener("mousedown",  onDown);
      document.removeEventListener("mouseup",    onUp);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Trailing ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[9997] pointer-events-none will-change-transform"
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          border: "1.5px solid rgba(168,85,247,0.6)",
          boxShadow: "0 0 10px 3px rgba(168,85,247,0.3), 0 0 22px 6px rgba(168,85,247,0.1)",
          background: "transparent",
          transition: [
            "width 0.28s cubic-bezier(.34,1.56,.64,1)",
            "height 0.28s cubic-bezier(.34,1.56,.64,1)",
            "border-radius 0.28s ease",
            "border-color 0.2s ease",
            "box-shadow 0.2s ease",
            "background 0.2s ease",
          ].join(", "),
        }}
      />

      {/* Dot — snaps to cursor */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none will-change-transform"
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: "radial-gradient(circle, #f3e8ff 0%, #c084fc 40%, #a855f7 100%)",
          boxShadow: "0 0 6px 2px rgba(168,85,247,0.8)",
          transition: "transform 0.08s ease",
        }}
      />
    </>
  );
}
