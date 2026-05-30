"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { X, Pencil } from "lucide-react";

type Product = {
  _id: string;
  title: string;
  description?: string;
  category: string;
  price?: number;
  isAvailable?: boolean;
  owner: { username: string };
};

type EditForm = {
  title: string;
  description: string;
  category: string;
  price: string;
  isAvailable: boolean;
};

const CATEGORIES = ["Electronics", "Clothing", "Books", "Toys", "Home", "Automobiles", "Other"];

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ title: "", description: "", category: "", price: "", isAvailable: true });
  const [editLoading, setEditLoading] = useState(false);

  const token = () => Cookies.get("token");

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE}/api/admin/products`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setProducts(res.data?.products ?? res.data ?? []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (productId: string) => {
    if (!confirm("Delete this product permanently?")) return;
    try {
      await axios.delete(`${API_BASE}/api/admin/product/${productId}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setProducts(products.filter((p) => p._id !== productId));
      toast.success("Product deleted successfully!");
    } catch {
      toast.error("Failed to delete product.");
    }
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
      const payload: any = {
        title: editForm.title,
        description: editForm.description,
        category: editForm.category,
        isAvailable: editForm.isAvailable,
      };
      if (editForm.price !== "") payload.price = parseFloat(editForm.price);

      const res = await axios.put(`${API_BASE}/api/products/${editProduct._id}`, payload, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setProducts((prev) => prev.map((p) => p._id === editProduct._id ? { ...p, ...res.data } : p));
      setEditProduct(null);
      toast.success("Product updated!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update product.");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="bg-surface p-4 sm:p-6 shadow-2xl min-h-screen backdrop-blur-xl">
      <button
        onClick={() => window.history.back()}
        className="mb-6 inline-flex items-center gap-2 text-brand-200 hover:text-brand-100 font-semibold text-sm transition-all duration-300 ease-out"
      >
        ← Go Back
      </button>

      <h2 className="text-3xl font-bold text-brand-500 mb-8 drop-shadow-sm">Products</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
          <p className="font-semibold">Error: {error}</p>
          <button onClick={fetchProducts} className="mt-2 text-sm px-3 py-1 bg-red-500/30 hover:bg-red-500/40 rounded transition">Retry</button>
        </div>
      )}

      {isLoading && !error && <div className="text-center py-12 text-slate-300"><p>Loading products...</p></div>}
      {!isLoading && !error && products.length === 0 && <div className="text-center py-12 text-slate-400"><p>No products found</p></div>}

      {!isLoading && products.length > 0 && (
        <div className="overflow-x-auto rounded-xl shadow-lg bg-white/5 backdrop-blur-md border border-white/10">
          <table className="min-w-full text-left text-slate-100 text-sm">
            <thead className="bg-white/10 border-b border-white/10">
              <tr>
                <th className="px-6 py-3 uppercase text-xs font-semibold tracking-wide text-brand-200">Title</th>
                <th className="hidden sm:table-cell px-6 py-3 uppercase text-xs font-semibold tracking-wide text-brand-200">Category</th>
                <th className="hidden md:table-cell px-6 py-3 uppercase text-xs font-semibold tracking-wide text-brand-200">Owner</th>
                <th className="px-6 py-3 uppercase text-xs font-semibold tracking-wide text-brand-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, idx) => (
                <tr key={product._id} className={`border-t border-white/10 transition ${idx % 2 === 0 ? "bg-white/5" : "bg-white/0"} hover:bg-white/10`}>
                  <td className="px-6 py-4 text-white">{product.title}</td>
                  <td className="hidden sm:table-cell px-6 py-4 text-brand-200">{product.category}</td>
                  <td className="hidden md:table-cell px-6 py-4 text-brand-200">{product.owner?.username || "N/A"}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <button
                      onClick={() => openEdit(product)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 text-sm font-semibold transition"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="px-4 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-sm transition shadow-md"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface-elevated border border-white/10 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Edit Product</h3>
              <button onClick={() => setEditProduct(null)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-200">Title</label>
                <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-2.5 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-200">Description</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3} className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-2.5 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all resize-none" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-200">Category</label>
                <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-2.5 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-200">Price (optional)</label>
                <input type="number" min="0" step="0.01" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} placeholder="Leave blank if free" className="w-full rounded-xl bg-white/10 border border-white/15 text-white px-4 py-2.5 placeholder:text-slate-400/70 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={editForm.isAvailable} onChange={(e) => setEditForm({ ...editForm, isAvailable: e.target.checked })} className="w-4 h-4 accent-brand-500" />
                <span className="text-sm font-medium text-slate-200">Available for swap</span>
              </label>
              <button type="submit" disabled={editLoading} className="w-full py-2.5 rounded-xl font-semibold bg-brand-500 hover:bg-brand-400 text-white transition disabled:opacity-50">
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
