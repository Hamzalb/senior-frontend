"use client";
import React, { useState, useEffect } from "react";
import emailjs from "emailjs-com";
import SectionBackground from "@/components/SectionBackground";

const ContactForm = () => {
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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    emailjs
      .send(
        "service_p5vr1dt",
        "template_dmb73fs",
        formData,
        "VNUKt7eT6-4RfIXAu"
      )
      .then(
        () => {
          alert("Your message has been sent!");
          setFormData({ name: "", email: "", phone: "", message: "" });
        },
        (error) => {
          console.error(error);
          alert("Failed to send message.");
        }
      );
  };

  return (
    <div className="relative min-h-screen bg-surface text-slate-50 flex items-center justify-center py-20 px-4 overflow-hidden">
      {/* Unified background style with particles */}
      <SectionBackground prefersReducedMotion={prefersReducedMotion} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_25px_70px_-35px_rgba(203,108,230,0.35)] px-5 sm:px-8 py-8 sm:py-10 space-y-4">
        <div className="text-center space-y-2">
          <p className="text-sm uppercase tracking-[0.35em] text-brand-200/80">
            Contact
          </p>
          <h2 className="text-3xl font-extrabold text-white drop-shadow-sm">
            Let's Connect
          </h2>
          <p className="text-slate-200/85">
            We'd love to hear from you. Send us a message and we'll reply as soon
            as possible.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-gray-200 text-sm font-semibold mb-2"
            >
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="
            w-full px-4 py-3 rounded-lg bg-white/10 text-white
            placeholder:text-slate-300/70
            border border-white/20
            focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40
            outline-none transition
          "
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-gray-200 text-sm font-semibold mb-2"
            >
              Your Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="
            w-full px-4 py-3 rounded-lg bg-white/10 text-white
            placeholder:text-slate-300/70
            border border-white/20
            focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40
            outline-none transition
          "
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block text-gray-200 text-sm font-semibold mb-2"
            >
              Your Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              className="
            w-full px-4 py-3 rounded-lg bg-white/10 text-white
            placeholder:text-slate-300/70
            border border-white/20
            focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40
            outline-none resize-none transition
          "
              placeholder="Write your message here..."
              required
            ></textarea>
          </div>

          {/* CTA */}
          <button
            type="submit"
            className="
          w-full py-3.5 rounded-lg font-semibold text-slate-950
          bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600
          hover:shadow-lg hover:shadow-brand-500/35
          transition-all duration-300 active:scale-[0.98]
        "
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
