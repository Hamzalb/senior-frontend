// app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await axios.post(`${API_BASE}/api/auth/forgot-password`, {
        email,
      });
      setMessage(res.data.message || "Check your email for a reset link.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error sending reset email.");
    }
  };

  return (
    <div className="relative min-h-screen bg-surface text-slate-50 overflow-hidden px-4">
      <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.22),transparent_30%),radial-gradient(circle_at_80%_0,rgba(124,58,237,0.2),transparent_28%),radial-gradient(circle_at_60%_80%,rgba(255,255,255,0.06),transparent_32%)]" />
      <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full bg-brand-500/15 blur-3xl" />
      <div className="absolute -top-20 -right-10 w-64 h-64 rounded-full bg-brand-700/20 blur-3xl" />

      <div className="relative z-10 max-w-lg mx-auto py-16">
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl shadow-[0_25px_70px_-35px_rgba(168,85,247,0.35)] p-8 sm:p-10 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm uppercase tracking-[0.35em] text-brand-200/80">
              Account help
            </p>
            <h1 className="text-3xl font-semibold">Forgot Password</h1>
            <p className="text-slate-200/80">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {error && (
            <p className="text-center text-sm text-brand-200 font-medium">
              {error}
            </p>
          )}
          {message && (
            <p className="text-center text-sm text-emerald-400 font-medium">
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Enter your email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-3 placeholder:text-slate-400/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all duration-300 ease-out"
                placeholder="you@example.com"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-brand-500 via-brand-400 to-brand-700 text-slate-950 shadow-lg shadow-brand-500/30 hover:translate-y-[-1px] hover:shadow-xl hover:shadow-brand-500/35 transition-all duration-300 ease-out"
            >
              Send reset link
            </button>
          </form>

          <p className="text-sm text-slate-300 text-center">
            Remembered it?{" "}
            <a
              href="/login"
              className="font-semibold text-brand-300 hover:text-brand-200 underline underline-offset-4"
            >
              Back to login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
