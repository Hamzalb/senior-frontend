"use client";
import React, { useState, useEffect } from "react";
import SectionBackground from "@/components/SectionBackground";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://senior-backend-e4gw.onrender.com";

const ContactForm = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Server error");
      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="relative min-h-screen bg-surface text-slate-50 flex items-center justify-center py-20 px-4 overflow-hidden">
      <SectionBackground prefersReducedMotion={prefersReducedMotion} />

      <div className="relative z-10 w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_25px_70px_-35px_rgba(203,108,230,0.35)] px-5 sm:px-8 py-8 sm:py-10 space-y-4">
        <div className="text-center space-y-2">
          <p className="text-sm uppercase tracking-[0.35em] text-brand-200/80">Contact</p>
          <h2 className="text-3xl font-extrabold text-white drop-shadow-sm">Let's Connect</h2>
          <p className="text-slate-200/85">
            We'd love to hear from you. Send us a message and we'll reply as soon as possible.
          </p>
        </div>

        {status === "success" ? (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-6 py-8 text-center space-y-2">
            <p className="text-2xl">✓</p>
            <p className="text-emerald-400 font-semibold text-lg">Message sent!</p>
            <p className="text-slate-400 text-sm">We'll get back to you as soon as possible.</p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-4 text-brand-400 hover:text-brand-300 text-sm underline underline-offset-4"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-200 text-sm font-semibold mb-2">Your Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder:text-slate-300/70 border border-white/20 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-gray-200 text-sm font-semibold mb-2">Your Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder:text-slate-300/70 border border-white/20 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-gray-200 text-sm font-semibold mb-2">Your Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                placeholder="Write your message here..."
                required
                className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder:text-slate-300/70 border border-white/20 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 outline-none resize-none transition"
              />
            </div>

            {status === "error" && (
              <p className="text-red-400 text-sm text-center">
                Failed to send message. Please try again.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full py-3.5 rounded-lg font-semibold text-slate-950 bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600 hover:shadow-lg hover:shadow-brand-500/35 transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "sending" ? "Sending…" : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactForm;
