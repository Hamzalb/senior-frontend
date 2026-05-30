"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { DollarSign, Users, ShieldCheck, Box, ArrowUpRight, Sparkles } from "lucide-react";
import SectionBackground from "./SectionBackground";

// Animation variants with smooth transitions
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 40,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
    },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.7,
    },
  },
};

const benefits = [
  {
    title: "Zero Fees",
    description: "No transaction costs—swap directly with other members without any hidden charges.",
    Icon: DollarSign,
    gradient: "from-brand-400 to-brand-500",
    shadowColor: "shadow-brand-500/20",
    hoverShadow: "hover:shadow-brand-500/40",
  },
  {
    title: "Community-Driven",
    description: "Join local barter groups and build lasting trust with like-minded members.",
    Icon: Users,
    gradient: "from-brand-500 to-brand-600",
    shadowColor: "shadow-brand-500/20",
    hoverShadow: "hover:shadow-brand-500/40",
  },
  {
    title: "Safe & Secure",
    description: "We verify all profiles so you can swap with complete confidence and peace of mind.",
    Icon: ShieldCheck,
    gradient: "from-brand-400 to-brand-600",
    shadowColor: "shadow-brand-500/20",
    hoverShadow: "hover:shadow-brand-500/40",
  },
  {
    title: "Wide Variety",
    description: "From electronics to automobiles—discover thousands of items available for exchange.",
    Icon: Box,
    gradient: "from-brand-500 to-brand-700",
    shadowColor: "shadow-brand-500/20",
    hoverShadow: "hover:shadow-brand-500/40",
  },
];

export default function WhyUseDakesh() {
  const mountedRef = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mountedRef.current) setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      if (mountedRef.current) setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-surface text-white overflow-hidden py-24 sm:py-32"
    >
      {/* Unified background style from HowItWorks */}
      <SectionBackground prefersReducedMotion={prefersReducedMotion} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-16 md:mb-20"
        >
          <motion.div variants={headerVariants} className="inline-flex items-center gap-2 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-medium text-white/80 tracking-wide uppercase">
                Benefits
              </span>
            </div>
          </motion.div>

          <motion.h2
            variants={headerVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold tracking-tight mb-6"
          >
            <span className="bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
              Why Use
            </span>
            <span className="text-brand-500"> yalla nbadel</span>
            <span className="text-white">?</span>
          </motion.h2>

          <motion.p
            variants={headerVariants}
            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed"
          >
            Discover the advantages of joining our thriving barter community
          </motion.p>

          {/* Decorative line */}
          <motion.div
            variants={headerVariants}
            className="flex justify-center mt-8"
          >
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-brand-500 to-transparent" />
          </motion.div>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              variants={cardVariants}
              className="group relative"
            >
              {/* Floating card effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              
              <div
                className={`
                  relative h-full rounded-3xl 
                  bg-gradient-to-b from-white/[0.08] to-white/[0.02]
                  backdrop-blur-xl
                  border border-white/10 
                  p-8 md:p-10
                  transition-all duration-500 ease-out
                  hover:-translate-y-2
                  hover:border-white/20
                  ${benefit.shadowColor}
                  hover:shadow-2xl
                  ${benefit.hoverShadow}
                `}
              >
                {/* Gradient glow on hover */}
                <div 
                  className={`
                    absolute inset-0 rounded-3xl opacity-0 
                    group-hover:opacity-100 transition-opacity duration-500
                    bg-gradient-to-br ${benefit.gradient}
                  `}
                  style={{ opacity: 0.05 }}
                />

                {/* Top accent line */}
                <div 
                  className={`
                    absolute top-0 left-8 right-8 h-px 
                    bg-gradient-to-r ${benefit.gradient}
                    opacity-0 group-hover:opacity-100
                    transition-opacity duration-500
                  `}
                />

                {/* Icon container */}
                <div className="relative mb-6">
                  <div 
                    className={`
                      inline-flex items-center justify-center
                      w-16 h-16 rounded-2xl
                      bg-gradient-to-br ${benefit.gradient}
                      shadow-lg
                      transition-transform duration-500
                      group-hover:scale-110 group-hover:rotate-3
                    `}
                  >
                    <benefit.Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Floating arrow */}
                  <motion.div
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                  >
                    <ArrowUpRight className="w-4 h-4 text-white/70" />
                  </motion.div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-heading font-semibold text-white mb-3 group-hover:text-white transition-colors">
                  {benefit.title}
                </h3>
                
                <p className="text-white/60 leading-relaxed text-sm md:text-base">
                  {benefit.description}
                </p>

                {/* Bottom gradient line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl overflow-hidden">
                  <div 
                    className={`
                      h-full w-full 
                      bg-gradient-to-r ${benefit.gradient}
                      opacity-0 group-hover:opacity-100
                      transition-opacity duration-500
                    `}
                  />
                </div>
              </div>

              {/* Card number indicator */}
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center">
                <span className="text-xs font-medium text-white/40">
                  {index + 1}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mt-16 md:mt-20"
        >
          <p className="text-white/40 text-sm">
            Join thousands of satisfied members today
          </p>
        </motion.div>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-brand-500/10 rounded-tl-3xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-brand-500/10 rounded-br-3xl" />
    </section>
  );
}
