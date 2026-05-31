"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Cookies from "js-cookie";
import { Eye, EyeOff } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1) Register new user
      await axios.post(`${API_BASE}/api/auth/register`, formData);
      setEmailSent(true);
      setMessage("Registration successful!");

      // 2) Log them in right away
      const loginRes = await axios.post(`${API_BASE}/api/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      // 3) Store the JWT (so you stay "logged in")
      login(loginRes.data.token);

      // 4) Also write username & role cookies (exact same as your login page does)
      Cookies.set("username", loginRes.data.user.username, { expires: 7 });
      Cookies.set("role", loginRes.data.user.role, { expires: 7 });

      // 5) Redirect home
      router.push("/");
    } catch (error: any) {
      setMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Registration failed"
      );
      console.error(error);
    }
  };

  return (
    <div className="relative min-h-screen bg-surface text-slate-50 overflow-hidden">
      <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.22),transparent_30%),radial-gradient(circle_at_80%_0,rgba(124,58,237,0.2),transparent_28%),radial-gradient(circle_at_60%_80%,rgba(255,255,255,0.06),transparent_32%)]" />
      <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full bg-brand-500/15 blur-3xl" />
      <div className="absolute -top-20 -right-10 w-64 h-64 rounded-full bg-brand-700/20 blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 sm:py-16 md:py-24">
        <div className="flex items-center gap-3 mb-6 sm:mb-10">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-brand-500 via-brand-400 to-brand-700 shadow-lg shadow-brand-500/35 border border-white/10 flex items-center justify-center text-lg font-bold text-slate-950">
            Dk
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-brand-200/80">
              yalla nbadel Exchange
            </p>
            <p className="text-base text-slate-200">
              Trade smarter. Waste less. Join the community.
            </p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-[1.05fr,1fr] bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-[0_25px_70px_-35px_rgba(168,85,247,0.35)] backdrop-blur-xl">
          <div className="space-y-6 md:pr-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
                Register and start swapping in minutes
              </h1>
              <p className="mt-3 text-lg text-slate-200/90">
                Create your profile, list what you have, and discover what the
                community is offering. No clutter, no waste.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Verified community of swappers",
                "Track offers and responses easily",
                "Save wishlists for quick matches",
                "Mobile-friendly experience",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-500 shadow-[0_0_0_3px_rgba(168,85,247,0.2)]" />
                  <p className="text-sm sm:text-base text-slate-100">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 bg-slate-950/50 rounded-2xl border border-white/10 p-6 sm:p-8 shadow-inner shadow-brand-500/10"
          >
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-200">
                Name
              </label>
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nora Abdelrahman"
                required
                autoComplete="name"
                className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-3 placeholder:text-slate-400/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all duration-300 ease-out"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-200">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-3 placeholder:text-slate-400/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all duration-300 ease-out"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-200">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a secure password"
                  required
                  autoComplete="new-password"
                  className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-3 pr-11 placeholder:text-slate-400/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all duration-300 ease-out"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-brand-500 via-brand-400 to-brand-700 text-slate-950 shadow-lg shadow-brand-500/30 hover:translate-y-[-1px] hover:shadow-xl hover:shadow-brand-500/35 transition-all duration-300 ease-out"
            >
              Create account
            </button>

            {emailSent && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-center">
                <p className="text-emerald-400 text-sm font-medium">Account created!</p>
                <p className="text-slate-400 text-xs mt-1">
                  Check your email — we sent a verification link to <strong className="text-slate-200">{formData.email}</strong>.
                </p>
              </div>
            )}

            {message && !emailSent && (
              <p className="text-center text-sm text-brand-200 font-medium">{message}</p>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-slate-500 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Google OAuth */}
            <a
              href={`${API_BASE}/api/auth/google`}
              className="flex items-center justify-center gap-3 w-full py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-medium transition-all duration-200"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </a>

            <p className="text-sm text-slate-300 text-center">
              Already part of yalla nbadel?{" "}
              <a
                href="/login"
                className="text-brand-300 font-semibold hover:text-brand-200 underline underline-offset-4"
              >
                Log in instead
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
