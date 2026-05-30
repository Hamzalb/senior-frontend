"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence, type Variants } from "framer-motion";
import {
  Edit3,
  Search,
  MessageCircle,
  Handshake,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Zap,
} from "lucide-react";

// Animation variants with smooth transitions
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
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

const expandedContentVariants: Variants = {
  collapsed: { 
    height: 0,
    opacity: 0,
    marginTop: 0,
  },
  expanded: { 
    height: "auto",
    opacity: 1,
    marginTop: 16,
    transition: {
      height: { duration: 0.4 },
      opacity: { duration: 0.4, delay: 0.05 },
    },
  },
};

// Step data
const steps = [
  {
    number: 1,
    title: "Post Your Item",
    shortDescription: "Create a listing with photos and details of what you want to trade.",
    expandedDescription: "Snap a few photos, write a compelling title, and describe your item's condition. Our AI-powered suggestions help you create listings that get noticed. Set your preferred exchange categories and let the offers roll in.",
    icon: Edit3,
    gradient: "from-violet-500 to-purple-600",
    shadowColor: "shadow-violet-500/20",
    tips: ["Take clear, well-lit photos", "Be honest about condition", "Set realistic expectations"],
  },
  {
    number: 2,
    title: "Browse Offers",
    shortDescription: "Explore listings or filter by category to find exactly what you need.",
    expandedDescription: "Use our smart search to find items that match your interests. Filter by category, location, or item condition. Save favorites and get notified when new items match your preferences. Our recommendation engine learns what you like.",
    icon: Search,
    gradient: "from-violet-500 to-purple-600",
    shadowColor: "shadow-violet-500/20",
    tips: ["Use specific keywords", "Check item history", "Compare multiple offers"],
  },
  {
    number: 3,
    title: "Connect & Chat",
    shortDescription: "Message other users to discuss details and negotiate the exchange.",
    expandedDescription: "Our secure messaging system lets you communicate safely with other traders. Share additional photos, ask questions, and negotiate terms. Video calls and voice messages make communication personal and trustworthy.",
    icon: MessageCircle,
    gradient: "from-violet-500 to-purple-600",
    shadowColor: "shadow-violet-500/20",
    tips: ["Be responsive", "Ask clarifying questions", "Be respectful and friendly"],
  },
  {
    number: 4,
    title: "Complete the Swap",
    shortDescription: "Finalize details and arrange a safe, convenient exchange.",
    expandedDescription: "Agree on a time and place that works for both parties. Use our built-in safety features like verified locations and exchange checklists. After the swap, leave a review to help build community trust. Celebrate your successful trade!",
    icon: Handshake,
    gradient: "from-violet-500 to-purple-600",
    shadowColor: "shadow-violet-500/20",
    tips: ["Meet in public places", "Bring a friend if possible", "Leave honest reviews"],
  },
];

