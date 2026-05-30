"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface SectionBackgroundProps {
  prefersReducedMotion?: boolean;
  showParticles?: boolean;
  showMeshGradient?: boolean;
}

// Extensive particle configurations for a rich, dynamic background
const particleConfigs = [
  // === SMALL FLOATING PARTICLES (brand-500 family) ===
  { size: "w-1 h-1", color: "bg-brand-500/40", pattern: "float-up" },
  { size: "w-1.5 h-1.5", color: "bg-brand-400/35", pattern: "float-up" },
  { size: "w-2 h-2", color: "bg-brand-500/30", pattern: "float-up" },
  { size: "w-1 h-1", color: "bg-brand-300/45", pattern: "drift-right" },
  { size: "w-2 h-2", color: "bg-brand-600/25", pattern: "drift-right" },
  { size: "w-1 h-1", color: "bg-brand-500/35", pattern: "drift-left" },
  { size: "w-1.5 h-1.5", color: "bg-brand-400/40", pattern: "float-up" },
  
  // === MEDIUM PARTICLES (purple family) ===
  { size: "w-2.5 h-2.5", color: "bg-brand-400/25", pattern: "pulse" },
  { size: "w-3 h-3", color: "bg-brand-500/20", pattern: "pulse" },
  { size: "w-2 h-2", color: "bg-purple-400/30", pattern: "float-diagonal" },
  { size: "w-1.5 h-1.5", color: "bg-purple-500/35", pattern: "float-diagonal" },
  { size: "w-2.5 h-2.5", color: "bg-purple-600/25", pattern: "spiral" },
  { size: "w-2 h-2", color: "bg-violet-400/30", pattern: "wave" },
  
  // === TINY SPARKLES (white/bright) ===
  { size: "w-0.5 h-0.5", color: "bg-white/50", pattern: "sparkle" },
  { size: "w-0.5 h-0.5", color: "bg-brand-200/60", pattern: "sparkle" },
  { size: "w-1 h-1", color: "bg-white/40", pattern: "sparkle" },
  { size: "w-0.5 h-0.5", color: "bg-purple-200/55", pattern: "sparkle" },
  { size: "w-1 h-1", color: "bg-brand-100/50", pattern: "sparkle" },
  { size: "w-0.5 h-0.5", color: "bg-white/60", pattern: "twinkle" },
  { size: "w-1 h-1", color: "bg-violet-200/45", pattern: "twinkle" },
  
  // === LARGE SLOW-MOVING PARTICLES ===
  { size: "w-4 h-4", color: "bg-brand-500/15", pattern: "slow-drift" },
  { size: "w-5 h-5", color: "bg-brand-700/10", pattern: "slow-drift" },
  { size: "w-3 h-3", color: "bg-purple-600/20", pattern: "slow-drift" },
  { size: "w-6 h-6", color: "bg-brand-400/12", pattern: "slow-drift" },
  { size: "w-4 h-4", color: "bg-violet-500/15", pattern: "slow-drift" },
  
  // === EXTRA SMALL SCATTERED PARTICLES ===
  { size: "w-1 h-1", color: "bg-brand-400/30", pattern: "scatter" },
  { size: "w-0.5 h-0.5", color: "bg-brand-300/40", pattern: "scatter" },
  { size: "w-1.5 h-1.5", color: "bg-brand-500/25", pattern: "scatter" },
  { size: "w-1 h-1", color: "bg-purple-400/35", pattern: "scatter" },
  { size: "w-0.5 h-0.5", color: "bg-violet-300/45", pattern: "scatter" },
  { size: "w-1 h-1", color: "bg-brand-200/35", pattern: "scatter" },
  
  // === ORBITING PARTICLES ===
  { size: "w-1.5 h-1.5", color: "bg-brand-500/30", pattern: "orbit-small" },
  { size: "w-2 h-2", color: "bg-purple-400/25", pattern: "orbit-small" },
  { size: "w-1 h-1", color: "bg-brand-300/35", pattern: "orbit-medium" },
  { size: "w-2.5 h-2.5", color: "bg-violet-500/20", pattern: "orbit-medium" },
  
  // === BOUNCING PARTICLES ===
  { size: "w-2 h-2", color: "bg-brand-400/30", pattern: "bounce" },
  { size: "w-1.5 h-1.5", color: "bg-purple-500/35", pattern: "bounce" },
  { size: "w-2.5 h-2.5", color: "bg-brand-500/25", pattern: "bounce-soft" },
  
  // === FLOATING RINGS ===
  { size: "w-3 h-3", color: "border border-brand-500/20", pattern: "ring-float", isRing: true },
  { size: "w-4 h-4", color: "border border-purple-400/15", pattern: "ring-float", isRing: true },
  { size: "w-2 h-2", color: "border border-brand-300/25", pattern: "ring-pulse", isRing: true },
  
  // === ADDITIONAL VARIETY ===
  { size: "w-1 h-1", color: "bg-fuchsia-400/40", pattern: "float-up" },
  { size: "w-2 h-2", color: "bg-indigo-400/30", pattern: "drift-right" },
  { size: "w-1.5 h-1.5", color: "bg-pink-400/35", pattern: "wave" },
  { size: "w-2 h-2", color: "bg-cyan-400/25", pattern: "spiral" },
  { size: "w-1 h-1", color: "bg-teal-400/40", pattern: "scatter" },
  { size: "w-3 h-3", color: "bg-rose-400/20", pattern: "slow-drift" },
  { size: "w-1.5 h-1.5", color: "bg-amber-400/30", pattern: "pulse" },
  { size: "w-2 h-2", color: "bg-emerald-400/25", pattern: "float-diagonal" },
];

