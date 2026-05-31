"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Cookies from "js-cookie";
import Image from "next/image";
import { Box, Search, Pencil, Trash2, X, Package, CheckCircle, XCircle, ArrowRightLeft, LayoutGrid } from "lucide-react";
import toast from "react-hot-toast";
import { getImageSrc } from "@/lib/getImageSrc";

type Product = {
  _id: string;
  title: string;
  description?: string;
  category: string;
  price?: number;
  isAvailable?: boolean;
  images?: string[];
  owner: { username: string };
};

type EditForm = { title: string; description: string; category: string; price: string; isAvailable: boolean };

const CATEGORIES = ["Electronics", "Clothing", "Books", "Toys", "Home", "Automobiles", "Other"];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://senior-backend-e4gw.onrender.com";

const CATEGORY_GRADIENT: Record<string, { gradient: string; glow: string }> = {
  electronics:  { gradient: "from-blue-500/20 to-cyan-500/5",    glow: "hover:shadow-blue-500/20"    },
  clothing:     { gradient: "from-pink-500/20 to-rose-500/5",    glow: "hover:shadow-pink-500/20"    },
  books:        { gradient: "from-amber-500/20 to-yellow-500/5", glow: "hover:shadow-amber-500/20"   },
  toys:         { gradient: "from-purple-500/20 to-violet-500/5",glow: "hover:shadow-purple-500/20"  },
  home:         { gradient: "from-emerald-500/20 to-green-500/5",glow: "hover:shadow-emerald-500/20" },
  automobiles:  { gradient: "from-orange-500/20 to-amber-500/5", glow: "hover:shadow-orange-500/20"  },
  other:        { gradient: "from-zinc-500/20 to-slate-500/5",   glow: "hover:shadow-zinc-500/20"    },
};
function getGradient(category: string) {
  return CATEGORY_GRADIENT[category.toLowerCase()] ?? { gradient: "from-brand-500/15 to-purple-500/5", glow: "hover:shadow-brand-500/20" };
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  show:   { opacity: 1, y: 0,  scale: 1,  transition: { type: "spring" as const, stiffness: 260, damping: 22 } },
  exit:   { opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.2 } },
};

type StatusFilter = "all" | "available" | "unavailable" | "traded";

