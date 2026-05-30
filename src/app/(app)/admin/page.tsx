// components/Dashboard.tsx
"use client";

import { Box, LogOut, Activity, Users, Tag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import SectionBackground from "@/components/SectionBackground";

type Barter = {
  _id: string;
  offeredBy?: { username?: string };
  requestedFrom?: { username?: string };
  productOfferedId?: { title?: string };
  productRequestedId?: { title?: string };
  status: "pending" | "approved" | "declined" | string;
  createdAt: string;
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
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
        </button>
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
