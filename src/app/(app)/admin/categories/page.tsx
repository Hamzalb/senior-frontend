"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Cookies from "js-cookie";
import Image from "next/image";
import {
  Pencil, Trash2, Plus, Check, X, Search, LayoutGrid, ChevronDown, Lock,
  Cpu, ShoppingBag, BookOpen, Gamepad2, Home, Car, Package,
  Shirt, Dumbbell, Music, Camera, Utensils, Flower2, Gem, Tag,
} from "lucide-react";
import { getImageSrc } from "@/lib/getImageSrc";

type Category = { _id: string; name: string; createdAt: string; productCount: number; isDefault: boolean };
type Product  = { _id: string; title: string; images: string[]; price: number; isAvailable: boolean; owner: { username: string } };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; gradient: string; glow: string; iconBg: string }> = {
  electronics:  { icon: Cpu,        gradient: "from-blue-500/25 to-cyan-500/5",    glow: "hover:shadow-blue-500/20",    iconBg: "bg-blue-500/20 text-blue-300 border-blue-400/30" },
  clothing:     { icon: Shirt,       gradient: "from-pink-500/25 to-rose-500/5",    glow: "hover:shadow-pink-500/20",    iconBg: "bg-pink-500/20 text-pink-300 border-pink-400/30" },
  books:        { icon: BookOpen,    gradient: "from-amber-500/25 to-yellow-500/5", glow: "hover:shadow-amber-500/20",   iconBg: "bg-amber-500/20 text-amber-300 border-amber-400/30" },
  toys:         { icon: Gamepad2,    gradient: "from-purple-500/25 to-violet-500/5",glow: "hover:shadow-purple-500/20",  iconBg: "bg-purple-500/20 text-purple-300 border-purple-400/30" },
  home:         { icon: Home,        gradient: "from-emerald-500/25 to-green-500/5",glow: "hover:shadow-emerald-500/20", iconBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30" },
  automobiles:  { icon: Car,         gradient: "from-orange-500/25 to-amber-500/5", glow: "hover:shadow-orange-500/20",  iconBg: "bg-orange-500/20 text-orange-300 border-orange-400/30" },
  sports:       { icon: Dumbbell,    gradient: "from-red-500/25 to-rose-500/5",     glow: "hover:shadow-red-500/20",     iconBg: "bg-red-500/20 text-red-300 border-red-400/30" },
  music:        { icon: Music,       gradient: "from-indigo-500/25 to-blue-500/5",  glow: "hover:shadow-indigo-500/20",  iconBg: "bg-indigo-500/20 text-indigo-300 border-indigo-400/30" },
  photography:  { icon: Camera,      gradient: "from-slate-500/25 to-gray-500/5",   glow: "hover:shadow-slate-500/20",   iconBg: "bg-slate-500/20 text-slate-300 border-slate-400/30" },
  food:         { icon: Utensils,    gradient: "from-lime-500/25 to-green-500/5",   glow: "hover:shadow-lime-500/20",    iconBg: "bg-lime-500/20 text-lime-300 border-lime-400/30" },
  garden:       { icon: Flower2,     gradient: "from-teal-500/25 to-cyan-500/5",    glow: "hover:shadow-teal-500/20",    iconBg: "bg-teal-500/20 text-teal-300 border-teal-400/30" },
  fashion:      { icon: ShoppingBag, gradient: "from-fuchsia-500/25 to-pink-500/5", glow: "hover:shadow-fuchsia-500/20", iconBg: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/30" },
  jewelry:      { icon: Gem,         gradient: "from-cyan-500/25 to-blue-500/5",    glow: "hover:shadow-cyan-500/20",    iconBg: "bg-cyan-500/20 text-cyan-300 border-cyan-400/30" },
  other:        { icon: Package,     gradient: "from-zinc-500/25 to-slate-500/5",   glow: "hover:shadow-zinc-500/20",    iconBg: "bg-zinc-500/20 text-zinc-300 border-zinc-400/30" },
};
const FALLBACKS = [
  { gradient: "from-violet-500/25 to-purple-500/5",  glow: "hover:shadow-violet-500/20",  iconBg: "bg-violet-500/20 text-violet-300 border-violet-400/30" },
  { gradient: "from-sky-500/25 to-blue-500/5",       glow: "hover:shadow-sky-500/20",     iconBg: "bg-sky-500/20 text-sky-300 border-sky-400/30" },
  { gradient: "from-rose-500/25 to-pink-500/5",      glow: "hover:shadow-rose-500/20",    iconBg: "bg-rose-500/20 text-rose-300 border-rose-400/30" },
];
function getCfg(name: string, i: number) {
  const key = name.toLowerCase().trim();
  return CATEGORY_CONFIG[key] ? { ...CATEGORY_CONFIG[key] } : { icon: Tag, ...FALLBACKS[i % FALLBACKS.length] };
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  show:   { opacity: 1, y: 0,  scale: 1,    transition: { type: "spring" as const, stiffness: 260, damping: 22 } },
  exit:   { opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.2 } },
};

export default function CategoriesPage() {
  const [categories, setCategories]     = useState<Category[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [newName, setNewName]           = useState("");
  const [isAdding, setIsAdding]         = useState(false);
  const [addError, setAddError]         = useState<string | null>(null);
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [editName, setEditName]         = useState("");
  const [search, setSearch]             = useState("");
  const [openId, setOpenId]             = useState<string | null>(null);
  const [products, setProducts]         = useState<Record<string, Product[]>>({});
  const [loadingProducts, setLoadingProducts] = useState<string | null>(null);

  const token = Cookies.get("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/categories`);
      setCategories(res.data);
    } catch { setError("Failed to load categories"); }
    finally { setIsLoading(false); }
  };

  const toggleProducts = async (cat: Category) => {
    if (openId === cat._id) { setOpenId(null); return; }
    setOpenId(cat._id);
    if (products[cat._id]) return;
    setLoadingProducts(cat._id);
    try {
      const res = await axios.get(`${API_BASE}/api/products`, {
        params: { category: cat.name, limit: 50 },
      });
      setProducts(prev => ({ ...prev, [cat._id]: res.data?.products ?? [] }));
    } catch { setProducts(prev => ({ ...prev, [cat._id]: [] })); }
    finally { setLoadingProducts(null); }
  };

  const handleDeleteProduct = async (catId: string, productId: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/admin/product/${productId}`, { headers });
      setProducts(prev => ({ ...prev, [catId]: prev[catId].filter(p => p._id !== productId) }));
      setCategories(prev => prev.map(c => c._id === catId ? { ...c, productCount: Math.max(0, c.productCount - 1) } : c));
    } catch { alert("Failed to delete product"); }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setIsAdding(true); setAddError(null);
    try {
      const res = await axios.post(`${API_BASE}/api/categories`, { name: newName.trim() }, { headers });
      setCategories(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
    } catch (err: any) { setAddError(err.response?.data?.message || "Already exists"); }
    finally { setIsAdding(false); }
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;
    try {
      const res = await axios.put(`${API_BASE}/api/categories/${id}`, { name: editName.trim() }, { headers });
      setCategories(prev => prev.map(c => c._id === id ? res.data : c).sort((a, b) => a.name.localeCompare(b.name)));
      setEditingId(null);
    } catch (err: any) { alert(err.response?.data?.message || "Failed"); }
  };

  const handleDeleteCat = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/categories/${id}`, { headers });
      setCategories(prev => prev.filter(c => c._id !== id));
      if (openId === id) setOpenId(null);
    } catch { alert("Failed to delete"); }
  };

  const filtered = useMemo(() =>
    categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase())),
    [categories, search]
  );

  return (
    <div className="min-h-screen bg-surface overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative px-6 py-8 max-w-5xl mx-auto">
        <button onClick={() => window.history.back()} className="mb-10 flex items-center gap-2 text-white/40 hover:text-white/80 text-sm transition-colors">
          ← Back to Admin
        </button>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-brand-400" />
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-400/80 font-semibold">Admin · Categories</p>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-2 leading-tight">
            Product<br />
            <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Categories</span>
          </h1>
          <div className="flex gap-3 mt-4 flex-wrap">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
              <span className="text-white/70 text-xs font-medium">{categories.length} Categories</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-white/70 text-xs font-medium">
                {categories.reduce((s, c) => s + (c.productCount ?? 0), 0)} Products total
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search categories..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-brand-500/60 transition-colors" />
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-48">
              <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()} placeholder="New category..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-brand-500/60 transition-colors" />
            </div>
            <button onClick={handleAdd} disabled={isAdding || !newName.trim()}
              className="px-5 py-3 bg-gradient-to-r from-brand-600 to-brand-400 hover:from-brand-500 hover:to-brand-300 disabled:opacity-30 text-white font-bold rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/30 text-sm">
              {isAdding ? "..." : "Add"}
            </button>
          </div>
        </div>
        {addError && <p className="text-red-400 text-xs mb-4 flex items-center gap-1"><X className="w-3.5 h-3.5" />{addError}</p>}

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="h-36 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />)}
          </div>
        ) : error ? (
          <p className="text-center text-red-400 py-16">{error}</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/30 text-sm">No categories match "{search}"</div>
        ) : (
          <motion.div variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }} initial="hidden" animate="show"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((cat, i) => {
                const { icon: Icon, gradient, glow, iconBg } = getCfg(cat.name, i);
                const isOpen = openId === cat._id;
                const catProducts = products[cat._id] ?? [];
                const isLoadingCat = loadingProducts === cat._id;

                return (
                  <motion.div key={cat._id} variants={cardVariants} layout exit="exit"
                    className={`group relative overflow-hidden bg-gradient-to-br ${gradient} backdrop-blur-md border rounded-2xl transition-all duration-300 ${isOpen ? "border-brand-500/40 shadow-2xl col-span-2 md:col-span-3 lg:col-span-4" : `border-white/10 hover:border-white/20 hover:-translate-y-1.5 hover:shadow-xl ${glow}`}`}>

                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-white/5 via-transparent to-transparent transition-opacity duration-500 pointer-events-none rounded-2xl" />

                    {editingId === cat._id ? (
                      <div className="p-4 flex flex-col gap-2.5">
                        <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") handleEdit(cat._id); if (e.key === "Escape") setEditingId(null); }}
                          autoFocus className="w-full bg-white/10 border border-brand-400/40 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(cat._id)} className="flex-1 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 text-xs flex items-center justify-center gap-1 border border-emerald-500/20 transition-colors">
                            <Check className="w-3 h-3" /> Save
                          </button>
                          <button onClick={() => setEditingId(null)} className="flex-1 py-1.5 rounded-xl bg-white/8 hover:bg-white/15 text-white/50 text-xs flex items-center justify-center gap-1 border border-white/10 transition-colors">
                            <X className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="p-4 cursor-pointer" onClick={() => toggleProducts(cat)}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center flex-shrink-0 ${iconBg} transition-all duration-300 ${isOpen ? "scale-110 rotate-3" : "group-hover:scale-110 group-hover:rotate-3"}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-white font-bold text-sm leading-tight truncate">{cat.name}</p>
                                <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cat.productCount > 0 ? "bg-white/10 border-white/15 text-white/70" : "bg-white/5 border-white/10 text-white/30"}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${cat.productCount > 0 ? "bg-emerald-400" : "bg-white/20"}`} />
                                  {cat.productCount} {cat.productCount === 1 ? "product" : "products"}
                                </span>
                              </div>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-white/40 flex-shrink-0 mt-1 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                          </div>

                          {/* Edit/Delete — hidden for built-ins */}
                          <div className="flex gap-1.5 mt-3 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200" onClick={e => e.stopPropagation()}>
                            {cat.isDefault ? (
                              <div className="flex-1 py-1.5 rounded-xl bg-white/5 border border-white/8 text-white/25 text-xs flex items-center justify-center gap-1 cursor-not-allowed">
                                <Lock className="w-3 h-3" /> Built-in
                              </div>
                            ) : (
                              <>
                                <button onClick={() => { setEditingId(cat._id); setEditName(cat.name); }}
                                  className="flex-1 py-1.5 rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 text-white/50 hover:text-white text-xs flex items-center justify-center gap-1 transition-all">
                                  <Pencil className="w-3 h-3" /> Edit
                                </button>
                                <button onClick={() => handleDeleteCat(cat._id, cat.name)}
                                  className="flex-1 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/35 border border-red-500/20 text-red-400 hover:text-red-300 text-xs flex items-center justify-center gap-1 transition-all">
                                  <Trash2 className="w-3 h-3" /> Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden border-t border-white/10">
                              {isLoadingCat ? (
                                <div className="p-4 space-y-2">
                                  {[...Array(3)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />)}
                                </div>
                              ) : catProducts.length === 0 ? (
                                <div className="p-6 text-center">
                                  <Package className="w-8 h-8 text-white/15 mx-auto mb-2" />
                                  <p className="text-white/30 text-sm">No products in this category</p>
                                </div>
                              ) : (
                                <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
                                  {catProducts.map((product, pi) => (
                                    <motion.div key={product._id}
                                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: pi * 0.04 }}
                                      className="group/p flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/15 transition-all duration-200">
                                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                                        {product.images?.[0] ? (
                                          <Image src={getImageSrc(product.images[0])} alt={product.title} width={40} height={40} className="w-full h-full object-cover" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-4 h-4 text-white/20" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-white text-xs font-semibold truncate">{product.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <span className="text-brand-400 text-[10px] font-bold">{product.price > 0 ? `$${product.price}` : "Free"}</span>
                                          <span className="text-white/30 text-[10px]">@{product.owner?.username}</span>
                                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${product.isAvailable ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                                            {product.isAvailable ? "Available" : "Sold"}
                                          </span>
                                        </div>
                                      </div>
                                      <button onClick={() => handleDeleteProduct(cat._id, product._id, product.title)}
                                        className="w-7 h-7 rounded-xl bg-red-500/15 hover:bg-red-500/40 border border-red-500/20 text-red-400 hover:text-red-300 flex items-center justify-center opacity-0 group-hover/p:opacity-100 transition-all duration-200 flex-shrink-0">
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </motion.div>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