export default function AdminProductsPage() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [tradedCount, setTradedCount]   = useState(0);

  const [editProduct, setEditProduct]     = useState<Product | null>(null);
  const [editForm, setEditForm]           = useState<EditForm>({ title: "", description: "", category: "", price: "", isAvailable: true });
  const [editLoading, setEditLoading]     = useState(false);

  const token = Cookies.get("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchProducts = async () => {
    setIsLoading(true); setError(null);
    try {
      const [prodRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/admin/products`, { headers }),
        axios.get(`${API_BASE}/api/admin/stats`, { headers }).catch(() => null),
      ]);
      setProducts(prodRes.data?.products ?? prodRes.data ?? []);
      if (statsRes?.data?.bartersByStatus) {
        const approved = statsRes.data.bartersByStatus.find((b: any) => b.status === "Approved");
        setTradedCount(approved?.count ?? 0);
      }
    } catch { setError("Failed to load products"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  // Computed stats
  const stats = useMemo(() => ({
    total:       products.length,
    available:   products.filter(p => p.isAvailable).length,
    unavailable: products.filter(p => !p.isAvailable).length,
  }), [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (statusFilter === "available")   list = list.filter(p => p.isAvailable);
    if (statusFilter === "unavailable") list = list.filter(p => !p.isAvailable);
    // "traded" uses same unavailable set — traded products are marked unavailable after barter approval
    if (statusFilter === "traded")      list = list.filter(p => !p.isAvailable);
    return list.filter(p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      (p.owner?.username ?? "").toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search, statusFilter]);

  const handleDelete = async (productId: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/admin/product/${productId}`, { headers });
      setProducts(prev => prev.filter(p => p._id !== productId));
      toast.success("Product deleted.");
    } catch { toast.error("Failed to delete product."); }
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setEditForm({
      title: product.title,
      description: product.description ?? "",
      category: product.category,
      price: product.price !== undefined ? String(product.price) : "",
      isAvailable: product.isAvailable ?? true,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    setEditLoading(true);
    try {
      const payload: any = { title: editForm.title, description: editForm.description, category: editForm.category, isAvailable: editForm.isAvailable };
      if (editForm.price !== "") payload.price = parseFloat(editForm.price);
      const res = await axios.put(`${API_BASE}/api/products/${editProduct._id}`, payload, { headers });
      setProducts(prev => prev.map(p => p._id === editProduct._id ? { ...p, ...res.data } : p));
      setEditProduct(null);
      toast.success("Product updated!");
    } catch (err: any) { toast.error(err.response?.data?.message || "Failed to update."); }
    finally { setEditLoading(false); }
  };

  return (
    <div className="min-h-screen bg-surface overflow-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative px-6 py-8 max-w-5xl mx-auto">
        <button onClick={() => window.history.back()} className="mb-10 flex items-center gap-2 text-white/40 hover:text-white/80 text-sm transition-colors">
          ← Back to Admin
        </button>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <Box className="w-5 h-5 text-brand-400" />
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-400/80 font-semibold">Admin · Products</p>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-2 leading-tight">
            Manage<br />
            <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Listings</span>
          </h1>
        </div>

        {/* Stats filter cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            {
              key: "all" as StatusFilter,
              label: "Total Products",
              value: stats.total,
              icon: LayoutGrid,
              color: "brand",
              dot: "bg-brand-400",
              active: "border-brand-500/60 bg-brand-500/10",
              inactive: "border-white/10 bg-white/5",
            },
            {
              key: "available" as StatusFilter,
              label: "Ready to Trade",
              value: stats.available,
              icon: CheckCircle,
              color: "emerald",
              dot: "bg-emerald-400",
              active: "border-emerald-500/60 bg-emerald-500/10",
              inactive: "border-white/10 bg-white/5",
            },
            {
              key: "unavailable" as StatusFilter,
              label: "Unavailable",
              value: stats.unavailable,
              icon: XCircle,
              color: "red",
              dot: "bg-red-400",
              active: "border-red-500/60 bg-red-500/10",
              inactive: "border-white/10 bg-white/5",
            },
            {
              key: "traded" as StatusFilter,
              label: "Traded",
              value: tradedCount,
              icon: ArrowRightLeft,
              color: "amber",
              dot: "bg-amber-400",
              active: "border-amber-500/60 bg-amber-500/10",
              inactive: "border-white/10 bg-white/5",
            },
          ].map(({ key, label, value, icon: Icon, dot, active, inactive }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`relative text-left p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${statusFilter === key ? active : inactive}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${dot} ${statusFilter === key ? "animate-pulse" : ""}`} />
                <Icon className="w-3.5 h-3.5 text-white/40" />
              </div>
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-white/50 text-xs mt-0.5">{label}</p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, category or owner…"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-brand-500/60 transition-colors" />
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="h-44 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />)}
          </div>
        ) : error ? (
          <p className="text-center text-red-400 py-16">{error}</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/30 text-sm">
            No products{search ? ` match "${search}"` : ` in this filter`}
          </div>
        ) : (
          <motion.div variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }} initial="hidden" animate="show"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((product) => {
                const { gradient, glow } = getGradient(product.category);
                return (
                  <motion.div key={product._id} variants={cardVariants} layout exit="exit"
                    className={`group relative overflow-hidden bg-gradient-to-br ${gradient} backdrop-blur-md border border-white/10 hover:border-white/20 rounded-2xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${glow}`}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-white/5 via-transparent to-transparent transition-opacity duration-500 pointer-events-none rounded-2xl" />

                    <div className="p-3">
                      {/* Thumbnail */}
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-white/5">
                        {product.images?.[0] ? (
                          <Image src={getImageSrc(product.images[0])} alt={product.title} fill className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Package className="w-8 h-8 text-white/15" />
                          </div>
                        )}
                        {/* Status badge */}
                        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                          product.isAvailable
                            ? "bg-emerald-500/80 text-white"
                            : "bg-red-500/80 text-white"
                        }`}>
                          {product.isAvailable ? (
                            <><CheckCircle className="w-2.5 h-2.5" /> Available</>
                          ) : (
                            <><XCircle className="w-2.5 h-2.5" /> Unavailable</>
                          )}
                        </div>
                      </div>

                      <p className="text-white font-bold text-sm truncate mb-0.5">{product.title}</p>
                      <p className="text-white/40 text-[11px] truncate mb-0.5">{product.category}</p>
                      <p className="text-brand-400 text-[11px] truncate">@{product.owner?.username}</p>

                      {/* Actions — appear on hover */}
                      <div className="flex gap-1.5 mt-3 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                        <button onClick={() => openEdit(product)}
                          className="flex-1 py-1.5 rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 text-white/50 hover:text-white text-xs flex items-center justify-center gap-1 transition-all">
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => handleDelete(product._id, product.title)}
                          className="flex-1 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/35 border border-red-500/20 text-red-400 hover:text-red-300 text-xs flex items-center justify-center gap-1 transition-all">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-surface-elevated border border-white/10 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Edit Product</h3>
                <button onClick={() => setEditProduct(null)} className="text-slate-400 hover:text-white transition"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-200">Title</label>
                  <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} required
                    className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-2.5 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-200">Description</label>
                  <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={3}
                    className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-2.5 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all resize-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-200">Category</label>
                  <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-2.5 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-200">Price (optional)</label>
                  <input type="number" min="0" step="0.01" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                    placeholder="Leave blank if free"
                    className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-2.5 placeholder:text-slate-400/70 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={editForm.isAvailable} onChange={e => setEditForm({ ...editForm, isAvailable: e.target.checked })} className="w-4 h-4 accent-brand-500" />
                  <span className="text-sm font-medium text-slate-200">Available for swap</span>
                </label>
                <button type="submit" disabled={editLoading}
                  className="w-full py-2.5 rounded-xl font-semibold bg-gradient-to-r from-brand-600 to-brand-400 hover:from-brand-500 hover:to-brand-300 text-white transition disabled:opacity-50">
                  {editLoading ? "Saving…" : "Save Changes"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
