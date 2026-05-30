"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp, Users, Recycle, type LucideIcon } from "lucide-react";

// Animation variants for staggered children with smooth easing
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Text item variants with smooth transitions
const textVariants = {
  hidden: {
    opacity: 0,
    y: 60,
    rotateX: -15,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.8,
    } as const,
  },
};

// Fade up variants with smooth transitions
const fadeUpVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
    } as const,
  },
};

// Glassmorphism card variants with smooth transitions
const cardVariants = {
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
    } as const,
  },
};

// Stats data with enhanced properties
// Colors match brand palette: brand-500 (#a855f7), brand-400 (#c084fc), brand-700 (#7c3aed)
const stats = [
  { 
    icon: Users, 
    value: 10000, 
    displayValue: "10K+",
    label: "Active Users",
    progress: 0.85,
    trend: "+12%",
    color: "#a855f7" // brand-500
  },
  { 
    icon: Recycle, 
    value: 25000, 
    displayValue: "25K+",
    label: "Items Exchanged",
    progress: 0.92,
    trend: "+8%",
    color: "#c084fc" // brand-400
  },
  { 
    icon: TrendingUp, 
    value: 98, 
    displayValue: "98%",
    label: "Success Rate",
    progress: 0.98,
    trend: "Excellent",
    color: "#7c3aed" // brand-700
  },
];

// Custom hook for number counter animation
function useCountUp(end: number, duration: number = 2000, isInView: boolean) {
  const [count, setCount] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const mountedRef = useRef(false);
  
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);
  
  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number | null = null;
    const startValue = 0;
    
    const animate = (currentTime: number) => {
      if (!mountedRef.current) return;
      
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(startValue + (end - startValue) * easeOutQuart);
      
      setCount(currentCount);
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [end, duration, isInView]);
  
  return count;
}

// Premium Stat Card Component
interface StatCardProps {
  icon: LucideIcon;
  value: number;
  displayValue: string;
  label: string;
  progress: number;
  trend?: string;
  color?: string;
  index: number;
}

