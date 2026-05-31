"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { LogOut, Plus, Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getImageSrc } from "@/lib/getImageSrc";
import SectionBackground from "@/components/SectionBackground";

type Product = {
  _id: string;
  title: string;
  description: string;
  images: string[];
  owner: { _id: string; username: string };
  category: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://senior-backend-e4gw.onrender.com";

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();
  const mountedRef = useRef(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { mountedRef.current = true; }, []);

  useEffect(() => {
    if (!mountedRef.current) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => {
      if (!mountedRef.current) return;
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return;
    setRole(Cookies.get("role") || null);
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return;
    const fetchProducts = async () => {
      if (!mountedRef.current) return;
      setLoading(true);
      setError(null);
      try {
        const token = Cookies.get("token");
        const res = await axios.get<Product[]>(
          `${API_BASE}/api/products/my-products`,
          { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );
        if (!mountedRef.current) return;
        setProducts(res.data);
      } catch (err) {
        if (!mountedRef.current) return;
        setError("Failed to load products.");
      } finally {
        if (!mountedRef.current) return;
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleLogout = () => {
    logout();
    Cookies.remove("username");
    Cookies.remove("role");
    router.push("/");
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Delete this product permanently?")) return;
    setDeletingId(productId);
    try {
      const token = Cookies.get("token");
      await axios.delete(`${API_BASE}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      toast.success("Product deleted.");
    } catch {
      toast.error("Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  const username = Cookies.get("username") || "";
  const avatarInitial = username ? username.charAt(0).toUpperCase() : "U";

  return (
    <div className="relative min-h-screen bg-surface text-slate-100 overflow-hidden pt-16 md:pt-20">
      <SectionBackground prefersReducedMotion={prefersReducedMotion} />

      <div className="relative container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4 sm:gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-brand-300/80">Account</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 tracking-tight">My Profile</h1>
            <p className="text-white/70 text-lg">Manage your items and account settings.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white px-6 py-2 rounded-xl transition-all hover:shadow-lg hover:shadow-brand-500/20"
            >
              <LogOut className="h-5 w-5" />
              Log Out
            </button>
            {role === "admin" && (
              <Link href="/admin">
                <button className="px-8 py-3 bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600 text-white rounded-xl text-lg font-semibold transition-all shadow-md shadow-brand-500/30 hover:shadow-brand-500/50">
                  Admin Panel
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Profile Card column */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {/* Card */}
            <div className="bg-surface-elevated/60 backdrop-blur-xl rounded-2xl p-5 sm:p-8 shadow-2xl shadow-brand-500/10 text-center border border-white/[0.08]">
              <div className="flex flex-col items-center space-y-5">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-brand-500/25 border border-white/20">
                  {avatarInitial}
                </div>
                <h2 className="text-2xl font-bold text-white">{username || "User"}</h2>
                <p className="text-white/60 text-sm leading-relaxed">
                  Welcome back! Manage your products, update your profile, and keep track of your barters.
                </p>
              </div>
            </div>

            {/* Edit Profile button — below the card */}
            <Link href="/profile/update-profile" className="w-full">
              <button className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-brand-500/20 text-white rounded-xl text-sm font-semibold transition-all border border-white/15 shadow hover:shadow-brand-500/25">
                <Pencil className="w-4 h-4" />
                Edit Profile
              </button>
            </Link>
          </div>

          {/* Products */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-2xl p-5 sm:p-8 shadow-xl shadow-brand-500/20 border border-white/10">
            <div className="flex flex-wrap justify-between items-center mb-6 sm:mb-8 gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Your Products</h2>
              <button
                onClick={() => router.push("/add-product")}
                className="flex items-center gap-2 bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600 text-slate-950 py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl font-semibold text-sm transition-all shadow-md shadow-brand-500/30 hover:shadow-brand-500/35"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                Add Product
              </button>
            </div>

            {loading && <p className="text-slate-300">Loading products...</p>}
            {error && <p className="text-brand-200">{error}</p>}
            {!loading && products.length === 0 && (
              <p className="text-slate-300">You don't have any products yet.</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product._id} className="flex flex-col gap-2">
                  {/* Product card */}
                  <Link
                    href={`/products/${product._id}`}
                    className="group relative bg-white/5 hover:bg-white/10 p-4 rounded-xl shadow-lg hover:shadow-brand-500/25 border border-white/10 transition-all duration-200 hover:scale-[1.02] flex flex-col"
                  >
                    {product.images && product.images.length > 0 && (
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3">
                        <Image
                          src={getImageSrc(product.images?.[0] ?? "")}
                          alt={product.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <h3 className="text-base font-semibold text-white truncate mb-1">{product.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{product.description}</p>
                  </Link>

                  {/* Action buttons — always visible, below the card */}
                  <div className="flex gap-2">
                    <Link
                      href={`/edit-product/${product._id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white/70 hover:bg-brand-500/10 hover:border-brand-500/30 hover:text-brand-300 transition-all duration-200"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      disabled={deletingId === product._id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white/70 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {deletingId === product._id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
