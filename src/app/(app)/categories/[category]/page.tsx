// src/app/(app)/categories/[category]/page.tsx

import { getImageSrc } from "@/lib/getImageSrc";
import ProductCard from "@/components/ProductCard";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";

export default async function CategoryPage({ params }: any) {
  // fetch your products server-side
  const res = await fetch(
    `${API_BASE}/api/products?category=${encodeURIComponent(params.category)}&limit=50`,
    { cache: "no-store" }
  );
  const data = await res.json();
  const products = data?.products ?? [];

  return (
    <div className="relative min-h-screen bg-surface py-14 overflow-x-hidden">
      {/* Subtle background gradients */}
      <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.12),transparent_30%),radial-gradient(circle_at_80%_0,rgba(124,58,237,0.12),transparent_28%),radial-gradient(circle_at_60%_80%,rgba(255,255,255,0.04),transparent_32%)]" />
      
      {/* Decorative blur orbs */}
      <div className="absolute -bottom-32 -right-24 w-80 h-80 bg-brand-500/10 blur-3xl rounded-full" />
      <div className="absolute -top-24 -left-16 w-64 h-64 bg-brand-700/10 blur-3xl rounded-full" />
      
      <div className="relative container mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.35em] text-brand-200/80 mb-2">
            Category
          </p>
          <h1 className="text-4xl font-bold text-white capitalize">
            {params.category}
          </h1>
          {products.length > 0 && (
            <p className="text-slate-400 text-sm mt-2">
              {products.length} product{products.length !== 1 ? 's' : ''} available for swap
            </p>
          )}
        </div>

        {/* Empty state */}
        {products.length === 0 ? (
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
              <p className="text-slate-300 text-lg">No products found in this category.</p>
              <a 
                href="/categories"
                className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Browse all categories
              </a>
            </div>
          </div>
        ) : (
          /* Product Grid - Using Premium ProductCard */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
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
                showDescription={true}
                price={product.price}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
