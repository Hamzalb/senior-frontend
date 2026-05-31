"use client";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useState } from "react";
import Cookies from "js-cookie";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://dakesh-backend.onrender.com";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, {
        email,
        password,
      });

      login(res.data.token);

      if (res.data.user?.username) {
        Cookies.set("username", res.data.user.username, {
          expires: 1,
          path: "/",
        });
      } else if (res.data.user?.id) {
        Cookies.set("userId", res.data.user.id, {
          expires: 1,
          path: "/",
        });
      }

      if (res.data.user?.role) {
        Cookies.set("role", res.data.user.role, {
          expires: 1,
          path: "/",
        });
      }

      // Redirect to callback or home
      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get("callbackUrl") || "/";
      router.push(callbackUrl);
    } catch (error: any) {
      console.error("Login error full details:", {
        message: error.message,
        code: error.code,
        response: error.response,
        request: error.request,
      });
      
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        setError("Cannot connect to server. Please check if the backend is running.");
      } else if (error.response?.status === 401) {
        setError("Invalid email or password");
      } else if (error.response?.status === 400) {
        setError(error.response?.data?.message || "Invalid credentials");
      } else if (error.response?.status === 404) {
        setError("User not found");
      } else if (!error.response && error.request) {
        setError("Server is not responding. Please try again later.");
      } else {
        setError(error.response?.data?.message || "Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-surface text-slate-50 overflow-hidden">
      <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.22),transparent_30%),radial-gradient(circle_at_80%_0,rgba(124,58,237,0.2),transparent_28%),radial-gradient(circle_at_60%_80%,rgba(255,255,255,0.06),transparent_32%)]" />
      <div className="absolute -bottom-28 -left-24 w-64 h-64 rounded-full bg-brand-500/15 blur-3xl" />
      <div className="absolute -top-16 -right-8 w-64 h-64 rounded-full bg-brand-700/20 blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 sm:py-16 md:py-24">
        <div className="flex items-center gap-3 mb-6 sm:mb-10">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-brand-500 via-brand-400 to-brand-700 shadow-lg shadow-brand-500/35 border border-white/10 flex items-center justify-center text-lg font-bold text-slate-950">
            Dk
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-brand-200/80">
              Welcome back
            </p>
            <p className="text-base text-slate-200">
              Continue swapping and keep your matches moving.
            </p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-[1.05fr,1fr] bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-[0_25px_70px_-35px_rgba(168,85,247,0.35)] backdrop-blur-xl">
          <div className="space-y-6 md:pr-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
                Login to yalla nbadel
              </h1>
              <p className="mt-3 text-lg text-slate-200/90">
                Pick up where you left off. Chat with swappers, share photos,
                and close your next trade.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  title: "Secure by design",
                  desc: "Session tokens stored safely.",
                },
                {
                  title: "Smart notifications",
                  desc: "Stay on top of new offers.",
                },
                {
                  title: "Saved preferences",
                  desc: "We remember your filters.",
                },
                {
                  title: "Live support",
                  desc: "Reach out when you need help.",
                },
              ].map(({ title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-brand-200">
                    {title}
                  </p>
                  <p className="text-sm text-slate-200/90 mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5 bg-slate-950/50 rounded-2xl border border-white/10 p-6 sm:p-8 shadow-inner shadow-brand-500/10"
          >
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-200">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
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

            {error && (
              <p className="text-brand-200 text-sm text-center font-medium">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-brand-500 via-brand-400 to-brand-700 text-slate-950 shadow-lg shadow-brand-500/30 hover:translate-y-[-1px] hover:shadow-xl hover:shadow-brand-500/35 transition-all duration-300 ease-out"
            >
              Sign in
            </button>

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

            <div className="flex items-center justify-between text-sm text-slate-300">
              <Link
                href="/register"
                className="font-semibold text-brand-300 hover:text-brand-200 underline underline-offset-4"
              >
                Create an account
              </Link>
              <Link href="/forgot-password" className="hover:text-slate-100">
                Forgot password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
