"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, type Variants } from "framer-motion";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  ArrowRight,
  Send,
  MapPin,
  Phone,
  Clock,
} from "lucide-react";

// Animation variants with proper typing
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 100,
    },
  },
};

const linkVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 100,
    },
  },
};

// Footer links data
const footerLinks = {
  platform: [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Browse Items", href: "/products" },
    { label: "Categories", href: "/categories" },
    { label: "My Trades", href: "/my-products" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
];

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, margin: "-100px" });
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <footer
      ref={footerRef}
      className="relative bg-surface overflow-hidden"
    >
      {/* Background gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-20 -left-20 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl"
          animate={
            prefersReducedMotion
              ? {}
              : {
                  y: [0, -15, 0],
                  scale: [1, 1.05, 1],
                }
          }
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-80 h-80 bg-brand-700/10 rounded-full blur-3xl"
          animate={
            prefersReducedMotion
              ? {}
              : {
                  y: [0, 15, 0],
                  scale: [1, 1.08, 1],
                }
          }
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-8"
        >
          {/* Brand Column */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            {/* Logo */}
            <Link href="/" className="inline-block mb-6">
              <div className="flex items-center gap-3">
                <Image
                  src="/assets/logo.png"
                  width={50}
                  height={50}
                  alt="yalla nbadel logo"
                  className="object-contain"
                  style={{ width: "auto", height: "auto" }}
                />
                <div className="flex flex-col">
                  <span className="text-xl font-heading font-bold bg-gradient-to-r from-white via-brand-200 to-white bg-clip-text text-transparent">
                    yalla_nbadel
                  </span>
                  <span className="text-xs font-light tracking-[0.2em] text-white/50 uppercase">
                    Trade it, Don't waste it
                  </span>
                </div>
              </div>
            </Link>

            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-sm">
              The premier destination for seamless and rewarding bartering. Trade
              smarter, live sustainably, and make purposeful exchanges.
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <h4 className="text-white font-heading font-semibold mb-3">
                Stay Updated
              </h4>
              <form onSubmit={handleSubscribe} className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-500/50 transition-colors"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-3 bg-gradient-to-r from-brand-500 to-brand-700 rounded-xl text-white font-semibold flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
                {isSubscribed && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-400 text-sm mt-2"
                  >
                    Thanks for subscribing!
                  </motion.p>
                )}
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-500" />
                <span>Tripoli, Lebanon</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-500" />
                <span>+961 81 132 746</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-500" />
                <span>24/7 Support</span>
              </div>
            </div>
          </motion.div>

          {/* Platform Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-white font-heading font-semibold mb-4">Platform</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <motion.li
                  key={link.label}
                  variants={linkVariants}
                >
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1 text-white/60 hover:text-white transition-colors text-sm"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    <span>{link.label}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="my-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />

        {/* Bottom Bar */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* Copyright */}
          <div className="text-white/40 text-sm text-center md:text-left">
            © {new Date().getFullYear()}{" "}
            <span className="text-brand-500 font-semibold">yalla nbadel</span>. All
            Rights Reserved.
          </div>

          {/* Legal Links */}
          <div className="flex items-center gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-white/40 hover:text-white/70 text-xs transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <motion.div
                key={social.label}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-brand-500/30 hover:bg-brand-500/10 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 text-white/60 group-hover:text-brand-500 transition-colors" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />
    </footer>
  );
};

export default Footer;
