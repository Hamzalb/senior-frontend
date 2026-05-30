// components/Dashboard.tsx
"use client";

import { Box, LogOut, Activity, Users, Tag, Home, Sparkles, TrendingUp, PieChart as PieIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import SectionBackground from "@/components/SectionBackground";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  CartesianGrid,
} from "recharts";

type Barter = {
  _id: string;
  offeredBy?: { username?: string };
  requestedFrom?: { username?: string };
  productOfferedId?: { title?: string };
  productRequestedId?: { title?: string };
  status: "pending" | "approved" | "declined" | string;
  createdAt: string;
};

type StatEntry = { status?: string; category?: string; count: number };

const CHART_COLORS = ["#a855f7", "#22d3ee", "#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#14b8a6"];
const BAR_COLORS  = ["#a855f7", "#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95", "#3b0764"];
const STATUS_COLORS: Record<string, string> = {
  Pending:  "#f59e0b",
  Approved: "#10b981",
  Declined: "#ef4444",
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";

export default function Dashboard() {
  const router = useRouter();
  const { logout } = useAuth();
  const [adminName, setAdminName] = useState("Admin");
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    barters: 0,
  });
  const [bartersByStatus, setBartersByStatus] = useState<StatEntry[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<StatEntry[]>([]);
  const [barters, setBarters] = useState<Barter[]>([]);
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

  useEffect(() => {
    const nameFromCookie = Cookies.get("username");
    if (nameFromCookie) setAdminName(nameFromCookie);

    async function fetchStats() {
      try {
        const token = Cookies.get("token");
        const res = await fetch(`${API_BASE}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setStats({
          users: data.users,
          products: data.products,
          barters: data.barters,
        });
        if (data.bartersByStatus) setBartersByStatus(data.bartersByStatus);
        if (data.productsByCategory) setProductsByCategory(data.productsByCategory);
      } catch (err) {
        console.error("Error fetching stats", err);
      }
    }

    async function fetchBarters() {
      try {
        const token = Cookies.get("token");
        const res = await fetch(`${API_BASE}/api/admin/barters`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setBarters(Array.isArray(data) ? data : (data.barters ?? []));
      } catch (err) {
        console.error("Error fetching barters", err);
      }
    }

    fetchStats();
    fetchBarters();
  }, []);

  const handleClearBarters = async () => {
    if (!confirm("Are you sure you want to delete ALL barters? This cannot be undone.")) return;
    try {
      const token = Cookies.get("token");
      const res = await fetch(`${API_BASE}/api/admin/barters`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setBarters([]);
        setStats((prev) => ({ ...prev, barters: 0 }));
      }
    } catch (err) {
      console.error("Error clearing barters", err);
    }
  };

  const handleLogout = () => {
    logout();
    Cookies.remove("username");
    Cookies.remove("role");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row relative overflow-hidden">
      {/* Unified background style with particles */}
      <SectionBackground prefersReducedMotion={prefersReducedMotion} />
      
      {/** Mobile Header (visible on < md) **/}
      <header className="relative z-20 w-full md:hidden flex items-center justify-between px-4 py-3 bg-surface-elevated/80 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold shadow-lg shadow-brand-500/30">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-white/60">Welcome,</span>
            <span className="text-brand-400 font-semibold">{adminName}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-1 text-brand-400 hover:text-brand-300 transition-colors duration-200">
            <Home className="w-5 h-5" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/** Sidebar (hidden on mobile) **/}
      <aside className="relative z-20 hidden md:flex flex-col w-60 bg-surface-elevated/80 border-r border-white/[0.08] p-6 gap-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-lg shadow-brand-500/30">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-semibold text-white/60">Welcome,</div>
            <div className="text-brand-400 font-bold">{adminName}</div>
          </div>
        </div>
        <nav className="flex flex-col gap-3">
          <Link href="/" className="group block">
            <div className="relative overflow-hidden flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-brand-500/10 hover:border-brand-500/30 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-brand-500/10 to-transparent pointer-events-none" />
              <div className="relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-brand-500/10 border border-brand-500/20 group-hover:scale-110 transition-all duration-300">
                <Home className="w-4 h-4 text-brand-400" />
              </div>
              <div className="relative flex-1">
                <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">Go to Home</p>
                <p className="text-xs text-white/40">Back to the app</p>
              </div>
              <span className="relative text-brand-400 opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm">→</span>
            </div>
          </Link>

          <Link href="/admin/users" className="group block">
            <div className="relative overflow-hidden flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-brand-500/10 hover:border-brand-500/30 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-brand-500/10 to-transparent pointer-events-none" />
              <div className="relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-brand-500/10 border border-brand-500/20 group-hover:scale-110 transition-all duration-300">
                <Users className="w-4 h-4 text-brand-400" />
              </div>
              <div className="relative flex-1">
                <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">Users</p>
                <p className="text-xs text-white/40">Manage all users</p>
              </div>
              <span className="relative text-brand-400 opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm">→</span>
            </div>
          </Link>

          <Link href="/admin/products" className="group block">
            <div className="relative overflow-hidden flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-brand-500/10 hover:border-brand-500/30 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-brand-500/10 to-transparent pointer-events-none" />
              <div className="relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-brand-500/10 border border-brand-500/20 group-hover:scale-110 transition-all duration-300">
                <Box className="w-4 h-4 text-brand-400" />
              </div>
              <div className="relative flex-1">
                <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">Products</p>
                <p className="text-xs text-white/40">Manage listings</p>
              </div>
              <span className="relative text-brand-400 opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm">→</span>
            </div>
          </Link>

          <Link href="/admin/categories" className="group block">
            <div className="relative overflow-hidden flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-brand-500/10 hover:border-brand-500/30 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-brand-500/10 to-transparent pointer-events-none" />
              <div className="relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-brand-500/10 border border-brand-500/20 group-hover:scale-110 transition-all duration-300">
                <Tag className="w-4 h-4 text-brand-400" />
              </div>
              <div className="relative flex-1">
                <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">Categories</p>
                <p className="text-xs text-white/40">Manage categories</p>
              </div>
              <span className="relative text-brand-400 opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm">→</span>
            </div>
          </Link>
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 bg-red-500/80 hover:bg-red-500 transition-colors duration-200 rounded-xl px-4 py-2.5 text-white font-semibold text-sm shadow-lg shadow-red-500/20 mt-auto"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </aside>

      {/** Main Content **/}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-start px-4 py-6 md:px-8 md:py-8">
        <div className="w-full max-w-4xl">
          {/** Mobile-only Action Buttons (hidden >= md) **/}
          <div className="md:hidden flex flex-col gap-4 mb-8">
            <Link href="/admin/users" className="w-full">
              <button className="w-full rounded-xl bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600 px-6 py-3 flex items-center justify-center gap-2 text-white font-semibold shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 transition-all duration-200 text-sm">
                <Users className="w-5 h-5" /> Manage Users
              </button>
            </Link>
            <Link href="/admin/products" className="w-full">
              <button className="w-full rounded-xl bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600 px-6 py-3 flex items-center justify-center gap-2 text-white font-semibold shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 transition-all duration-200 text-sm">
                <Box className="w-5 h-5" /> Manage Products
              </button>
            </Link>

            <Link href="/admin/categories" className="w-full">
              <button className="w-full rounded-xl bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600 px-6 py-3 flex items-center justify-center gap-2 text-white font-semibold shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 transition-all duration-200 text-sm">
                <Tag className="w-5 h-5" /> Manage Categories
              </button>
            </Link>
          </div>

          {/** Stats Row **/}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-surface-elevated/60 backdrop-blur-xl rounded-2xl p-4 sm:p-6 flex flex-col items-center shadow-xl border border-white/[0.08] hover:border-brand-500/30 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-brand-400" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {stats.users}
              </span>
              <span className="text-white/50 text-xs sm:text-sm text-center mt-1">
                Total Users
              </span>
            </div>
            <div className="bg-surface-elevated/60 backdrop-blur-xl rounded-2xl p-4 sm:p-6 flex flex-col items-center shadow-xl border border-white/[0.08] hover:border-brand-500/30 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-3">
                <Box className="w-6 h-6 text-brand-400" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {stats.products}
              </span>
              <span className="text-white/50 text-xs sm:text-sm text-center mt-1">
                Products
              </span>
            </div>
            <div className="bg-surface-elevated/60 backdrop-blur-xl rounded-2xl p-4 sm:p-6 flex flex-col items-center shadow-xl border border-white/[0.08] hover:border-brand-500/30 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-3">
                <Activity className="w-6 h-6 text-brand-400" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {stats.barters}
              </span>
              <span className="text-white/50 text-xs sm:text-sm text-center mt-1">
                Active Barters
              </span>
            </div>
          </div>

          {/** Charts Section **/}
          <section className="mb-12">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500/30 to-purple-500/20 border border-brand-500/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-brand-400" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-brand-500 border-2 border-surface animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-brand-400/70 font-semibold mb-0.5">Real-time</p>
                <h2 className="text-2xl font-black text-white leading-none">
                  Analytics{" "}
                  <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Overview
                  </span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* ── Bar chart: Products by Category ── */}
              <div className="relative group overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-2xl">
                {/* Top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-500 via-purple-500 to-cyan-500 rounded-t-3xl" />
                {/* Subtle glow */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-24 bg-brand-500/10 blur-3xl rounded-full pointer-events-none" />

                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-brand-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Products by Category</p>
                        <p className="text-[10px] text-white/40">{stats.products} total listings</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-semibold">
                      {productsByCategory.length} categories
                    </span>
                  </div>

                  {productsByCategory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white/20" />
                      </div>
                      <p className="text-white/30 text-sm">No data yet</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={210}>
                      <BarChart data={productsByCategory} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barCategoryGap="30%">
                        <defs>
                          {productsByCategory.map((_, i) => (
                            <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={BAR_COLORS[i % BAR_COLORS.length]} stopOpacity={1} />
                              <stop offset="100%" stopColor={BAR_COLORS[i % BAR_COLORS.length]} stopOpacity={0.4} />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="category" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip
                          cursor={{ fill: "rgba(168,85,247,0.06)", radius: 8 }}
                          contentStyle={{
                            background: "rgba(15,10,40,0.95)",
                            border: "1px solid rgba(168,85,247,0.25)",
                            borderRadius: 12,
                            color: "#fff",
                            fontSize: 12,
                            boxShadow: "0 8px 32px rgba(168,85,247,0.2)",
                          }}
                          labelStyle={{ color: "#a855f7", fontWeight: 700, marginBottom: 2 }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                          {productsByCategory.map((_, i) => (
                            <Cell key={i} fill={`url(#barGrad${i})`} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* ── Donut chart: Barter Status ── */}
              <div className="relative group overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-2xl">
                {/* Top accent bar — amber/green/red gradient */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-emerald-500 to-red-500 rounded-t-3xl" />
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-24 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />

                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
                        <PieIcon className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Barter Status</p>
                        <p className="text-[10px] text-white/40">Trade request breakdown</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">
                      {(bartersByStatus.reduce((s, b) => s + b.count, 0) || stats.barters)} total
                    </span>
                  </div>

                  {(() => {
                    const chartData = bartersByStatus.length > 0
                      ? bartersByStatus
                      : stats.barters > 0
                        ? [{ status: "Pending", count: stats.barters }]
                        : [];
                    const total = chartData.reduce((s, b) => s + b.count, 0);

                    return chartData.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <PieIcon className="w-6 h-6 text-white/20" />
                        </div>
                        <p className="text-white/30 text-sm">No barters yet</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        {/* Donut */}
                        <div className="relative flex-shrink-0">
                          <ResponsiveContainer width={180} height={180}>
                            <PieChart>
                              <Pie
                                data={chartData}
                                dataKey="count"
                                nameKey="status"
                                cx="50%" cy="50%"
                                innerRadius={58}
                                outerRadius={82}
                                paddingAngle={3}
                                strokeWidth={0}
                              >
                                {chartData.map((entry, i) => (
                                  <Cell
                                    key={i}
                                    fill={STATUS_COLORS[entry.status ?? ""] ?? CHART_COLORS[i % CHART_COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  background: "rgba(15,10,40,0.95)",
                                  border: "1px solid rgba(168,85,247,0.25)",
                                  borderRadius: 12,
                                  color: "#fff",
                                  fontSize: 12,
                                  boxShadow: "0 8px 32px rgba(168,85,247,0.2)",
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          {/* Center label */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-black text-white">{total}</span>
                            <span className="text-[10px] text-white/40 uppercase tracking-wider">trades</span>
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="flex-1 space-y-3">
                          {chartData.map((entry, i) => {
                            const color = STATUS_COLORS[entry.status ?? ""] ?? CHART_COLORS[i % CHART_COLORS.length];
                            const pct = total > 0 ? ((entry.count / total) * 100).toFixed(0) : "0";
                            return (
                              <div key={i} className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold text-white/80 capitalize">{entry.status}</span>
                                    <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
                                  </div>
                                  {/* Mini progress bar */}
                                  <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all duration-700"
                                      style={{ width: `${pct}%`, backgroundColor: color }}
                                    />
                                  </div>
                                </div>
                                <span className="text-xs text-white/40 flex-shrink-0 w-5 text-right">{entry.count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

            </div>
          </section>

          {/** Barters Section **/}
          <section className="mb-12">
            <div className="hidden md:flex items-center justify-between mb-4">
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white">
                Recent <span className="text-brand-400">Barters</span>
              </h2>
              {barters.length > 0 && (
                <button
                  onClick={handleClearBarters}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg text-sm font-semibold transition-all duration-200"
                >
                  Clear All Barters
                </button>
              )}
            </div>

            {/** On mobile (<md): show a message **/}
            <div className="md:hidden text-center text-white/60 py-8">
              For more admin features use your laptop
            </div>

            {/** On md+: show the full table **/}
            <div className="hidden md:block overflow-x-auto rounded-2xl shadow-xl">
              <table className="min-w-full bg-surface-elevated/60 backdrop-blur-xl text-white/90 rounded-2xl">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="px-3 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm text-brand-300">
                      ID
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm text-brand-300">
                      Offered By
                    </th>
                    <th className="hidden sm:table-cell px-3 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm text-brand-300">
                      Offered Product
                    </th>
                    <th className="hidden md:table-cell px-3 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm text-brand-300">
                      Requested From
                    </th>
                    <th className="hidden lg:table-cell px-3 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm text-brand-300">
                      Requested Product
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm text-brand-300">
                      Status
                    </th>
                    <th className="hidden sm:table-cell px-3 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm text-brand-300">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {barters.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 sm:px-4 py-6 text-center text-white/50 text-sm"
                      >
                        No barters found.
                      </td>
                    </tr>
                  ) : (
                    barters.map((barter) => (
                      <tr
                        key={barter._id}
                        className="border-t border-white/[0.06] hover:bg-white/[0.02] transition-colors duration-200"
                      >
                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-white/60 truncate max-w-[80px]">
                          {barter._id}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm">
                          {barter.offeredBy?.username || "-"}
                        </td>
                        <td className="hidden sm:table-cell px-3 sm:px-4 py-3 text-xs sm:text-sm truncate max-w-[100px] text-white/70">
                          {barter.productOfferedId?.title || "-"}
                        </td>
                        <td className="hidden md:table-cell px-3 sm:px-4 py-3 text-xs sm:text-sm truncate max-w-[100px]">
                          {barter.requestedFrom?.username || "-"}
                        </td>
                        <td className="hidden lg:table-cell px-3 sm:px-4 py-3 text-xs sm:text-sm truncate max-w-[100px] text-white/70">
                          {barter.productRequestedId?.title || "-"}
                        </td>
                        <td className="px-3 sm:px-4 py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                              barter.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : barter.status === "approved"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {barter.status}
                          </span>
                        </td>
                        <td className="hidden sm:table-cell px-3 sm:px-4 py-3 text-xs sm:text-sm text-white/60">
                          {new Date(barter.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