// Additional layer of micro particles for density
const microParticles = [
  { size: "w-px h-px", color: "bg-white/30" },
  { size: "w-px h-px", color: "bg-brand-300/35" },
  { size: "w-px h-px", color: "bg-purple-300/30" },
  { size: "w-0.5 h-0.5", color: "bg-white/25" },
  { size: "w-0.5 h-0.5", color: "bg-brand-200/30" },
  { size: "w-px h-px", color: "bg-violet-200/35" },
  { size: "w-px h-px", color: "bg-white/20" },
  { size: "w-0.5 h-0.5", color: "bg-purple-200/25" },
  { size: "w-px h-px", color: "bg-brand-100/30" },
  { size: "w-0.5 h-0.5", color: "bg-white/35" },
  { size: "w-px h-px", color: "bg-violet-100/30" },
  { size: "w-0.5 h-0.5", color: "bg-brand-300/25" },
  { size: "w-px h-px", color: "bg-purple-100/35" },
  { size: "w-px h-px", color: "bg-white/28" },
  { size: "w-0.5 h-0.5", color: "bg-brand-200/32" },
];

export default function SectionBackground({ 
  prefersReducedMotion = false,
  showParticles = true,
  showMeshGradient = true 
}: SectionBackgroundProps) {
  // Memoize particle positions for consistent rendering
  const particlePositions = useMemo(() => 
    particleConfigs.map((_, i) => ({
      top: (5 + (i * 17) % 85),
      left: (3 + (i * 23) % 92),
    })), []
  );

  const microPositions = useMemo(() =>
    microParticles.map((_, i) => ({
      top: (2 + (i * 13) % 94),
      left: (1 + (i * 19) % 96),
    })), []
  );

  return (
    <>
      {/* Background gradient orbs - Enhanced with more layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Primary orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl"
          animate={
            prefersReducedMotion
              ? {}
              : { y: [0, -20, 0], scale: [1, 1.05, 1] }
          }
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-700/15 rounded-full blur-3xl"
          animate={
            prefersReducedMotion
              ? {}
              : { y: [0, 20, 0], scale: [1, 1.08, 1] }
          }
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Secondary orbs */}
        <motion.div
          className="absolute top-1/3 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
          animate={
            prefersReducedMotion
              ? {}
              : { y: [0, 15, 0], scale: [1, 1.1, 1] }
          }
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -left-20 w-72 h-72 bg-brand-400/10 rounded-full blur-3xl"
          animate={
            prefersReducedMotion
              ? {}
              : { y: [0, -18, 0], scale: [1, 1.06, 1] }
          }
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Tertiary orbs for extra depth */}
        <motion.div
          className="absolute top-1/2 left-1/3 w-48 h-48 bg-violet-500/8 rounded-full blur-2xl"
          animate={
            prefersReducedMotion
              ? {}
              : { y: [0, 12, 0], x: [0, 8, 0], scale: [1, 1.15, 1] }
          }
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-20 right-1/4 w-40 h-40 bg-fuchsia-500/8 rounded-full blur-2xl"
          animate={
            prefersReducedMotion
              ? {}
              : { y: [0, -10, 0], scale: [1, 1.12, 1] }
          }
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-56 h-56 bg-indigo-500/8 rounded-full blur-3xl"
          animate={
            prefersReducedMotion
              ? {}
              : { y: [0, 14, 0], scale: [1, 1.08, 1] }
          }
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Mesh gradient background - Enhanced with more layers */}
      {showMeshGradient && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(ellipse at 20% 30%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 70%, rgba(124, 58, 237, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(168, 85, 247, 0.08) 0%, transparent 70%),
              radial-gradient(ellipse at 30% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 40%),
              radial-gradient(ellipse at 70% 20%, rgba(167, 139, 250, 0.1) 0%, transparent 40%)
            `,
          }}
        />
      )}

      {/* Main dynamic floating particles */}
      {showParticles && !prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none">
          {particleConfigs.map((particle, i) => {
            const pos = particlePositions[i];
            const delay = i * 0.15;
            const duration = 2.5 + (i % 7);
            
            // Different animation patterns
            const getAnimation = () => {
              switch (particle.pattern) {
                case "float-up":
                  return { y: [0, -50, 0], opacity: [0.15, 0.8, 0.15] };
                case "drift-right":
                  return { x: [0, 40, 0], y: [0, -20, 0], opacity: [0.2, 0.7, 0.2] };
                case "drift-left":
                  return { x: [0, -35, 0], y: [0, -15, 0], opacity: [0.2, 0.65, 0.2] };
                case "pulse":
                  return { scale: [1, 1.6, 1], opacity: [0.15, 0.6, 0.15] };
                case "float-diagonal":
                  return { x: [0, 25, 0], y: [0, -35, 0], opacity: [0.2, 0.7, 0.2] };
                case "sparkle":
                  return { scale: [1, 2, 1], opacity: [0, 1, 0] };
                case "twinkle":
                  return { scale: [0.8, 1.5, 0.8], opacity: [0.1, 0.9, 0.1], rotate: [0, 180, 360] };
                case "slow-drift":
                  return { x: [0, 20, 0], y: [0, -30, 0], scale: [1, 1.25, 1], opacity: [0.08, 0.4, 0.08] };
                case "scatter":
                  return { x: [0, (i % 2 === 0 ? 20 : -20), 0], y: [0, -25, 0], opacity: [0.15, 0.6, 0.15] };
                case "orbit-small":
                  return { x: [0, 15, 0, -15, 0], y: [0, 10, 20, 10, 0], opacity: [0.2, 0.5, 0.2] };
                case "orbit-medium":
                  return { x: [0, 25, 0, -25, 0], y: [0, 15, 30, 15, 0], opacity: [0.15, 0.45, 0.15] };
                case "bounce":
                  return { y: [0, -40, 0], scale: [1, 1.2, 1], opacity: [0.2, 0.6, 0.2] };
                case "bounce-soft":
                  return { y: [0, -25, 0], scale: [1, 1.1, 1], opacity: [0.15, 0.5, 0.15] };
                case "spiral":
                  return { x: [0, 15, 0, -15, 0], y: [0, -10, -20, -10, 0], rotate: [0, 90, 180, 270, 360], opacity: [0.2, 0.55, 0.2] };
                case "wave":
                  return { x: [0, 10, 0, -10, 0], y: [0, -15, -25, -15, 0], opacity: [0.2, 0.6, 0.2] };
                case "ring-float":
                  return { y: [0, -30, 0], scale: [1, 1.3, 1], opacity: [0.1, 0.4, 0.1] };
                case "ring-pulse":
                  return { scale: [1, 1.5, 1], opacity: [0.1, 0.35, 0.1] };
                default:
                  return { y: [0, -30, 0], opacity: [0.2, 0.7, 0.2] };
              }
            };

            // Ring elements have different styling
            if (particle.isRing) {
              return (
                <motion.div
                  key={i}
                  className={`absolute ${particle.size} ${particle.color} rounded-full`}
                  style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                  animate={getAnimation()}
                  transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
                />
              );
            }

            return (
              <motion.div
                key={i}
                className={`absolute ${particle.size} ${particle.color} rounded-full`}
                style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                animate={getAnimation()}
                transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
              />
            );
          })}
        </div>
      )}

      {/* Micro particles layer for extra density */}
      {showParticles && !prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none">
          {microParticles.map((particle, i) => {
            const pos = microPositions[i];
            return (
              <motion.div
                key={`micro-${i}`}
                className={`absolute ${particle.size} ${particle.color} rounded-full`}
                style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.1, 0.5, 0.1],
                }}
                transition={{
                  duration: 4 + (i % 3),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Horizontal drifting glows - Multiple layers */}
      {showParticles && !prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Fast small glows */}
          <motion.div
            className="absolute w-4 h-4 bg-brand-400/25 rounded-full blur-lg"
            style={{ top: "15%", left: "-3%" }}
            animate={{ x: ["0vw", "105vw"], opacity: [0, 0.7, 0.7, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 0 }}
          />
          <motion.div
            className="absolute w-3 h-3 bg-purple-500/30 rounded-full blur-md"
            style={{ top: "35%", left: "-3%" }}
            animate={{ x: ["0vw", "105vw"], opacity: [0, 0.6, 0.6, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 3 }}
          />
          
          {/* Medium glows */}
          <motion.div
            className="absolute w-6 h-6 bg-brand-400/20 rounded-full blur-xl"
            style={{ top: "30%", left: "-3%" }}
            animate={{ x: ["0vw", "105vw"], opacity: [0, 0.6, 0.6, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 0 }}
          />
          <motion.div
            className="absolute w-4 h-4 bg-purple-500/25 rounded-full blur-lg"
            style={{ top: "60%", left: "-3%" }}
            animate={{ x: ["0vw", "105vw"], opacity: [0, 0.5, 0.5, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 5 }}
          />
          
          {/* Large slow glows */}
          <motion.div
            className="absolute w-8 h-8 bg-brand-500/15 rounded-full blur-2xl"
            style={{ top: "80%", left: "-3%" }}
            animate={{ x: ["0vw", "105vw"], opacity: [0, 0.4, 0.4, 0] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear", delay: 10 }}
          />
          <motion.div
            className="absolute w-10 h-10 bg-violet-500/12 rounded-full blur-2xl"
            style={{ top: "50%", left: "-3%" }}
            animate={{ x: ["0vw", "105vw"], opacity: [0, 0.35, 0.35, 0] }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear", delay: 15 }}
          />
          
          {/* Extra large very slow glow */}
          <motion.div
            className="absolute w-12 h-12 bg-brand-400/10 rounded-full blur-3xl"
            style={{ top: "70%", left: "-3%" }}
            animate={{ x: ["0vw", "105vw"], opacity: [0, 0.3, 0.3, 0] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear", delay: 20 }}
          />
        </div>
      )}

      {/* Vertical rising particles */}
      {showParticles && !prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute w-2 h-2 bg-brand-300/30 rounded-full blur-sm"
            style={{ top: "100%", left: "10%" }}
            animate={{ y: ["0vh", "-110vh"], opacity: [0, 0.6, 0.6, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 0 }}
          />
          <motion.div
            className="absolute w-1.5 h-1.5 bg-purple-400/35 rounded-full blur-sm"
            style={{ top: "100%", left: "30%" }}
            animate={{ y: ["0vh", "-110vh"], opacity: [0, 0.5, 0.5, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 5 }}
          />
          <motion.div
            className="absolute w-2.5 h-2.5 bg-brand-500/25 rounded-full blur-md"
            style={{ top: "100%", left: "50%" }}
            animate={{ y: ["0vh", "-110vh"], opacity: [0, 0.45, 0.45, 0] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear", delay: 10 }}
          />
          <motion.div
            className="absolute w-1 h-1 bg-violet-300/40 rounded-full blur-sm"
            style={{ top: "100%", left: "70%" }}
            animate={{ y: ["0vh", "-110vh"], opacity: [0, 0.55, 0.55, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear", delay: 7 }}
          />
          <motion.div
            className="absolute w-3 h-3 bg-brand-400/20 rounded-full blur-lg"
            style={{ top: "100%", left: "85%" }}
            animate={{ y: ["0vh", "-110vh"], opacity: [0, 0.4, 0.4, 0] }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear", delay: 12 }}
          />
        </div>
      )}

      {/* Shooting stars / streaks */}
      {showParticles && !prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute w-20 h-0.5 bg-gradient-to-r from-transparent via-brand-400/40 to-transparent rounded-full"
            style={{ top: "20%", left: "-10%", transform: "rotate(-15deg)" }}
            animate={{ x: ["0vw", "120vw"], opacity: [0, 0.8, 0.8, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 2 }}
          />
          <motion.div
            className="absolute w-16 h-0.5 bg-gradient-to-r from-transparent via-purple-400/35 to-transparent rounded-full"
            style={{ top: "45%", left: "-10%", transform: "rotate(-20deg)" }}
            animate={{ x: ["0vw", "120vw"], opacity: [0, 0.7, 0.7, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: 6 }}
          />
          <motion.div
            className="absolute w-24 h-0.5 bg-gradient-to-r from-transparent via-brand-300/30 to-transparent rounded-full"
            style={{ top: "75%", left: "-10%", transform: "rotate(-10deg)" }}
            animate={{ x: ["0vw", "120vw"], opacity: [0, 0.6, 0.6, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 10 }}
          />
        </div>
      )}
    </>
  );
}
