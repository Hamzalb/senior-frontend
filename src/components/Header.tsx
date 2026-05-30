"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { ChevronDown, Sparkles, ArrowRight, Package, Grid3X3, User, LogIn, UserPlus, MessageCircle } from "lucide-react";
import NotificationBell from "./NotificationBell";

// Navigation data with mega menu support
const navItems: Array<{
  label: string;
  href: string;
  megaMenu: boolean;
  icon?: React.ElementType;
  requiresAuth?: boolean;
  sections?: Array<{
    title: string;
    links: Array<{ label: string; href: string; icon: React.ElementType; description: string }>;
  }>;
}> = [
  {
    label: "Products",
    href: "/products",
    megaMenu: true,
    sections: [
      {
        title: "Browse",
        links: [
          { label: "All Products", href: "/products", icon: Package, description: "Explore our marketplace" },
          { label: "Categories", href: "/categories", icon: Grid3X3, description: "Browse by category" },
        ]
      },
      {
        title: "Featured",
        links: [
          { label: "Latest Items", href: "/products?sort=newest", icon: Sparkles, description: "Fresh additions" },
          { label: "Popular Trades", href: "/products?sort=popular", icon: ArrowRight, description: "Trending now" },
        ]
      }
    ]
  },
  { label: "Categories", href: "/categories", megaMenu: false },
  { label: "Messages", href: "/messages", megaMenu: false, icon: MessageCircle, requiresAuth: true },
  { label: "Contact", href: "/contact", megaMenu: false },
];

