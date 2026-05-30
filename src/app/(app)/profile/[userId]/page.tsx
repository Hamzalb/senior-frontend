"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { User, ArrowLeft } from "lucide-react";
import ProductCard, { ProductCardSkeleton } from "@/components/ProductCard";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";

type UserInfo = {
  _id: string;
  username: string;
  email: string;
  role: string;
};

type Product = {
  _id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  owner: { _id: string; username: string };
  isAvailable: boolean;
  createdAt: string;
  price?: number;
};

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = Cookies.get("token");
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

        const [userRes, productsRes] = await Promise.all([
          fetch(`${API_BASE}/api/users/${userId}`, { headers }),
          fetch(`${API_BASE}/api/products/user/${userId}`),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(Array.isArray(productsData) ? productsData : productsData.products ?? []);
        }
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return (
    <div className="relative min-h-screen bg-surface py-14 overflow-x-hidden">
      <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.12),transparent_30%),radial-gradient(circle_at_80%_0,rgba(124,58,237,0.12),transparent_28%)]" />
      <div className="absolute -bottom-32 -right-24 w-80 h-80 bg-brand-500/10 blur-3xl rounded-full" />
      <div className="absolute -top-24 -left-16 w-64 h-64 bg-brand-700/10 blur-3xl rounded-full" />

      <div className="relative container mx-auto px-4">
        <Link
          href="/messages"
          className="inline-flex items-center gap-2 text-brand-200 hover:text-brand-100 text-sm font-semibold mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to messages
        </Link>

        {loading ? (
          <div>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 rounded-full bg-white/5 animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
                <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          </div>
        ) : error ? (
          <p className="text-red-400 text-center py-20">{error}</p>
        ) : (
          <>
            {/* User Header */}
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/30">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {user?.username ?? "Unknown User"}
                </h1>
                {products.length > 0 && (
                  <p className="text-slate-400 text-sm mt-0.5">
                    {products.length} product{products.length !== 1 ? "s" : ""} listed
                  </p>
                )}
              </div>
            </div>

            {/* Products */}
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.35em] text-brand-200/80 mb-2">Listings</p>
              <h2 className="text-xl font-semibold text-white mb-6">
                {user?.username ? `${user.username}'s Products` : "Products"}
              </h2>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
                    <User className="w-7 h-7 text-slate-400" />
                  </div>
                  <p className="text-slate-300">This user has no products listed yet.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    id={product._id}
                    title={product.title}
                    description={product.description}
                    images={product.images}
                    category={product.category}
                    owner={product.owner}
                    isAvailable={product.isAvailable}
                    createdAt={product.createdAt}
                    showDescription={true}
                    price={product.price}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
