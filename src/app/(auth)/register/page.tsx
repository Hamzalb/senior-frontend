"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Cookies from "js-cookie";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1) Register new user
      const res = await axios.post(`${API_BASE}/api/auth/register`, formData);
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
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a secure password"
                required
                autoComplete="new-password"
                className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-3 placeholder:text-slate-400/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all duration-300 ease-out"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-brand-500 via-brand-400 to-brand-700 text-slate-950 shadow-lg shadow-brand-500/30 hover:translate-y-[-1px] hover:shadow-xl hover:shadow-brand-500/35 transition-all duration-300 ease-out"
            >
              Create account
            </button>

            {message && (
              <p className="text-center text-sm text-brand-200 font-medium">
                {message}
              </p>
            )}

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