function StatCard({ icon: Icon, value, displayValue, label, progress, trend, color = "#a855f7", index }: StatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });
  const [isHovered, setIsHovered] = useState(false);
  
  const count = useCountUp(value, 2000, isInView);
  
  // Progress ring calculations
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress * circumference);
  
  // Format the count for display
  const formatCount = (num: number) => {
    if (num >= 10000) {
      return `${(num / 1000).toFixed(0)}K+`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    } else if (displayValue.includes('%')) {
      return `${num}%`;
    }
    return num.toString();
  };
  
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ 
        duration: 0.5,
        delay: index * 0.08,
        ease: "easeOut"
      }}
      className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ 
        scale: 1.02,
        y: -5,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
    >
      {/* Animated border glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `linear-gradient(135deg, transparent 30%, ${color}30 50%, transparent 70%)`,
          backgroundSize: "200% 200%",
        }}
        animate={isHovered ? {
          backgroundPosition: ["0% 0%", "100% 100%"],
        } : {}}
        transition={{ duration: 1.5, ease: "linear" }}
      />
      
      {/* Outer glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        style={{
          boxShadow: `0 0 40px ${color}20, inset 0 0 40px ${color}10`,
        }}
        transition={{ duration: 0.3 }}
      />
      
      <div className="relative flex items-center gap-5">
        {/* Progress Ring with Icon */}
        <div className="relative w-[70px] h-[70px] flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 70 70">
            {/* Background track */}
            <circle
              cx="35"
              cy="35"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="4"
            />
            {/* Animated progress arc */}
            <motion.circle
              cx="35"
              cy="35"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={isInView ? { strokeDashoffset } : {}}
              transition={{ 
                duration: 1.2,
                delay: index * 0.15,
                ease: "easeOut" 
              }}
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color} />
                <stop offset="100%" stopColor={`${color}80`} />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Icon with glow effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Glow backdrop */}
              <motion.div
                className="absolute inset-0 rounded-full blur-lg"
                style={{ backgroundColor: color }}
                initial={{ opacity: 0, scale: 1 }}
                animate={{ 
                  opacity: isHovered ? 0.6 : 0.3,
                  scale: isHovered ? 1.5 : 1.2
                }}
                transition={{ duration: 0.3 }}
              />
              {/* Icon container */}
              <div 
                className="relative p-2 rounded-xl"
                style={{ 
                  background: `linear-gradient(135deg, ${color}30, ${color}10)`
                }}
              >
                <Icon 
                  className="w-5 h-5 relative" 
                  style={{ color }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <motion.p 
              className="text-3xl font-heading font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.08 + 0.2, duration: 0.4, ease: "easeOut" }}
            >
              {isInView ? formatCount(count) : "0"}
            </motion.p>
            {trend && (
              <motion.span 
                className="text-xs font-semibold px-2 py-0.5 rounded-full tracking-wide"
                style={{ 
                  color: trend.includes('+') ? '#4ade80' : color,
                  backgroundColor: trend.includes('+') ? 'rgba(74, 222, 128, 0.15)' : `${color}20`
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: index * 0.08 + 0.35, duration: 0.3, ease: "easeOut" }}
              >
                {trend}
              </motion.span>
            )}
          </div>
          <motion.p 
            className="text-sm text-white/70 font-sans font-medium mt-1 tracking-wide"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: index * 0.08 + 0.3, duration: 0.4, ease: "easeOut" }}
          >
            {label}
          </motion.p>
        </div>
      </div>
      
      {/* Sparkline decoration */}
      <motion.div 
        className="absolute bottom-3 right-3 opacity-20 group-hover:opacity-40 transition-opacity"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.2 } : {}}
        transition={{ delay: index * 0.08 + 0.4 }}
      >
        <svg width="50" height="16" className="text-white">
          <motion.polyline
            points="0,12 8,8 16,10 24,4 32,6 40,2 50,4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: index * 0.08 + 0.5, ease: "easeOut" }}
          />
        </svg>
      </motion.div>
      
      {/* Subtle corner accent */}
      <div 
        className="absolute top-0 right-0 w-16 h-16 opacity-20"
        style={{
          background: `radial-gradient(circle at top right, ${color}30, transparent 70%)`
        }}
      />
    </motion.div>
  );
}

