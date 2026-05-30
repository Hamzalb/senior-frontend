// frontend/app/products/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { getImageSrc } from "@/lib/getImageSrc";
import { MdEmail } from "react-icons/md";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get<Product>(`${API_BASE}/api/products/${productId}`);
        setProduct(res.data);
        setActiveIndex(0);
      } catch {
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleDakesh = () => {
    if (product) router.push(`/dakesh?productIdToBarterFor=${product._id}`);
  };

  const getContactOwnerMailto = () => {
    if (!product) return "#";
    const subject = encodeURIComponent(`Item Swap Request: ${product.title}`);
    const body = encodeURIComponent(
      `Hi ${product.owner?.username || "there"},\n\nI'm interested in swapping for your item "${product.title}".\n\nBest regards`
    );
    return `mailto:${product.owner?.email || ""}?subject=${subject}&body=${body}`;
  };

  if (loading) return (
    <div className="min-h-screen bg-surface px-4 pt-20 flex items-center justify-center">
      <p className="text-white/60">Loading product...</p>
    </div>
  );
  if (error) return (
    <div className="min-h-screen bg-surface px-4 pt-20 flex items-center justify-center">
      <p className="text-red-400">{error}</p>
    </div>
  );
  if (!product) return (
    <div className="min-h-screen bg-surface px-4 pt-20 flex items-center justify-center">
      <p className="text-white/60">Product not found.</p>
    </div>
  );

  const images = product.images?.length ? product.images : [];
  const hasMultiple = images.length > 1;

  return (
    <div className="min-h-screen bg-surface px-4 pt-20 sm:pt-24 pb-8 sm:pb-14 flex items-center justify-center">
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center max-w-5xl w-full bg-white/5 backdrop-blur-md rounded-2xl p-5 sm:p-8 border border-white/10 shadow-xl">

        {/* IMAGE SECTION */}
        <div className="w-full md:w-2/5 flex flex-col gap-3">
          {/* Main Image */}
          <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-lg bg-black/10 border border-white/10 hover:shadow-brand-500/30 transition-all duration-300 group">
            {images.length ? (
              <Image
                src={getImageSrc(images[activeIndex])}
                alt={product.title}
                fill
                className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-white/5 text-white/40 text-sm">
                No Image
              </div>
            )}

            {/* Prev/Next arrows */}
            {hasMultiple && (
              <>
                <button
                  onClick={() => setActiveIndex((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveIndex((i) => (i + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                {/* Dot indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === activeIndex ? "bg-white scale-125" : "bg-white/40"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {hasMultiple && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    i === activeIndex ? "border-brand-500 shadow-lg shadow-brand-500/30" : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <Image src={getImageSrc(img)} alt={`Thumbnail ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DETAILS SECTION */}
        <div className="w-full md:flex-1 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white drop-shadow-md leading-tight">
              {product.title}
            </h1>
            {!product.isAvailable && (
              <span className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-300 border border-red-500/20">
                Unavailable
              </span>
            )}
          </div>

          <p className="text-sm text-brand-300 font-medium">
            By <span className="text-white">{product.owner?.username || "Unknown"}</span>
          </p>

          <span className="self-start text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
            {product.category}
          </span>

          <p className="text-white/70 text-base leading-relaxed">{product.description}</p>

          {hasMultiple && (
            <p className="text-xs text-white/40">{images.length} photos</p>
          )}

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDakesh}
              disabled={!product.isAvailable}
              className="inline-flex items-center justify-center bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold hover:opacity-90 hover:shadow-lg hover:-translate-y-[2px] transition-all duration-300 shadow-brand-500/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              yalla nbadel
            </button>
            <a
              href={getContactOwnerMailto()}
              className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold hover:bg-white/20 hover:shadow-lg hover:-translate-y-[2px] transition-all duration-300"
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
