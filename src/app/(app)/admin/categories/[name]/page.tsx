"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import Cookies from "js-cookie";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ArrowLeft, Package, Tag } from "lucide-react";
import { getImageSrc } from "@/lib/getImageSrc";

type Product = {
  _id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  price: number;
  isAvailable: boolean;
  owner: { _id: string; username: string };
  createdAt: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";

export default function CategoryProductsPage() {
  const { name } = useParams() as { name: string };
  const categoryName = decodeURIComponent(name);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = Cookies.get("token");

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/api/products`, {
          params: { category: categoryName, limit: 50 },
        });
        setProducts(res.data?.products ?? []);
      } catch {
        setError("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [categoryName]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/admin/product/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch {
      alert("Failed to delete product");
    }
  };

  return (
    <div className="min-h-screen bg-surface px-6 py-8">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Back */}
        <Link href="/admin/categories" className="mb-8 inline-flex items-center gap-2 text-white/40 hover:text-white/80 text-sm transition-colors duration-200">
          <ArrowLeft className="w-4 h-4" /> Back to Categories
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <Tag className="w-5 h-5 text-brand-400" />
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-400/80 font-semibold">Admin · Categories</p>
          </div>
          <h1 className="text-4xl font-black text-white mb-1">
            <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {categoryName}
            </span>
          </h1>
          <p className="text-white/40 text-sm mt-2">
            {isLoading ? "Loading..." : `${products.length} product${products.length !== 1 ? "s" : ""} in this category`}
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-56 rounded-2xl bg-white/5 border border-white/10 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-400 py-16">{error}</p>
        ) : products.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
              <Package className="w-9 h-9 text-white/20" />
            </div>
            <p className="text-white/50 font-semibold mb-1">No products found</p>
            <p className="text-white/25 text-sm">No products belong to "{categoryName}" yet.</p>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {products.map(product => (
              <motion.div
                key={product._id}
                variants={{ hidden: { opacity: 0, y: 20, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 22 } } }}
                className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:-translate-y-1.5 hover:shadow-2xl hover:border-white/20 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-36 bg-white/5 overflow-hidden">
                  {product.images?.[0] ? (
                    <Image
                      src={getImageSrc(product.images[0])}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-10 h-10 text-white/10" />
                    </div>
                  )}

                  {/* Status badge */}
                  <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${product.isAvailable ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/30" : "bg-red-500/30 text-red-300 border border-red-500/30"}`}>
                    {product.isAvailable ? "Available" : "Sold"}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(product._id, product.title)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-xl bg-red-500/20 hover:bg-red-500/60 border border-red-500/30 text-red-400 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-white font-semibold text-xs leading-tight line-clamp-1 mb-1">{product.title}</p>
                  <p className="text-white/40 text-[10px] line-clamp-1 mb-2">{product.description || "No description"}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-400 text-xs font-bold">
                      {product.price > 0 ? `$${product.price}` : "Free"}
                    </span>
                    <span className="text-white/30 text-[10px]">@{product.owner?.username}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