export default function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  // Scroll-based parallax
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  // Very gradual fade - content stays visible for most of the scroll
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.5, 0.85, 1],
    [1, 1, 0.5, 0]
  );

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  useEffect(() => {
    mountedRef.current = true;
    setIsLoaded(true);
    
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  // Split title into words for staggered animation
  const titleWords = ["yalla", "nbadel"];

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex bg-surface text-white overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0"
        style={{ y: backgroundY }}
      >
        <Image
          src="/assets/herobg.png"
          alt="Background"
          fill
          priority
          style={{ objectFit: "cover" }}
          className="opacity-90"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface/60 via-transparent to-surface/80" />
      </motion.div>

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary orb - top left */}
        <motion.div
          className="absolute -top-20 -left-20 w-80 h-80 md:w-96 md:h-96 bg-brand-500/30 rounded-full blur-3xl"
          animate={prefersReducedMotion ? {} : {
            y: [0, -20, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Secondary orb - bottom right */}
        <motion.div
          className="absolute -bottom-32 -right-32 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] bg-brand-700/25 rounded-full blur-3xl"
          animate={prefersReducedMotion ? {} : {
            y: [0, -24, 0],
            scale: [1, 1.07, 1],
          }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Accent orb - center right */}
        <motion.div
          className="absolute top-1/3 right-10 w-64 h-64 md:w-80 md:h-80 bg-brand-500/20 rounded-full blur-2xl"
          animate={prefersReducedMotion ? {} : {
            y: [0, -28, 0],
            scale: [1, 1.09, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Subtle glow orb - center */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-80 sm:h-80 md:w-[400px] md:h-[400px] lg:w-[600px] lg:h-[600px] bg-brand-400/10 rounded-full blur-3xl"
          animate={prefersReducedMotion ? {} : {
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Additional floating particles */}
        {!prefersReducedMotion && [...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-brand-500/60 rounded-full"
            style={{
              top: `${30 + i * 20}%`,
              left: `${20 + i * 25}%`,
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

      {/* Main Content */}
      <motion.div
        className="relative h-full flex items-center w-full"
        style={{ y: textY, opacity }}
      >
        <div className="w-full px-6 md:px-12 lg:px-24 py-20">
          <AnimatePresence>
            {isLoaded && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                {/* Glassmorphism Badge */}
                <motion.div variants={fadeUpVariants}>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
                    <Sparkles className="w-4 h-4 text-brand-500" />
                    <span className="text-sm font-medium text-white/80 tracking-wide">
                      Sustainable Trading Platform
                    </span>
                  </div>
                </motion.div>

                {/* Title with Staggered Animation */}
                <motion.h1
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-heading font-bold tracking-tight leading-none"
                  variants={containerVariants}
                >
                  {titleWords.map((word, index) => (
                    <motion.span
                      key={index}
                      variants={textVariants}
                      className="inline-block mr-4 md:mr-6"
                    >
                      <span
                        className={
                          index === 0
                            ? "bg-gradient-to-r from-white via-brand-200 to-white bg-clip-text text-transparent"
                            : "text-brand-500"
                        }
                      >
                        {word}
                      </span>
                    </motion.span>
                  ))}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  variants={fadeUpVariants}
                  className="text-xl md:text-2xl lg:text-3xl font-heading font-medium text-white/80 max-w-2xl tracking-tight"
                >
                  Trade it, Don&apos;t waste it
                </motion.p>

                {/* Description */}
                <motion.p
                  variants={fadeUpVariants}
                  className="text-base md:text-lg font-sans text-white/60 max-w-xl leading-relaxed"
                >
                  Join thousands of users exchanging items they no longer need.
                  Save money, reduce waste, and build a sustainable community.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  variants={fadeUpVariants}
                  className="flex flex-col sm:flex-row gap-4 pt-4"
                >
                  <Link href="/products">
                    <motion.button
                      className="group relative px-8 py-4 bg-gradient-to-r from-brand-500 via-brand-400 to-brand-700 text-slate-950 rounded-xl text-lg font-semibold overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Shimmer effect */}
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <span className="relative flex items-center gap-2 font-heading font-semibold tracking-tight">
                        yalla nbadel Now
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </motion.button>
                  </Link>

                  <Link href="/categories">
                    <motion.button
                      className="group px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/20 text-white rounded-xl text-lg font-heading font-semibold tracking-tight hover:bg-white/10 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flex items-center gap-2">
                        Browse Categories
                      </span>
                    </motion.button>
                  </Link>
                </motion.div>

                {/* Premium Stats Cards */}
                <motion.div
                  variants={containerVariants}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 pt-12 max-w-4xl"
                >
                  {stats.map((stat, index) => (
                    <StatCard
                      key={index}
                      {...stat}
                      index={index}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer z-10"
        animate={prefersReducedMotion ? {} : { y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        onClick={scrollToContent}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-7 h-12 border-2 border-white/30 rounded-full flex justify-center pt-2 backdrop-blur-sm bg-white/5">
          <motion.div
            className="w-1.5 h-3 bg-white/50 rounded-full"
            animate={prefersReducedMotion ? {} : {
              opacity: [0.5, 1, 0.5],
              y: [0, 6, 0],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <p className="text-xs text-white/40 mt-2 text-center">Scroll</p>
      </motion.div>

      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-brand-500/20 rounded-tl-3xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-brand-500/20 rounded-br-3xl" />
    </section>
  );
}
