"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, AnimatePresence, type Variants } from "framer-motion";
import {
  Smartphone,
  Shirt,
  BookOpen,
  Gamepad2,
  Car,
  Package,
  ArrowRight,
  Sparkles,
  Grid3X3,
  LayoutGrid,
} from "lucide-react";
import SectionBackground from "./SectionBackground";

// Animation variants with smooth transitions
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30,
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

// Skeleton component for loading state
const CategorySkeleton = () => (
  <div className="rounded-3xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
    <div className="relative h-48 bg-white/5 animate-pulse" />
    <div className="p-6 space-y-3">
      <div className="h-5 w-24 bg-white/10 rounded-lg animate-pulse" />
      <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
      <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
    </div>
  </div>
);

// Category icon mapping
const categoryIcons: Record<string, React.ElementType> = {
  Electronics: Smartphone,
  Clothing: Shirt,
  Books: BookOpen,
  Toys: Gamepad2,
  Automobiles: Car,
  Other: Package,
};

// Category gradient mapping
const categoryGradients: Record<string, string> = {
  Electronics: "from-blue-500 to-cyan-400",
  Clothing: "from-pink-500 to-rose-400",
  Books: "from-amber-500 to-orange-400",
  Toys: "from-green-500 to-emerald-400",
  Automobiles: "from-violet-500 to-purple-400",
  Other: "from-slate-500 to-gray-400",
};

const categories = [
  {
    name: "Electronics",
    description: "Explore the latest gadgets and electronic devices for exchange.",
    imageUrl: "https://i.pinimg.com/736x/44/d2/ad/44d2add5a8454d1eb4d7fed3015abcd8.jpg",
    link: "/categories/electronics",
    itemCount: 234,
  },
  {
    name: "Clothing",
    description: "Discover stylish clothing and fashion items for every occasion.",
    imageUrl: "https://i.pinimg.com/736x/3d/4d/33/3d4d33650996dc8ff6e0503093627bf0.jpg",
    link: "/categories/clothing",
    itemCount: 189,
  },
  {
    name: "Books",
    description: "Dive into a world of stories, knowledge, and literary treasures.",
    imageUrl: "https://i.pinimg.com/736x/56/f7/15/56f715fb5e0233a4985911be387bb89b.jpg",
    link: "/categories/books",
    itemCount: 156,
  },
  {
    name: "Toys",
    description: "Fun and educational toys for children of all ages to enjoy.",
    imageUrl: "https://i.pinimg.com/736x/7b/05/fa/7b05fab78047f0491935e3efcf654776.jpg",
    link: "/categories/toys",
    itemCount: 98,
  },
  {
    name: "Automobiles",
    description: "Cars, motorcycles, and vehicles for those seeking mobility.",
    imageUrl: "https://i.pinimg.com/736x/3c/11/5f/3c115f879d68db7ac8e32c0f4196e071.jpg",
    link: "/categories/automobiles",
    itemCount: 45,
  },
  {
    name: "Other",
    description: "Unique and miscellaneous items waiting to be discovered.",
    imageUrl: "https://i.pinimg.com/736x/7c/72/4b/7c724b52594be48660e723177efcb637.jpg",
    link: "/categories/other",
    itemCount: 312,
  },
];

type ViewMode = "grid" | "carousel";