// Animated connecting line component
const ConnectingLine = ({ isActive, gradient }: { isActive: boolean; gradient: string }) => {
  return (
    <div className="hidden lg:block absolute top-1/2 left-full w-full h-0.5 -translate-y-1/2 z-0">
      <div className="relative w-full h-full">
        {/* Base line */}
        <div className="absolute inset-0 bg-white/10" />
        {/* Animated flow */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${gradient}`}
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: isActive ? 1 : 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
        {/* Particle effect */}
        {isActive && (
          <motion.div
            className={`absolute w-3 h-3 rounded-full bg-gradient-to-r ${gradient} blur-sm`}
            animate={{
              x: ["0%", "100%"],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
      </div>
    </div>
  );
};

// Step card component
interface StepCardProps {
  step: typeof steps[0];
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  isActive: boolean;
  prefersReducedMotion: boolean;
}

const StepCard = ({ step, index, isExpanded, onToggle, isActive, prefersReducedMotion }: StepCardProps) => {
  const Icon = step.icon;
  const isLast = index === steps.length - 1;

  return (
    <motion.div
      variants={cardVariants}
      className="relative"
    >
      {/* Connecting line for desktop */}
      {!isLast && (
        <ConnectingLine isActive={isActive} gradient={step.gradient} />
      )}

      <div
        className={`
          relative rounded-3xl overflow-hidden cursor-pointer
          bg-gradient-to-b from-white/[0.08] to-white/[0.02]
          backdrop-blur-xl
          border transition-all duration-500 ease-out
          ${isExpanded ? "border-white/30 shadow-2xl" : "border-white/10 hover:border-white/20"}
          ${step.shadowColor}
          ${isExpanded ? "shadow-2xl" : "hover:shadow-xl"}
        `}
        onClick={onToggle}
        onKeyDown={(e) => e.key === "Enter" && onToggle()}
        tabIndex={0}
        role="button"
        aria-expanded={isExpanded}
      >
        {/* Animated border glow */}
        <motion.div
          className={`absolute inset-0 rounded-3xl opacity-0 bg-gradient-to-r ${step.gradient}`}
          animate={isExpanded ? { opacity: 0.1 } : { opacity: 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Top accent line */}
        <motion.div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${step.gradient}`}
          animate={isExpanded ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.3 }}
        />

        <div className="p-6 md:p-8">
          {/* Header row */}
          <div className="flex items-start gap-4 mb-4">
            {/* Step number badge */}
            <motion.div
              className={`
                relative flex-shrink-0 w-14 h-14 rounded-2xl
                bg-gradient-to-br ${step.gradient}
                flex items-center justify-center
                shadow-lg
              `}
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-2xl font-bold text-white">{step.number}</span>
              
              {/* Pulse effect when active */}
              {isActive && !prefersReducedMotion && (
                <motion.div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.gradient}`}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </motion.div>

            {/* Icon */}
            <motion.div
              className={`
                flex-shrink-0 w-14 h-14 rounded-2xl
                bg-white/5 backdrop-blur-xl border border-white/10
                flex items-center justify-center
                transition-colors duration-300
                ${isActive ? "text-white" : "text-white/60"}
              `}
              animate={isActive ? { 
                backgroundColor: "rgba(255,255,255,0.1)",
              } : {}}
            >
              <motion.div
                animate={isActive && !prefersReducedMotion ? { 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                } : {}}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              >
                <Icon className="w-7 h-7" />
              </motion.div>
            </motion.div>

            {/* Expand indicator */}
            <motion.div
              className="ml-auto flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ArrowRight className="w-4 h-4 text-white/50 rotate-90" />
            </motion.div>
          </div>

          {/* Title */}
          <h3 className="text-xl md:text-2xl font-heading font-semibold text-white mb-2">
            {step.title}
          </h3>

          {/* Short description */}
          <p className="text-white/60 leading-relaxed">
            {step.shortDescription}
          </p>

          {/* Expanded content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                variants={expandedContentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="overflow-hidden"
              >
                {/* Expanded description */}
                <p className="text-white/80 leading-relaxed mb-4">
                  {step.expandedDescription}
                </p>

                {/* Tips */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-brand-500">Pro Tips:</p>
                  <ul className="space-y-1">
                    {step.tips.map((tip, tipIndex) => (
                      <motion.li
                        key={tip}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: tipIndex * 0.1 }}
                        className="flex items-center gap-2 text-sm text-white/60"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        {tip}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6"
                >
                  <Link href="/products">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-6 py-3 rounded-xl bg-gradient-to-r ${step.gradient} text-white font-semibold text-sm`}
                    >
                      Get Started
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden">
          <motion.div
            className={`h-full w-full bg-gradient-to-r ${step.gradient}`}
            initial={{ x: "-100%" }}
            animate={isActive ? { x: "0%" } : { x: "-100%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default function HowItWorks() {
  const mountedRef = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    mountedRef.current = true;
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return;
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mountedRef.current) setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      if (mountedRef.current) setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!mountedRef.current) return;
    if (!isAutoPlay || prefersReducedMotion) return;

    const interval = setInterval(() => {
      if (mountedRef.current) {
        setActiveStep((prev) => (prev + 1) % steps.length);
        setCurrentSlide((prev) => (prev + 1) % steps.length);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlay, prefersReducedMotion]);

  const toggleStep = useCallback((index: number) => {
    setExpandedStep((prev) => (prev === index ? null : index));
    setActiveStep(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % steps.length);
    setActiveStep((prev) => (prev + 1) % steps.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + steps.length) % steps.length);
    setActiveStep((prev) => (prev - 1 + steps.length) % steps.length);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-surface text-white overflow-hidden py-24 sm:py-32"
    >
      {/* Background gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
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
      </div>

      {/* Mesh gradient background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(124, 58, 237, 0.15) 0%, transparent 50%)
          `,
        }}
      />

      {/* Floating particles */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-brand-500/30 rounded-full"
              style={{
                top: `${20 + i * 15}%`,
                left: `${10 + i * 20}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            />
          ))}
        </div>
      )}

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
              <Zap className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-medium text-white/80 tracking-wide uppercase">
                Simple Process
              </span>
            </div>
          </motion.div>

          <motion.h2
            variants={headerVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold tracking-tight mb-6"
          >
            <span className="bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
              How It
            </span>
            <span className="text-brand-500"> Works</span>
          </motion.h2>

          <motion.p
            variants={headerVariants}
            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed"
          >
            Trade smarter in four simple steps — from listing to swapping
          </motion.p>

          {/* Auto-play toggle */}
          <motion.div
            variants={headerVariants}
            className="flex items-center justify-center gap-4 mt-8"
          >
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                isAutoPlay
                  ? "bg-brand-500/20 text-brand-500 border border-brand-500/30"
                  : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
              }`}
            >
              {isAutoPlay ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span className="text-sm">Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span className="text-sm">Auto-play</span>
                </>
              )}
            </button>
          </motion.div>
        </motion.div>

        {/* Desktop Grid View */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="hidden lg:grid grid-cols-4 gap-6"
        >
          {steps.map((step, index) => (
            <StepCard
              key={step.number}
              step={step}
              index={index}
              isExpanded={expandedStep === index}
              onToggle={() => toggleStep(index)}
              isActive={activeStep === index}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </motion.div>

        {/* Mobile Carousel View */}
        <div className="lg:hidden">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="relative"
          >
            {/* Carousel container */}
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <StepCard
                    step={steps[currentSlide]}
                    index={currentSlide}
                    isExpanded={expandedStep === currentSlide}
                    onToggle={() => toggleStep(currentSlide)}
                    isActive={true}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevSlide}
                className="p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </motion.button>

              {/* Dots indicator */}
              <div className="flex items-center gap-2">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentSlide(index);
                      setActiveStep(index);
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      currentSlide === index
                        ? "bg-brand-500 w-6"
                        : "bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextSlide}
                className="p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mt-16 md:mt-20"
        >
          <Link href="/products">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-8 py-4 bg-gradient-to-r from-brand-500 via-brand-400 to-brand-700 text-slate-950 rounded-xl text-lg font-semibold overflow-hidden shadow-lg shadow-brand-500/20"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center gap-2 font-heading font-semibold tracking-tight">
                Start Trading Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-brand-500/10 rounded-tl-3xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-brand-500/10 rounded-br-3xl" />
    </section>
  );
}
