"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

type DecodedToken = {
  id: string;
  exp: number;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";

export default function AddProductPage() {
  const router = useRouter();
  const mountedRef = useRef(false);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Other",
    isAvailable: true,
    price: "",
  });

  useEffect(() => {
    mountedRef.current = true;
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return;

    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        if (decoded.exp * 1000 < Date.now()) {
          Cookies.remove("token");
          router.push("/login");
        } else {
          if (mountedRef.current) {
            setOwnerId(decoded.id);
          }
        }
      } catch (err) {
        console.error("Invalid token", err);
        Cookies.remove("token");
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
    if (mountedRef.current) {
      setCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return;

    if (preview) {
      URL.revokeObjectURL(preview);
    }
  }, [file]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (mountedRef.current) {
        setFile(selectedFile);
      }
      const newPreview = URL.createObjectURL(selectedFile);
      if (mountedRef.current) {
        setPreview(newPreview);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerId || !file) {
      return alert("All fields (including the image) are required.");
    }

    const dataToSend = new FormData();
    dataToSend.append("title", formData.title);
    dataToSend.append("description", formData.description);
    dataToSend.append("category", formData.category);
    dataToSend.append("isAvailable", String(formData.isAvailable));
    dataToSend.append("price", formData.price || "0");
    dataToSend.append("image", file);

    try {
      await axios.post(`${API_BASE}/api/products`, dataToSend, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      alert("Product added successfully!");
      router.push("/products");
    } catch (err: any) {
      console.error("Error adding product:", {
        status: err.response?.status,
        data: err.response?.data,
      });
      alert("Failed to add product. See console for details.");
    }
  };

  if (checkingAuth)
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-slate-200">
        Checking auth...
      </div>
    );

  return (
    <div className="relative min-h-screen bg-surface text-slate-100 flex items-center justify-center px-4 py-20 sm:py-24 overflow-hidden">
      <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.22),transparent_30%),radial-gradient(circle_at_80%_0,rgba(124,58,237,0.2),transparent_28%),radial-gradient(circle_at_60%_80%,rgba(255,255,255,0.06),transparent_32%)]" />
      <div className="absolute -bottom-32 -right-24 w-80 h-80 bg-brand-500/15 blur-3xl rounded-full" />
      <div className="absolute -top-24 -left-16 w-64 h-64 bg-brand-700/15 blur-3xl rounded-full" />
      <div className="relative w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_25px_70px_-35px_rgba(168,85,247,0.35)] p-6 sm:p-10">
        <div className="text-center space-y-2 mb-4">
          <p className="text-sm uppercase tracking-[0.35em] text-brand-200/80">
            Listing
          </p>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white drop-shadow">
            Add New Product
          </h1>
        </div>

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
          ></textarea>

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

          {/* File Upload */}
          <label className="block text-slate-200 text-sm font-semibold">
            Upload Product Image
          </label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleFileChange}
            required
            className="
          w-full px-4 py-3 rounded-lg bg-white/10 text-white
          border border-white/20 cursor-pointer
          file:bg-brand-500 file:text-slate-950 file:rounded file:px-4 file:py-2
          file:border-none file:mr-4
          focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40
          outline-none transition
        "
          />

          {/* Preview */}
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-xl border border-white/20 shadow-lg mt-3"
            />
          )}

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

          {/* Submit Button */}
          <button
            type="submit"
            className="
          w-full py-3.5 rounded-lg font-semibold text-slate-950
          bg-gradient-to-r from-brand-500 via-brand-400 to-brand-700
          hover:shadow-lg hover:shadow-brand-500/35
          transition-all duration-300 active:scale-[0.98]
        "
          >
            Add Product
          </button>
        </form>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="
        mt-5 w-full py-2 rounded-lg text-slate-300
        bg-white/5 border border-white/10
        hover:bg-white/10 transition-all
      "
        >
          Go Back
        </button>
      </div>
    </div>
  );
}