export default function CategoriesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const mountedRef = useRef(false);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return;

    const mediaQueryList = typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    if (!mediaQueryList) return;

    const handleChange = (e: MediaQueryListEvent) => {
      if (!mountedRef.current) return;
      setPrefersReducedMotion(e.matches);
    };

    if (mediaQueryList.matches) {
      setPrefersReducedMotion(true);
    }

    const timer = setTimeout(() => {
      if (!mountedRef.current) return;
      setIsLoading(false);
    }, 800);

    mediaQueryList.addEventListener("change", handleChange);
    return () => {
      mediaQueryList.removeEventListener("change", handleChange);
      clearTimeout(timer);
    };
  }, []);

  const displayCategories = categories.slice(0, viewMode === "grid" ? 6 : 4);

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
          className="text-center mb-16"
        >
          <motion.div variants={headerVariants} className="inline-flex items-center gap-2 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-medium text-white/80 tracking-wide uppercase">
                Categories
              </span>
            </div>
          </motion.div>

          <motion.h2
            variants={headerVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold tracking-tight mb-6"
          >
            <span className="bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
              Browse by
            </span>
            <span className="text-brand-500"> Category</span>
          </motion.h2>

          <motion.p
            variants={headerVariants}
            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed"
          >
            Find exactly what you're looking for — fast, simple, and beautifully organized
          </motion.p>

          {/* View mode toggle */}
          <motion.div
            variants={headerVariants}
            className="flex items-center justify-center gap-2 mt-8"
          >
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-xl transition-all ${
                viewMode === "grid"
                  ? "bg-brand-500/20 text-brand-500 border border-brand-500/30"
                  : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("carousel")}
              className={`p-2.5 rounded-xl transition-all ${
                viewMode === "carousel"
                  ? "bg-brand-500/20 text-brand-500 border border-brand-500/30"
                  : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
              }`}
              aria-label="Carousel view"
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
          </motion.div>
        </motion.div>

        {/* Categories Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[...Array(6)].map((_, i) => (
                <CategorySkeleton key={i} />
              ))}
            </div>
          ) : (
            <motion.div
              key={viewMode}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={`grid gap-6 lg:gap-8 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-2"
              }`}
            >
              {displayCategories.map((category, index) => {
                const Icon = categoryIcons[category.name] || Package;
                const gradient = categoryGradients[category.name] || "from-slate-500 to-gray-400";
                const isHovered = hoveredCard === category.name;

                return (
                  <motion.div
                    key={category.name}
                    variants={cardVariants}
                    custom={index}
                    onHoverStart={() => setHoveredCard(category.name)}
                    onHoverEnd={() => setHoveredCard(null)}
                    className="group relative"
                  >
                    <Link href={category.link} className="block h-full">
                      <div
                        className={`
                          relative h-full rounded-3xl overflow-hidden
                          bg-gradient-to-b from-white/[0.08] to-white/[0.02]
                          backdrop-blur-xl
                          border border-white/10
                          transition-all duration-500 ease-out
                          group-hover:-translate-y-2
                          group-hover:border-white/20
                          group-hover:shadow-2xl group-hover:shadow-brand-500/10
                        `}
                      >
                        {/* Image container */}
                        <div className="relative h-48 sm:h-56 overflow-hidden">
                          <Image
                            src={category.imageUrl}
                            alt={category.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80" />
                          
                          {/* Icon badge */}
                          <motion.div
                            className={`
                              absolute top-4 left-4
                              w-12 h-12 rounded-2xl
                              bg-gradient-to-br ${gradient}
                              flex items-center justify-center
                              shadow-lg transition-transform duration-500
                              group-hover:scale-110 group-hover:rotate-6
                            `}
                            animate={isHovered ? { scale: 1.1, rotate: 6 } : { scale: 1, rotate: 0 }}
                            transition={{ type: "spring", damping: 15 }}
                          >
                            <Icon className="w-6 h-6 text-white" />
                          </motion.div>

                          {/* Item count badge */}
                          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10">
                            <span className="text-xs font-medium text-white/80">
                              {category.itemCount} items
                            </span>
                          </div>

                          {/* Hover arrow indicator */}
                          <motion.div
                            className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            animate={isHovered ? { x: 0, opacity: 1 } : { x: -10, opacity: 0 }}
                          >
                            <ArrowRight className="w-5 h-5 text-white" />
                          </motion.div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <h3 className="text-xl font-heading font-semibold text-white mb-2 group-hover:text-brand-500 transition-colors">
                            {category.name}
                          </h3>
                          
                          <p className="text-white/60 text-sm leading-relaxed mb-4">
                            {category.description}
                          </p>

                          {/* Action link */}
                          <div className="flex items-center gap-2 text-brand-500 text-sm font-medium group-hover:gap-3 transition-all">
                            <span>Explore</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>

                        {/* Bottom gradient line */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden">
                          <motion.div
                            className={`h-full w-full bg-gradient-to-r ${gradient}`}
                            initial={{ x: "-100%" }}
                            animate={isHovered ? { x: "0%" } : { x: "-100%" }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                          />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* View More Button */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mt-12 md:mt-16"
        >
          <Link href="/categories">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-8 py-4 bg-gradient-to-r from-brand-500 via-brand-400 to-brand-700 text-slate-950 rounded-xl text-lg font-semibold overflow-hidden shadow-lg shadow-brand-500/20"
            >
              {/* Shimmer effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center gap-2 font-heading font-semibold tracking-tight">
                View All Categories
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
