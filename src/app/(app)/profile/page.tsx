"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { LogOut, Plus, Pencil } from "lucide-react";
import axios from "axios";
import Link from "next/link";
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

// Pull from .env.local or fallback
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();
  const mountedRef = useRef(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
  }, []);

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
        console.error("Error fetching products:", err);
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
    logout(); // <-- This removes the token and updates React state!
    Cookies.remove("username");
    Cookies.remove("role");
    router.push("/");
  };

  const handleAddProduct = () => {
    router.push("/add-product");
  };

  const username = Cookies.get("username") || "";
  const avatarInitial = username ? username.charAt(0).toUpperCase() : "U";

  return (
    <div className="relative min-h-screen bg-surface text-slate-100 overflow-hidden pt-16 md:pt-20">
      {/* Unified background style with particles */}
      <SectionBackground prefersReducedMotion={prefersReducedMotion} />
      
      <div className="relative container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4 sm:gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-brand-300/80">
              Account
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 tracking-tight">
              My Profile
            </h1>
            <p className="text-white/70 text-lg">
              Manage your items and account settings.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 border border-white/10 text-white/70 hover:bg-white/10 
                     hover:text-white px-6 py-2 rounded-xl transition-all hover:shadow-lg hover:shadow-brand-500/20"
            >
              <LogOut className="h-5 w-5" />
              Log Out
            </button>

            {role === "admin" && (
              <Link href="/admin">
                <button
                  className="px-8 py-3 bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600 text-white rounded-xl 
                             text-lg font-semibold transition-all shadow-md shadow-brand-500/30 hover:shadow-brand-500/50"
                >
                  Admin Panel
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Profile Card */}
          <div
            className="lg:col-span-1 bg-surface-elevated/60 backdrop-blur-xl
                      rounded-2xl p-5 sm:p-8 shadow-2xl shadow-brand-500/10 text-center border border-white/[0.08]"
          >
            <div className="flex flex-col items-center space-y-5">
              <div
                className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center 
                          text-white text-3xl font-bold shadow-lg shadow-brand-500/25 border border-white/20"
              >
                {avatarInitial}
              </div>

              <h2 className="text-2xl font-bold text-white">
                {username || "User"}
              </h2>

              <p className="text-white/60 text-sm leading-relaxed">
                Welcome back! Manage your products, update your profile, and
                keep track of your barters in one place.
              </p>

              <Link href="/profile/update-profile">
                <button
                  className="mt-2 px-5 py-2 bg-white/10 hover:bg-brand-500/20 text-white rounded-md 
                             text-sm transition-all border border-white/15 shadow hover:shadow-brand-500/25"
                >
                  Edit Profile
                </button>
              </Link>
            </div>
          </div>

          {/* PRODUCTS */}
          <div
            className="lg:col-span-2 bg-white/5 backdrop-blur-md
                      rounded-2xl p-5 sm:p-8 shadow-xl shadow-brand-500/20 border border-white/10"
          >
            <div className="flex flex-wrap justify-between items-center mb-6 sm:mb-8 gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Your Products</h2>

              <button
                onClick={handleAddProduct}
                className="flex items-center gap-2 bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600
                       text-slate-950 py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl font-semibold text-sm transition-all shadow-md
                       shadow-brand-500/30 hover:shadow-brand-500/35"
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
                <div
                  key={product._id}
                  className="group relative bg-white/5 hover:bg-white/10 p-4 rounded-xl shadow-lg hover:shadow-brand-500/25 
                         border border-white/10 transition-all duration-200 transform hover:scale-[1.03] 
                         flex flex-col h-full"
                >
                  {/* Edit Button */}
                  <Link
                    href={`/edit-product/${product._id}`}
                    className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/80 text-slate-700 
                           backdrop-blur-sm shadow-sm opacity-0 group-hover:opacity-100 transition-all 
                           duration-200 hover:bg-white hover:text-brand-600 hover:scale-110"
                    title="Edit product"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>

                  <Link
                    href={`/products/${product._id}`}
                    className="flex flex-col h-full"
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

                    <div className="flex flex-col flex-grow">
                      <h3 className="text-lg font-semibold text-white truncate mb-1">
                        {product.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2 flex-grow">
                        {product.description}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}