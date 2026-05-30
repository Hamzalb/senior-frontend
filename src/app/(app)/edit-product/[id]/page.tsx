"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { ArrowLeft } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Other",
    isAvailable: true,
    price: "",
  });

  const [originalProduct, setOriginalProduct] = useState<any>(null);

  // Fetch product data on mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("token");
        
        if (!token) {
          setError("Authentication required. Please log in.");
          return;
        }

        const res = await axios.get(`${API_BASE}/api/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const product = res.data;
        setOriginalProduct(product);
        
        setFormData({
          title: product.title || "",
          description: product.description || "",
          category: product.category || "Other",
          isAvailable: product.isAvailable ?? true,
          price: product.price?.toString() || "",
        });
      } catch (err: any) {
        console.error("Error fetching product:", err);
        setError(err.response?.data?.message || "Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = Cookies.get("token");
    if (!token) {
      setError("Authentication token missing. Please log in again.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await axios.put(
        `${API_BASE}/api/products/${productId}`,
        {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          isAvailable: formData.isAvailable,
          price: formData.price ? parseFloat(formData.price) : 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Product updated successfully!");
      router.push("/my-products");
    } catch (err: any) {
      console.error("Error updating product:", err);
      setError(err.response?.data?.message || "Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-slate-200">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          Loading product...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-surface text-slate-100 flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.22),transparent_30%),radial-gradient(circle_at_80%_0,rgba(124,58,237,0.2),transparent_28%),radial-gradient(circle_at_60%_80%,rgba(255,255,255,0.06),transparent_32%)]" />
      <div className="absolute -bottom-32 -right-24 w-80 h-80 bg-brand-500/15 blur-3xl rounded-full" />
      <div className="absolute -top-24 -left-16 w-64 h-64 bg-brand-700/15 blur-3xl rounded-full" />
      
      <div className="relative w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_25px_70px_-35px_rgba(168,85,247,0.35)] p-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-brand-200/80">
              Edit Product
            </p>
            <h1 className="text-2xl font-extrabold text-white drop-shadow">
              Update Your Listing
            </h1>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <input
            type="text"
            name="title"
            placeholder="Product Title"
            value={formData.title}
            onChange={handleChange}
            required
            className="
              w-full px-4 py-3 rounded-lg bg-white/10 text-white
              placeholder:text-slate-300/70
              border border-white/20
              focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40
              outline-none transition
            "
          />

          {/* Description */}
          <textarea
            name="description"
            placeholder="Product Description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="
              w-full px-4 py-3 rounded-lg bg-white/10 text-white
              placeholder:text-slate-300/70
              border border-white/20
              focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40
              outline-none resize-none transition
            "
          />

          {/* Price */}
          <input
            type="number"
            name="price"
            placeholder="Approximate Price (optional)"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="
              w-full px-4 py-3 rounded-lg bg-white/10 text-white
              placeholder:text-slate-300/70
              border border-white/20
              focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40
              outline-none transition
            "
          />

          {/* Category */}
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="
              w-full px-4 py-3 rounded-lg bg-white/10 text-white
              border border-white/20
              focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40
              outline-none transition
            "
          >
            <option className="text-gray-700" value="Electronics">
              Electronics
            </option>
            <option className="text-gray-700" value="Clothing">
              Clothing
            </option>
            <option className="text-gray-700" value="Books">
              Books
            </option>
            <option className="text-gray-700" value="Toys">
              Toys
            </option>
            <option className="text-gray-700" value="Home">
              Home
            </option>
            <option className="text-gray-700" value="Automobiles">
              Automobiles
            </option>
            <option className="text-gray-700" value="Other">
              Other
            </option>
          </select>

          {/* Availability Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isAvailable"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="w-5 h-5 rounded border-white/20 bg-white/10 text-brand-500 focus:ring-brand-500/40"
            />
            <label htmlFor="isAvailable" className="text-slate-200">
              Product is available for trade
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="
              w-full py-3 px-6 rounded-lg font-semibold
              bg-gradient-to-r from-brand-500 to-brand-700
              text-white shadow-lg
              hover:from-brand-400 hover:to-brand-600
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-300
            "
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
