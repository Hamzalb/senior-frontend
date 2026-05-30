"use client";
import { User, Box, LogOut, Activity, Users, Tag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    const nameFromCookie = Cookies.get("username");
    if (nameFromCookie) setAdminName(nameFromCookie);

    // Fetch stats
    async function fetchStats() {
      try {
        const token = Cookies.get("token");
        const res = await fetch(`${API_BASE}/api/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          console.error("Failed to fetch stats:", res.status);
          return;
        }
        const data = await res.json();
        setStats({
          users: data.users ?? 0,
          products: data.products ?? 0,
          barters: data.barters ?? 0,
        });
      } catch (err) {
        console.error("Error fetching stats", err);
      }
    }

    // Fetch barters
    async function fetchBarters() {
      try {
        const token = Cookies.get("token");
        const res = await fetch(`${API_BASE}/api/admin/barters`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          console.error("Failed to fetch barters:", res.status);
          return;
        }
        const data = await res.json();
        setBarters(Array.isArray(data) ? data : (data.barters ?? []));
      } catch (err) {
        console.error("Error fetching barters", err);
      }
    }

    fetchStats();
    fetchBarters();
  }, []);

  const handleLogout = () => {
    logout();
    Cookies.remove("username");
    Cookies.remove("role");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header
        className="w-full flex md:hidden items-center justify-between px-4 py-4 
    bg-surface-elevated/70 backdrop-blur-xl border-b border-white/10 shadow-md sticky top-0 z-40"
      >
        <div className="flex items-center gap-3">
          <div className="bg-brand-600 text-white rounded-full w-11 h-11 flex items-center justify-center text-xl font-bold shadow-md">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs text-slate-300">Welcome back,</span>
            <span className="text-brand-300 font-semibold">{adminName}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-all duration-300 ease-out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Sidebar (Desktop Only) */}
      <aside
        className="hidden md:flex flex-col w-64 bg-surface-elevated/70 backdrop-blur-xl 
    border-r border-white/10 p-6 gap-10 shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="bg-brand-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-md">
            {adminName.charAt(0)}
          </div>
          <div>
            <p className="text-xs text-slate-300">Admin Panel</p>
            <p className="text-brand-300 font-semibold">{adminName}</p>
          </div>
        </div>

        {/* Add your sidebar nav items here */}
        <nav className="flex flex-col gap-4">
          <Link
            href="/admin/users"
            className="text-slate-300 hover:text-white transition-all duration-300 ease-out"
          >
            Manage Users
          </Link>
          <Link
            href="/admin/products"
            className="text-slate-300 hover:text-white transition-all duration-300 ease-out"
          >
            Manage Products
          </Link>
          <Link
            href="/admin/categories"
            className="text-slate-300 hover:text-white transition-all duration-300 ease-out"
          >
            Manage Categories
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="w-full flex-1 flex flex-col items-center p-6">
        <div className="w-full max-w-5xl">
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link href="/admin/users" className="w-full sm:w-auto">
              <button
                className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 
            px-6 py-3 text-white font-semibold shadow-xl hover:shadow-brand-900/40 
            hover:translate-y-[-2px] transition-all"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-6 h-6" /> Manage Users
                </div>
              </button>
            </Link>

            <Link href="/admin/products" className="w-full sm:w-auto">
              <button
                className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500
            px-6 py-3 text-white font-semibold shadow-xl hover:shadow-brand-900/40
            hover:translate-y-[-2px] transition-all"
              >
                <div className="flex items-center gap-2">
                  <Box className="w-6 h-6" /> Manage Products
                </div>
              </button>
            </Link>

            <Link href="/admin/categories" className="w-full sm:w-auto">
              <button
                className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500
            px-6 py-3 text-white font-semibold shadow-xl hover:shadow-brand-900/40
            hover:translate-y-[-2px] transition-all"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-6 h-6" /> Manage Categories
                </div>
              </button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {/* Users */}
            <div
              className="bg-white/5 backdrop-blur-xl border border-brand-500/20 rounded-xl p-6 flex flex-col items-center 
          shadow-lg hover:shadow-brand-800/30 transition-all hover:-translate-y-2"
            >
              <Users className="w-8 h-8 text-brand-300 mb-2" />
              <span className="text-3xl font-bold text-white">
                {stats.users}
              </span>
              <span className="text-slate-400 text-sm">Total Users</span>
            </div>

            {/* Products */}
            <div
              className="bg-white/5 backdrop-blur-xl border border-brand-500/20 rounded-xl p-6 flex flex-col items-center 
          shadow-lg hover:shadow-brand-800/30 transition-all hover:-translate-y-2"
            >
              <Box className="w-8 h-8 text-brand-300 mb-2" />
              <span className="text-3xl font-bold text-white">
                {stats.products}
              </span>
              <span className="text-slate-400 text-sm">Products</span>
            </div>

            {/* Barters */}
            <div
              className="bg-white/5 backdrop-blur-xl border border-brand-500/20 rounded-xl p-6 flex flex-col items-center 
          shadow-lg hover:shadow-brand-800/30 transition-all hover:-translate-y-2"
            >
              <Activity className="w-8 h-8 text-brand-300 mb-2" />
              <span className="text-3xl font-bold text-white">
                {stats.barters}
              </span>
              <span className="text-slate-400 text-sm">Active Barters</span>
            </div>
          </div>

          {/* RECENT BARTERS TABLE */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-brand-300 mb-4">
              Recent Barters
            </h2>

            <div className="overflow-x-auto rounded-xl shadow-2xl bg-surface-elevated/70 backdrop-blur-xl border border-white/10">
              <table className="min-w-full text-left text-slate-100 text-sm">
                <thead className="bg-brand-900/50 border-b border-white/10">
                  <tr>
                    {[
                      "Barter ID",
                      "Offered By",
                      "Offered Product",
                      "Requested From",
                      "Requested Product",
                      "Status",
                      "Created At",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 font-semibold text-brand-200 uppercase tracking-wide text-xs"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {barters.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-6 text-center text-slate-400"
                      >
                        No barters found.
                      </td>
                    </tr>
                  ) : (
                    barters.map((barter, i) => (
                      <tr
                        key={barter._id}
                        className={`border-t border-white/10 ${
                          i % 2 === 0 ? "bg-white/5" : "bg-white/0"
                        } hover:bg-white/10 transition`}
                      >
                        <td className="px-4 py-3">{barter._id}</td>
                        <td className="px-4 py-3">
                          {barter.offeredBy?.username || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {barter.productOfferedId?.title || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {barter.requestedFrom?.username || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {barter.productRequestedId?.title || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              barter.status === "pending"
                                ? "bg-yellow-700 text-yellow-200"
                                : barter.status === "approved"
                                ? "bg-green-700 text-green-200"
                                : "bg-red-700 text-red-200"
                            }`}
                          >
                            {barter.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {new Date(barter.createdAt).toLocaleString()}
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
