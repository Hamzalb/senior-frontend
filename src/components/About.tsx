"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SectionBackground from "./SectionBackground";

// Animation variants for staggered children with smooth easing
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

// Fade up animation with smooth easing
const fadeUpVariants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
    },
  },
};

// Text reveal animation for heading with smooth easing
const textRevealVariants = {
  hidden: {
    opacity: 0,
    y: 60,
    rotateX: -10,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.8,
    },
  },
};

// Split text into characters for reveal animation
function AnimatedText({ text, className }: { text: string; className?: string }) {
  const characters = text.split("");
  
  return (
    <span className={className}>
      {characters.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: i * 0.025,
            duration: 0.5,
          }}
          className="inline-block"
          style={{ display: char === " " ? "inline" : "inline-block" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

const AboutSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const isInView = useInView(contentRef, { once: true, margin: "-100px" });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
  }, []);

  // Check for reduced motion preference
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
      className="relative bg-surface min-h-screen flex items-center justify-center overflow-hidden px-6 py-20"
    >
      {/* Unified background style from HowItWorks */}
      <SectionBackground prefersReducedMotion={prefersReducedMotion} />

      {/* Content */}
      <motion.div
        ref={contentRef}
        className="relative z-10 max-w-4xl w-full text-center"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* Heading with text reveal animation */}
        <motion.h2
          variants={textRevealVariants}
          className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-[#f7d7ff] mb-4 drop-shadow-sm"
        >
          {isInView && !prefersReducedMotion ? (
            <AnimatedText text="What is yalla nbadel?" />
          ) : (
            "What is yalla nbadel?"
          )}
        </motion.h2>

        {/* Tagline */}
        <motion.p
          variants={fadeUpVariants}
          className="text-base sm:text-xl md:text-2xl lg:text-3xl font-heading font-semibold text-slate-200 mb-8 tracking-tight"
        >
          Trade it, Don't waste it.
        </motion.p>

        {/* Description Paragraphs */}
        <motion.div
          variants={fadeUpVariants}
          className="text-base md:text-lg font-sans text-slate-200/90 leading-relaxed mb-10 px-2 md:px-6"
        >
          <p className="mb-4">
            Welcome to{" "}
            <span className="font-semibold text-brand-500">yalla nbadel</span>, the
            premier destination for seamless and rewarding bartering. We believe
            in the transformative power of trade to bring people together, foster
            meaningful connections, and unlock the hidden value in items you no
            longer need. Our platform makes bartering simple, secure, and engaging
            — connecting like-minded individuals who want to exchange goods and
            services without the complexity of traditional buying or selling.
          </p>
          <p>
            Whether you're decluttering your space, searching for something unique,
            or giving pre-loved items a new life, yalla nbadel empowers you to trade
            smarter, live more sustainably, and make purposeful exchanges. Join us in
            redefining how we exchange value — because sometimes, the best things in
            life aren't bought,{" "}
            <span className="font-semibold text-brand-500">they're traded</span>.
          </p>
        </motion.div>

        {/* CTA Button with enhanced animations */}
        <motion.div variants={fadeUpVariants}>
          <Link href="/register">
            <motion.button
              className="group relative px-8 py-4 rounded-xl text-lg font-heading font-semibold overflow-hidden border border-brand-500/60 text-brand-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                type: "spring",
                damping: 15,
                stiffness: 100,
                delay: 0.6,
              }}
            >
              {/* Animated background on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-brand-500 via-brand-400 to-brand-700"
                initial={{ x: "-100%", opacity: 0 }}
                whileHover={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />

              {/* Shimmer effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

              {/* Button text */}
              <span className="relative flex items-center gap-2 group-hover:text-slate-950 transition-colors duration-300">
                Register Here
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-24 h-24 border-l-2 border-t-2 border-brand-500/10 rounded-tl-3xl" />
      <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-brand-500/10 rounded-br-3xl" />
    </section>
  );
};

export default AboutSection;
