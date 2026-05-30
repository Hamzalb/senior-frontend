"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef    = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<HTMLDivElement>(null);
  const glowRef   = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    setVisible(true);

    // Raw mouse position
    let mx = -400, my = -400;
    // Lerped positions for ring and glow (separate speeds for layered depth)
    let rx = -400, ry = -400;   // ring
    let gx = -400, gy = -400;   // outer glow blob
    let raf: number;
    let hovering = false;
    let clicking = false;

    const RING_LERP  = 0.10;   // ring lag — lower = smoother/more lag
    const GLOW_LERP  = 0.06;   // glow blob lag — even more sluggish

    const HOVER_SEL = "a, button, [role='button'], input, textarea, select, label, [data-cursor='pointer']";

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      hovering = !!(e.target as Element).closest(HOVER_SEL);
    };
    const onDown  = () => { clicking = true;  };
    const onUp    = () => { clicking = false; };
    const onLeave = () => { mx = -400; my = -400; };

    document.addEventListener("mousemove",  onMove);
    document.addEventListener("mousedown",  onDown);
    document.addEventListener("mouseup",    onUp);
    document.addEventListener("mouseleave", onLeave);

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    function tick() {
      rx = lerp(rx, mx, RING_LERP);
      ry = lerp(ry, my, RING_LERP);
      gx = lerp(gx, mx, GLOW_LERP);
      gy = lerp(gy, my, GLOW_LERP);

      const dot  = dotRef.current;
      const ring = ringRef.current;
      const glow = glowRef.current;
      if (!dot || !ring || !glow) { raf = requestAnimationFrame(tick); return; }

      // ── Dot ── snaps instantly, scales down on click
      const dotScale = clicking ? "scale(0.6)" : "scale(1)";
      dot.style.transform  = `translate(${mx}px, ${my}px) translate(-50%, -50%) ${dotScale}`;

      // ── Ring ── follows with smooth lag
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;

      // ── Glow blob ── slowest layer, big soft aura
      glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%)`;

      // ── Morph on hover ──
      if (hovering) {
        // Ring becomes a rounded square, brightens
        ring.style.width        = "52px";
        ring.style.height       = "52px";
        ring.style.borderRadius = "14px";
        ring.style.borderColor  = "rgba(192,132,252,0.95)";
        ring.style.boxShadow    = [
          "0 0 0 1px rgba(168,85,247,0.3)",
          "0 0 16px 4px rgba(168,85,247,0.55)",
          "0 0 32px 8px rgba(168,85,247,0.25)",
          "inset 0 0 12px rgba(192,132,252,0.08)",
        ].join(", ");
        ring.style.background   = "rgba(168,85,247,0.07)";

        // Dot shrinks + goes white
        dot.style.width         = "5px";
        dot.style.height        = "5px";
        dot.style.background    = "radial-gradient(circle, #fff 0%, #e9d5ff 60%, transparent 100%)";
        dot.style.boxShadow     = "0 0 8px 3px rgba(255,255,255,0.6)";

        // Glow brightens
        glow.style.width        = "180px";
        glow.style.height       = "180px";
        glow.style.opacity      = "0.55";
      } else {
        // Ring — normal circle
        ring.style.width        = "32px";
        ring.style.height       = "32px";
        ring.style.borderRadius = "50%";
        ring.style.borderColor  = "rgba(168,85,247,0.6)";
        ring.style.boxShadow    = [
          "0 0 0 1px rgba(168,85,247,0.15)",
          "0 0 10px 3px rgba(168,85,247,0.35)",
          "0 0 22px 6px rgba(168,85,247,0.15)",
        ].join(", ");
        ring.style.background   = "transparent";

        // Dot — normal purple
        dot.style.width         = "7px";
        dot.style.height        = "7px";
        dot.style.background    = "radial-gradient(circle, #f3e8ff 0%, #c084fc 40%, #a855f7 100%)";
        dot.style.boxShadow     = "0 0 6px 2px rgba(168,85,247,0.75), 0 0 14px 4px rgba(168,85,247,0.35)";

        // Glow dims
        glow.style.width        = "120px";
        glow.style.height       = "120px";
        glow.style.opacity      = "0.35";
      }

      // Click pulse: squeeze ring
      if (clicking) {
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%) scale(0.82)`;
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
      {/* ── Soft ambient glow blob (slowest layer) ── */}
      <div
        ref={glowRef}
        className="fixed top-0 left-0 z-[9996] pointer-events-none will-change-transform"
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,85,247,0.22) 0%, rgba(139,92,246,0.10) 50%, transparent 75%)",
          opacity: 0.35,
          transition: "width 0.4s ease, height 0.4s ease, opacity 0.35s ease",
          filter: "blur(2px)",
        }}
      />

      {/* ── Trailing ring (middle layer) ── */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[9997] pointer-events-none will-change-transform"
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          border: "1.5px solid rgba(168,85,247,0.6)",
          boxShadow: [
            "0 0 0 1px rgba(168,85,247,0.15)",
            "0 0 10px 3px rgba(168,85,247,0.35)",
            "0 0 22px 6px rgba(168,85,247,0.15)",
          ].join(", "),
          background: "transparent",
          transition: [
            "width 0.3s cubic-bezier(.34,1.56,.64,1)",
            "height 0.3s cubic-bezier(.34,1.56,.64,1)",
            "border-radius 0.3s ease",
            "border-color 0.25s ease",
            "box-shadow 0.25s ease",
            "background 0.25s ease",
          ].join(", "),
        }}
      />

      {/* ── Dot (top layer — instant) ── */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none will-change-transform"
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: "radial-gradient(circle, #f3e8ff 0%, #c084fc 40%, #a855f7 100%)",
          boxShadow: "0 0 6px 2px rgba(168,85,247,0.75), 0 0 14px 4px rgba(168,85,247,0.35)",
          transition: "width 0.18s ease, height 0.18s ease, background 0.2s ease, box-shadow 0.2s ease, transform 0.12s ease",
        }}
      />
    </>
  );
}
