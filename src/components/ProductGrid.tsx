// components/ProductGrid.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";
import SectionBackground from "./SectionBackground";

interface Product {
  _id: string;
  title: string;
  description?: string;
  images?: string[];
  category?: string;
  owner?: { _id: string; username: string };
  isAvailable?: boolean;
  createdAt?: string;
  price?: number;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";

const ProductGrid = () => {
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE}/api/products/`, {
          timeout: 10000,
          params: { limit: "8" },
        });
        const products = res.data?.products ?? [];
        setUserProducts(products);
      } catch (err: any) {
        console.error("Error fetching products:", err);
        // Set empty products and store error message for logging
        setUserProducts([]);
        setError(err.response?.data?.message || "Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Loading state with premium skeleton cards
  if (isLoading) {
    return (
      <section className="relative bg-surface py-20 px-4 sm:px-6 lg:px-10 overflow-hidden">
        {/* Unified background style with particles */}
        <SectionBackground prefersReducedMotion={prefersReducedMotion} />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header section */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-10">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-brand-200/80">
                Marketplace
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white mt-2">
                Discovering fresh swaps...
              </h2>
            </div>
            <div className="h-10 rounded-full px-4 flex items-center gap-2 bg-white/5 border border-white/10 text-sm text-slate-200">
              <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
              Syncing the latest listings
            </div>
          </div>

          {/* Skeleton grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {Array.from({ length: 8 }).map((_, idx) => (
              <ProductCardSkeleton key={`skeleton-${idx}`} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state - show message but allow browsing
  if (error) {
    return (
      <section className="relative bg-surface py-20 px-4 sm:px-6 lg:px-10 min-h-screen overflow-hidden">
        <SectionBackground prefersReducedMotion={prefersReducedMotion} />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col md:items-center md:justify-between gap-6 mb-12">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-brand-200/80">
                Marketplace
              </p>
              <h2 className="text-4xl sm:text-5xl font-semibold text-white mt-2 leading-tight">
                Swap what you have for what you need
              </h2>
            </div>
          </div>

          {/* Error message */}
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-white/60 mb-4 text-center">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (userProducts.length === 0) {
    return (
      <section className="relative bg-surface py-20 px-4 sm:px-6 lg:px-10 min-h-screen overflow-hidden">
        <SectionBackground prefersReducedMotion={prefersReducedMotion} />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col md:items-center md:justify-between gap-6 mb-12">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-brand-200/80">
                Marketplace
              </p>
              <h2 className="text-4xl sm:text-5xl font-semibold text-white mt-2 leading-tight">
                Swap what you have for what you need
              </h2>
            </div>
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 mb-6 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No items yet</h3>
            <p className="text-white/60 mb-6 text-center">Be the first to list something for swap!</p>
            <Link
              href="/add-product"
              className="px-6 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Add Your First Item
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-surface py-20 px-4 sm:px-6 lg:px-10 min-h-screen overflow-hidden">
      {/* Unified background style with particles */}
      <SectionBackground prefersReducedMotion={prefersReducedMotion} />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-brand-200/80">
              Curated matches
            </p>
            <h2 className="text-4xl sm:text-5xl font-semibold text-white mt-2 leading-tight">
              Swap what you have for what you need
            </h2>
            <p className="mt-3 text-lg text-slate-200/85 max-w-2xl">
              Fresh listings from the yalla nbadel community. Pick a card to view
              details, make an offer, or save it to your wishlist.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-500 shadow-[0_0_0_6px_rgba(168,85,247,0.2)]" />
            <p className="text-sm text-slate-200/90">
              {userProducts.length} active swaps right now
            </p>
          </div>
        </div>

        {/* Products grid using new ProductCard component */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {userProducts.slice(0, 8).map((product) => (
            <ProductCard
              key={`product-${product._id}`}
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

        {/* Browse all CTA */}
        <div className="mt-14 flex justify-center">
          <Link
            href="/products"
            className="
              inline-flex 
              items-center 
              gap-2 
              rounded-full 
              bg-gradient-to-r 
              from-brand-500 
              via-brand-400 
              to-brand-600
              text-slate-950 
              font-semibold 
              px-6 
              py-3
              shadow-lg 
              shadow-brand-500/25
              hover:-translate-y-0.5
              hover:shadow-brand-500/35
              transition-all
              duration-300
            "
          >
            Browse the marketplace
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
