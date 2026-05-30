// frontend/app/products/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { getImageSrc } from "@/lib/getImageSrc";
import { MdEmail } from "react-icons/md";

type Product = {
  _id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  owner: { _id: string; username: string; email: string };
  isAvailable: boolean;
  createdAt: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";

export default function ProductPage() {
  const { id: productId } = useParams() as { id: string };
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get<Product>(
          `${API_BASE}/api/products/${productId}`
        );
        setProduct(res.data);
      } catch (err: any) {
        console.error("Error fetching product:", err);
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleDakesh = () => {
    if (product) {
      router.push(`/dakesh?productIdToBarterFor=${product._id}`);
    }
  };

  const getContactOwnerMailto = () => {
    if (!product) return "#";
    const subject = encodeURIComponent(`Item Swap Request: ${product.title}`);
    const body = encodeURIComponent(
      `Hi ${product.owner?.username || "there"},\n\n` +
      `I'm interested in swapping for your item "${product.title}".\n\n` +
      `I'd love to discuss a potential exchange. Let me know if you're interested!\n\n` +
      `Best regards`
    );
    return `mailto:${product.owner?.email || ""}?subject=${subject}&body=${body}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface px-4 pt-20 flex items-center justify-center">
        <p className="text-white/60">Loading product...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-surface px-4 pt-20 flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="min-h-screen bg-surface px-4 pt-20 flex items-center justify-center">
        <p className="text-white/60">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface px-4 pt-20 sm:pt-24 pb-8 sm:pb-14 flex items-center justify-center">
      <div
        className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center max-w-5xl w-full
                  bg-white/5 backdrop-blur-md rounded-2xl p-5 sm:p-8
                  border border-white/10 shadow-xl"
      >
        {/* IMAGE SECTION */}
        <div className="w-full md:w-2/5">
          <div
            className="relative w-full aspect-square rounded-xl overflow-hidden shadow-lg bg-black/10
                      border border-white/10 hover:shadow-brand-500/30 hover:scale-[1.02] transition-all duration-300"
          >
            {product.images?.length ? (
              <Image
                src={getImageSrc(product.images[0])}
                alt={product.title}
                fill
                className="object-contain p-4 transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-white/5 text-white/40 text-sm">
                No Image
              </div>
            )}
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="w-full md:flex-1 flex flex-col gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white drop-shadow-md leading-tight">
            {product.title}
          </h1>

          <p className="text-sm text-brand-300 font-medium">
            By{" "}
            <span className="text-white">
              {product.owner?.username || "Unknown"}
            </span>
          </p>

          <p className="text-white/70 text-base leading-relaxed">
            {product.description}
          </p>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDakesh}
              className="inline-flex items-center justify-center bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600
                    text-white px-6 sm:px-8 py-3 rounded-xl font-semibold
                    hover:opacity-90 hover:shadow-lg hover:-translate-y-[2px]
                    transition-all duration-300 shadow-brand-500/30"
            >
              yalla nbadel
            </button>
            <a
              href={getContactOwnerMailto()}
              className="inline-flex items-center justify-center gap-2
                    bg-white/10 border border-white/20
                    text-white px-6 sm:px-8 py-3 rounded-xl font-semibold
                    hover:bg-white/20 hover:shadow-lg hover:-translate-y-[2px]
                    transition-all duration-300"
            >
              <MdEmail className="text-xl" />
              Contact Owner
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
