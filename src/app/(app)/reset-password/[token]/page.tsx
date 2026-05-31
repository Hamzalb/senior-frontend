"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://senior-backend-e4gw.onrender.com";

export default function ResetPasswordPage() {
  const params = useParams() as { token?: string };
  const token  = params.token;
  const router = useRouter();

  const [password,  setPassword]  = useState("");
  const [password2, setPassword2] = useState("");
  const [showPw1,   setShowPw1]   = useState(false);
  const [showPw2,   setShowPw2]   = useState(false);
  const [status,    setStatus]    = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error,     setError]     = useState("");
  const [ready,     setReady]     = useState(false);

  useEffect(() => { setReady(true); }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== password2) { setError("Passwords do not match"); return; }
    if (password.length < 6)    { setError("Password must be at least 6 characters"); return; }
    setStatus("submitting");
    try {
      await axios.put(`${API_BASE}/api/auth/reset-password/${token}`, { password });
      setStatus("success");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Reset link is invalid or expired.");
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

          {status === "success" ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-semibold">Password updated!</h1>
              <p className="text-slate-400">Redirecting you to login in 3 seconds…</p>
              <Link href="/login" className="inline-block text-brand-300 hover:text-brand-200 text-sm underline underline-offset-4">
                Go to login now
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <p className="text-sm uppercase tracking-[0.35em] text-brand-200/80">Account help</p>
                <h1 className="text-3xl font-semibold">Reset Password</h1>
                <p className="text-slate-200/80">Choose a new password to secure your account.</p>
              </div>

              {!ready && <p className="text-center text-slate-400">Loading…</p>}

              {(error || status === "error") && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {ready && (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">New Password</label>
                    <div className="relative">
                      <input
                        type={showPw1 ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        required
                        className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-3 pr-11 placeholder:text-slate-400/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all"
                      />
                      <button type="button" onClick={() => setShowPw1(!showPw1)} tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                        {showPw1 ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showPw2 ? "text" : "password"}
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        placeholder="Re-enter new password"
                        required
                        className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-3 pr-11 placeholder:text-slate-400/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all"
                      />
                      <button type="button" onClick={() => setShowPw2(!showPw2)} tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                        {showPw2 ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-brand-500 via-brand-400 to-brand-700 text-slate-950 shadow-lg shadow-brand-500/30 hover:translate-y-[-1px] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === "submitting" ? "Updating…" : "Reset Password"}
                  </button>
                </form>
              )}

              <Link href="/login" className="block text-sm text-slate-400 hover:text-white text-center transition-colors">
                Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
