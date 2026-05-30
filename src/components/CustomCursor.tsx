"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;   // 0→1, counts up
  size: number;
  hue: number;    // 270–310 (purple range)
}

let pid = 0;

export default function CustomCursor() {
  const dotRef    = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    setVisible(true);

    let mx = -400, my = -400;
    let rx = -400, ry = -400;
    let hovering = false;
    let clicking  = false;
    let raf: number;

    const RING_LERP   = 0.10;
    const SPAWN_DIST  = 4;     // min px moved before spawning a particle
    let lastSpawnX = -999, lastSpawnY = -999;

    const particles: Particle[] = [];

    const HOVER_SEL = "a, button, [role='button'], input, textarea, select, label, [data-cursor='pointer']";

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      hovering = !!(e.target as Element).closest(HOVER_SEL);

      // Spawn particles as the cursor moves
      const dx = mx - lastSpawnX;
      const dy = my - lastSpawnY;
      if (Math.sqrt(dx * dx + dy * dy) > SPAWN_DIST) {
        spawnParticle(mx, my, hovering);
        lastSpawnX = mx;
        lastSpawnY = my;
      }
    };
    const onDown  = () => { clicking = true;  spawnBurst(mx, my); };
    const onUp    = () => { clicking = false; };
    const onLeave = () => { mx = -400; my = -400; };

    function spawnParticle(x: number, y: number, big = false) {
      const angle = Math.random() * Math.PI * 2;
      const speed = big ? (0.4 + Math.random() * 1.0) : (0.2 + Math.random() * 0.6);
      particles.push({
        id:   pid++,
        x, y,
        vx:   Math.cos(angle) * speed,
        vy:   Math.sin(angle) * speed - 0.5,   // slight upward drift
        life: 0,
        size: big ? (2 + Math.random() * 2.5) : (1.2 + Math.random() * 1.6),
        hue:  270 + Math.random() * 45,         // purple→pink
      });
    }

    function spawnBurst(x: number, y: number) {
      for (let i = 0; i < 12; i++) spawnParticle(x, y, true);
    }

    document.addEventListener("mousemove",  onMove);
    document.addEventListener("mousedown",  onDown);
    document.addEventListener("mouseup",    onUp);
    document.addEventListener("mouseleave", onLeave);

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

    function tick() {
      // ── Lerp ring ──
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
          ring.style.boxShadow    = "0 0 0 1px rgba(168,85,247,0.3), 0 0 16px 4px rgba(168,85,247,0.55), 0 0 32px 8px rgba(168,85,247,0.2), inset 0 0 12px rgba(192,132,252,0.08)";
          ring.style.background   = "rgba(168,85,247,0.06)";
        } else {
          ring.style.width        = "32px";
          ring.style.height       = "32px";
          ring.style.borderRadius = "50%";
          ring.style.borderColor  = "rgba(168,85,247,0.6)";
          ring.style.boxShadow    = "0 0 0 1px rgba(168,85,247,0.12), 0 0 10px 3px rgba(168,85,247,0.35), 0 0 22px 6px rgba(168,85,247,0.12)";
          ring.style.background   = "transparent";
        }
      }

      // ── Canvas particles ──
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const DECAY = 0.022; // life speed — lower = longer trails
          for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x    += p.vx;
            p.y    += p.vy;
            p.vy   += 0.025;          // gravity
            p.vx   *= 0.97;           // drag
            p.life += DECAY;

            if (p.life >= 1) { particles.splice(i, 1); continue; }

            const alpha  = (1 - p.life) * (1 - p.life); // ease-out fade
            const radius = p.size * (1 - p.life * 0.4); // shrink as it ages

            // Outer soft glow
            const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 4);
            grd.addColorStop(0, `hsla(${p.hue},90%,75%,${alpha * 0.55})`);
            grd.addColorStop(1, `hsla(${p.hue},90%,65%,0)`);
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius * 4, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();

            // Bright core
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue},100%,85%,${alpha})`;
            ctx.fill();
          }
        }
      }

      raf = requestAnimationFrame(tick);
    }

    // Resize canvas to viewport
    function resizeCanvas() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("mousemove",  onMove);
      document.removeEventListener("mousedown",  onDown);
      document.removeEventListener("mouseup",    onUp);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Particle canvas — behind everything */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[9995] pointer-events-none"
      />

      {/* Trailing ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[9997] pointer-events-none will-change-transform"
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          border: "1.5px solid rgba(168,85,247,0.6)",
          boxShadow: "0 0 0 1px rgba(168,85,247,0.12), 0 0 10px 3px rgba(168,85,247,0.35), 0 0 22px 6px rgba(168,85,247,0.12)",
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

      {/* Dot — snaps to cursor */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none will-change-transform"
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: "radial-gradient(circle, #f3e8ff 0%, #c084fc 40%, #a855f7 100%)",
          boxShadow: "0 0 6px 2px rgba(168,85,247,0.8), 0 0 14px 4px rgba(168,85,247,0.4)",
          transition: "transform 0.12s ease",
        }}
      />
    </>
  );
}
