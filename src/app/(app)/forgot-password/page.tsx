"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://senior-backend-e4gw.onrender.com";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      await axios.post(`${API_BASE}/api/auth/forgot-password`, { email }, { timeout: 60000 });
      setStatus("sent");
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.code === "ECONNABORTED") {
        setError("Server is taking too long to respond. Please try again in 30 seconds.");
      } else {
        setError(err.response?.data?.message || "Error sending reset email. Check the email address.");
      }
      setStatus("error");
    }
  };

  return (
    <div className="relative min-h-screen bg-surface text-slate-50 overflow-hidden px-4 flex items-center justify-center">
      <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.22),transparent_30%),radial-gradient(circle_at_80%_0,rgba(124,58,237,0.2),transparent_28%)]" />
      <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full bg-brand-500/15 blur-3xl" />
      <div className="absolute -top-20 -right-10 w-64 h-64 rounded-full bg-brand-700/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl shadow-[0_25px_70px_-35px_rgba(168,85,247,0.35)] p-8 sm:p-10 space-y-6">

          {status === "sent" ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-semibold">Check your inbox</h1>
              <p className="text-slate-400">
                We sent a reset link to <strong className="text-white">{email}</strong>.
                It expires in 15 minutes.
              </p>
              <p className="text-slate-500 text-sm">
                Don't see it? Check your spam folder.
              </p>
              <Link href="/login" className="inline-block mt-2 text-brand-300 hover:text-brand-200 text-sm underline underline-offset-4">
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-brand-400" />
                </div>
                <p className="text-sm uppercase tracking-[0.35em] text-brand-200/80">Account help</p>
                <h1 className="text-3xl font-semibold">Forgot Password</h1>
                <p className="text-slate-200/80">
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </div>

              {status === "error" && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-200">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-3 placeholder:text-slate-400/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-brand-500 via-brand-400 to-brand-700 text-slate-950 shadow-lg shadow-brand-500/30 hover:translate-y-[-1px] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "sending" ? "Sending… (may take 30s)" : "Send reset link"}
                </button>
              </form>

              <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
