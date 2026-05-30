// components/ProductsPage.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import ProductCard, { ProductCardSkeleton } from "@/components/ProductCard";
import SectionBackground from "@/components/SectionBackground";

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

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";

const PAGE_SIZE = 12;
const ALL_CATEGORIES = ["All", "Electronics", "Clothing", "Books", "Toys", "Home", "Automobiles", "Other"];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const fetchProducts = useCallback(async (cat: string, pageNum: number, append: boolean) => {
    if (append) setIsLoadingMore(true);
    else setIsLoading(true);

    try {
      const params: Record<string, string> = { page: String(pageNum), limit: String(PAGE_SIZE) };
      if (cat !== "All") params.category = cat;

      const res = await axios.get<{ products: Product[]; total: number; page: number; totalPages: number }>(
        `${API_BASE}/api/products/`,
        { params }
      );

      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setPage(res.data.page);
      setProducts((prev) => append ? [...prev, ...res.data.products] : res.data.products);
    } catch (err: any) {
      console.error("Error fetching products:", err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setProducts([]);
    fetchProducts(selectedCategory, 1, false);
  }, [selectedCategory, fetchProducts]);

  const handleLoadMore = () => fetchProducts(selectedCategory, page + 1, true);

  const visibleProducts = products;

  // 8. Show a loading state with premium skeleton cards
  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-surface flex flex-col overflow-hidden">
        {/* Unified background style with particles */}
        <SectionBackground prefersReducedMotion={prefersReducedMotion} />
        
        <div className="relative z-10 container mx-auto px-4 pt-20 pb-14">
          {/* Header skeleton */}
          <div className="text-center space-y-3 mb-10">
            <p className="text-sm uppercase tracking-[0.35em] text-brand-200/80">
              Marketplace
            </p>
            <h1 className="text-4xl font-bold text-white">Products</h1>
            <p className="text-lg font-semibold text-slate-200/85">
              Loading products...
            </p>
          </div>

          {/* Category filter skeleton */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {["All", "Loading", "Categories"].map((_, idx) => (
              <div
                key={idx}
                className="h-10 w-24 rounded-full bg-white/5 border border-white/10 animate-pulse"
              />
            ))}
          </div>

          {/* Skeleton grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 10 }).map((_, idx) => (
              <ProductCardSkeleton key={`skeleton-${idx}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-surface pt-20 pb-14 overflow-x-hidden">
      {/* Unified background style with particles */}
      <SectionBackground prefersReducedMotion={prefersReducedMotion} />
      
      <div className="relative container mx-auto px-4">
        {/* Page Title */}
        <div className="text-center space-y-3 mb-8 sm:mb-10">
          <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-brand-200/80">
            Marketplace
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Products</h1>
          <p className="text-base sm:text-lg font-semibold text-slate-200/85">
            Check out the latest items that you might want to barter with.
          </p>
        </div>

        {/* CATEGORY FILTER BAR */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10">
          {ALL_CATEGORIES.map((cat) => {
            const isActive = cat === selectedCategory;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide
                  transition-all duration-300
                  backdrop-blur-md border
                  ${
                    isActive
                      ? "bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600 text-slate-950 border-brand-500/40 shadow-lg shadow-brand-500/30 scale-105"
                      : "bg-white/5 text-slate-100 border-white/10 hover:bg-white/10 hover:text-white hover:border-brand-500/40 hover:shadow-md hover:shadow-brand-500/25 hover:scale-105"
                  }
                `}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* PRODUCTS GRID - Using Premium ProductCard */}
        {visibleProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-slate-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
                  />
                </svg>
              </div>
              <p className="text-slate-300 text-lg">No items found.</p>
              <p className="text-slate-400 text-sm">Try selecting a different category.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {visibleProducts.map((product) => (
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
                showDescription={false}
                price={product.price}
              />
            ))}
          </div>
        )}

        {/* LOAD MORE BUTTON */}
        {page < totalPages && (
          <div className="flex justify-center mt-12">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="
                inline-flex
                items-center
                gap-2
                bg-gradient-to-r
                from-brand-500
                via-brand-400
                to-brand-600
                text-slate-950
                font-semibold
                py-3
                px-8
                rounded-full
                shadow-lg
                shadow-brand-500/30
                hover:-translate-y-0.5
                hover:shadow-brand-500/35
                transition-all
                duration-300
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >
              {isLoadingMore ? "Loading..." : "Load More"}
              {!isLoadingMore && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Products count indicator */}
        <div className="flex justify-center mt-6">
          <p className="text-sm text-slate-400">
            Showing {products.length} of {total} products
          </p>
        </div>
      </div>
    </div>
  );
}