const Header = () => {
  const { isLoggedIn } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const megaMenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(false);

  // Hide header on admin pages
  const isAdminPage = pathname?.startsWith("/admin");

  // Scroll tracking for animations
  const { scrollY } = useScroll();
  
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (!isMountedRef.current) return;
    const progress = Math.min(latest / 100, 1);
    setScrollProgress(progress);
    setIsScrolled(latest > 20);
  });

  // Mark as mounted on client side
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setActiveMegaMenu(null);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveMegaMenu(null);
  }, [pathname]);

  // Mega menu hover handlers with delay
  const handleMegaMenuEnter = (label: string) => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }
    setActiveMegaMenu(label);
  };

  const handleMegaMenuLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 150);
  };

  const authLinks = isLoggedIn
    ? [{ href: "/profile", label: "Profile", icon: User }]
    : [
        { href: "/login", label: "Login", icon: LogIn },
        { href: "/register", label: "Register", icon: UserPlus },
      ];

  // Animation variants with smooth easing
  const menuVariants = {
    closed: {
      x: "100%",
      transition: {
        duration: 0.3,
      },
    },
    open: {
      x: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const overlayVariants = {
    closed: { opacity: 0, transition: { duration: 0.2 } },
    open: { opacity: 1, transition: { duration: 0.2 } },
  };

  const linkVariants = {
    closed: { opacity: 0, x: 20 },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.06,
        duration: 0.4,
      },
    }),
  };

  const megaMenuVariants = {
    hidden: {
      opacity: 0,
      y: -12,
      scale: 0.96,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05,
        delayChildren: 0.02,
      },
    },
    exit: {
      opacity: 0,
      y: -12,
      scale: 0.96,
      transition: {
        duration: 0.2,
      },
    },
  };

  const megaMenuItemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  // Don't render header on admin pages
  if (isAdminPage) {
    return null;
  }

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-surface/70 backdrop-blur-2xl border-b border-brand-500/20"
            : "bg-transparent border-b border-transparent"
        }`}
        style={{
          boxShadow: isScrolled
            ? `0 1px 0 rgba(168,85,247,0.1), 0 8px 32px rgba(168,85,247,0.08)`
            : "none",
        }}
      >
        {/* Progress indicator line with glow */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600 shadow-lg shadow-brand-500/60"
          style={{ width: `${scrollProgress * 100}%` }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-3 flex-shrink-0 relative z-10">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                {/* Glow effect with smooth animation */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-300\"
                />
                <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden bg-gradient-to-br from-brand-500/20 to-brand-600/10 border border-brand-500/30 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:border-brand-400/50 group-hover:shadow-brand-500/40 transition-all duration-300">
                  <Image
                    src="/assets/logo.png"
                    alt="yalla nbadel logo"
                    width={48}
                    height={48}
                    className="object-contain"
                    style={{ width: "auto", height: "auto", maxWidth: "100%", maxHeight: "100%" }}
                  />
                </div>
              </motion.div>
              <div className="flex flex-col">
                <motion.span
                  className="text-lg md:text-xl font-heading font-bold bg-gradient-to-r from-white via-brand-200 to-white bg-clip-text text-transparent group-hover:from-brand-400 group-hover:via-brand-300 group-hover:to-brand-400 transition-all duration-300"
                >
                  yalla_nbadel
                </motion.span>
                <span className="hidden sm:block text-[9px] md:text-[10px] font-light tracking-[0.2em] text-white/40 uppercase group-hover:text-white/50 transition-colors duration-300">
                  Trade it, Don't waste it
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 relative">
              {navItems.filter((item) => !item.requiresAuth || isLoggedIn).map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const hasMegaMenu = item.megaMenu && item.sections;

                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => hasMegaMenu && handleMegaMenuEnter(item.label)}
                    onMouseLeave={hasMegaMenu ? handleMegaMenuLeave : undefined}
                  >
                    <Link
                      href={item.href}
                      className={`relative flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        isActive 
                          ? "text-white bg-gradient-to-r from-brand-500/30 to-brand-600/20 border-b-2 border-brand-400" 
                          : "text-white/70 hover:text-white hover:bg-white/[0.08] border-b-2 border-transparent"
                      }`}
                    >
                      <span>{item.label}</span>
                      {hasMegaMenu && (
                        <motion.span
                          animate={{ rotate: activeMegaMenu === item.label ? 180 : 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </motion.span>
                      )}
                      {/* Active indicator */}
                      {isActive && (
                        <motion.span
                          layoutId="activeNavItem"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600 rounded-full"
                          transition={{ duration: 0.25 }}
                        />
                      )}
                    </Link>

                    {/* Mega Menu Dropdown */}
                    <AnimatePresence>
                      {hasMegaMenu && activeMegaMenu === item.label && (
                        <motion.div
                          variants={megaMenuVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[500px] z-[100]"
                          onMouseEnter={() => handleMegaMenuEnter(item.label)}
                          onMouseLeave={handleMegaMenuLeave}
                        >
                          <div className="bg-surface/99 backdrop-blur-3xl rounded-2xl border border-brand-500/20 shadow-2xl shadow-brand-500/20 overflow-hidden">
                            {/* Header with gradient */}
                            <div className="px-6 py-4 border-b border-white/5 bg-gradient-to-r from-brand-500/15 via-brand-400/10 to-transparent">
                              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                >
                                  <Sparkles className="w-4 h-4 text-brand-400" />
                                </motion.div>
                                Explore {item.label}
                              </h3>
                            </div>

                            {/* Content Grid */}
                            <div className="p-5 grid grid-cols-2 gap-5">
                              {item.sections?.map((section) => (
                                <motion.div
                                  key={section.title}
                                  variants={megaMenuItemVariants}
                                  className="space-y-3"
                                >
                                  <h4 className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                                    {section.title}
                                  </h4>
                                  {section.links.map((link) => (
                                    <motion.div
                                      key={link.href}
                                      whileHover={{ x: 4 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <Link
                                        href={link.href}
                                        className="group/item flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.08] transition-all duration-200"
                                      >
                                        <motion.div 
                                          className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500/20 to-brand-600/10 flex items-center justify-center flex-shrink-0 group-hover/item:from-brand-500/30 group-hover/item:to-brand-600/20 transition-all duration-200"
                                          whileHover={{ scale: 1.1 }}
                                          transition={{ duration: 0.2 }}
                                        >
                                          <link.icon className="w-4.5 h-4.5 text-brand-400" />
                                        </motion.div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-semibold text-white group-hover/item:text-brand-200 transition-colors duration-200">
                                            {link.label}
                                          </p>
                                          <p className="text-xs text-white/50 group-hover/item:text-white/70 transition-colors duration-200">
                                            {link.description}
                                          </p>
                                        </div>
                                      </Link>
                                    </motion.div>
                                  ))}
                                </motion.div>
                              ))}
                            </div>

                            {/* Footer CTA */}
                            <div className="px-5 pb-4">
                              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                                <Link
                                  href={item.href}
                                  className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-brand-500/25 to-brand-600/25 hover:from-brand-500/35 hover:to-brand-600/35 rounded-xl text-sm font-semibold text-white transition-all duration-200 group"
                                >
                                  Explore All
                                  <motion.span
                                    className="inline-block"
                                    whileHover={{ x: 2 }}
                                      transition={{ duration: 0.2 }}
                                  >
                                    <ArrowRight className="w-4 h-4" />
                                  </motion.span>
                                </Link>
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Divider */}
              <div className="w-px h-4 bg-white/10 mx-2" />

              {/* Auth Links */}
              {authLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                      isActive 
                        ? "text-white" 
                        : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="activeAuthItem"
                        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-gradient-to-r from-brand-500 to-brand-400 rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}

              {/* Notification Bell - Only show when logged in */}
              {isLoggedIn && <NotificationBell />}

              {/* CTA Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/products"
                  className="relative ml-3 px-5 py-2.5 bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600 text-white text-sm font-semibold rounded-xl overflow-hidden group shadow-lg shadow-brand-500/20 flex items-center justify-center"
                >
                  {/* Shimmer effect */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                  <span className="relative flex items-center justify-center gap-2">
                    Start Trading
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </span>
                </Link>
              </motion.div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] transition-all duration-200 z-[60]"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              <div className="relative w-5 h-4">
                <motion.span
                  className="absolute left-0 w-5 h-0.5 bg-white rounded-full"
                  animate={{
                    top: isMenuOpen ? "50%" : "0%",
                    y: isMenuOpen ? "-50%" : "0%",
                    rotate: isMenuOpen ? 45 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-0.5 bg-white rounded-full"
                  animate={{
                    opacity: isMenuOpen ? 0 : 1,
                    scaleX: isMenuOpen ? 0 : 1,
                  }}
                  transition={{ duration: 0.15 }}
                />
                <motion.span
                  className="absolute left-0 w-5 h-0.5 bg-white rounded-full"
                  animate={{
                    top: isMenuOpen ? "50%" : "100%",
                    y: isMenuOpen ? "-50%" : "0%",
                    rotate: isMenuOpen ? -45 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={overlayVariants}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-md z-[55]"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              ref={menuRef}
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="lg:hidden fixed top-0 right-0 h-full w-[300px] sm:w-[320px] bg-surface/98 backdrop-blur-xl border-l border-white/[0.06] z-[60] shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                  <Link href="/" className="flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                      <Image
                        src="/assets/logo.png"
                        alt="yalla nbadel logo"
                        width={40}
                        height={40}
                        className="object-contain"
                        style={{ width: "auto", height: "auto", maxWidth: "100%", maxHeight: "100%" }}
                      />
                    </div>
                    <span className="text-lg font-heading font-bold bg-gradient-to-r from-white via-brand-200 to-white bg-clip-text text-transparent">
                      yalla_nbadel
                    </span>
                  </Link>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/[0.05] transition-colors duration-200"
                    aria-label="Close menu"
                  >
                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-4 px-3">
                  <div className="space-y-1">
                    {navItems.map((item, index) => {
                      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                      return (
                        <motion.div
                          key={item.label}
                          custom={index}
                          variants={linkVariants}
                          initial="closed"
                          animate="open"
                        >
                          <Link
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                              isActive
                                ? "bg-gradient-to-r from-brand-500/15 to-transparent text-white border-l-2 border-brand-500"
                                : "text-white/70 hover:bg-white/[0.05] hover:text-white"
                            }`}
                          >
                            <span className="font-medium">{item.label}</span>
                            {item.megaMenu && (
                              <ChevronDown className="w-4 h-4 text-white/40" />
                            )}
                          </Link>
                          
                          {/* Mobile sub-links for mega menu items */}
                          {item.megaMenu && item.sections && (
                            <div className="ml-4 mt-1 space-y-0.5">
                              {item.sections.flatMap(section => section.links).map((link) => (
                                <Link
                                  key={link.href}
                                  href={link.href}
                                  onClick={() => setIsMenuOpen(false)}
                                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/[0.03] rounded-lg transition-colors duration-200"
                                >
                                  <link.icon className="w-4 h-4 text-brand-400/60" />
                                  {link.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Divider */}
                  <div className="my-4 mx-4 h-px bg-white/[0.06]" />

                  {/* Auth Links */}
                  <div className="space-y-1">
                    {authLinks.map((link, index) => {
                      const isActive = pathname === link.href;
                      return (
                        <motion.div
                          key={link.href}
                          custom={navItems.length + index}
                          variants={linkVariants}
                          initial="closed"
                          animate="open"
                        >
                          <Link
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                              isActive
                                ? "bg-gradient-to-r from-brand-500/15 to-transparent text-white border-l-2 border-brand-500"
                                : "text-white/70 hover:bg-white/[0.05] hover:text-white"
                            }`}
                          >
                            <link.icon className="w-4 h-4 text-brand-400/60" />
                            <span className="font-medium">{link.label}</span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </nav>

                {/* CTA Button */}
                <div className="p-4 border-t border-white/[0.06]">
                  <motion.div
                    custom={navItems.length + authLinks.length}
                    variants={linkVariants}
                    initial="closed"
                    animate="open"
                  >
                    <Link href="/products" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full py-3.5 bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 transition-shadow duration-200">
                        <span className="flex items-center justify-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Start Trading
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </button>
                    </Link>
                  </motion.div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/[0.06] bg-white/[0.01]">
                  <p className="text-xs text-white/30 text-center">
                    © {new Date().getFullYear()} yalla nbadel
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
