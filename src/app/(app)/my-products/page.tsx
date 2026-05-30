"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import ProductCard, { ProductCardSkeleton } from "@/components/ProductCard";

interface Product {
  _id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  owner: {
    _id: string;
    username: string;
  };
  isAvailable: boolean;
  createdAt: string;
  price?: number;
}

type DecodedToken = {
  id: string;
  exp: number;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";

const MyProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllProductsAndFilter = async () => {
      try {
        setLoading(true);
        setError(null);

        // --- Get the username from the cookie ---
        const loggedInUsername = Cookies.get("username");

        if (!loggedInUsername) {
          console.warn("User not logged in or username cookie not found.");
          setError("Please log in to view your products.");
          setProducts([]);
          setLoading(false);
          return;
        }
        console.log("Logged-in username from cookie:", loggedInUsername);

        const token = Cookies.get("token");
        const res = await axios.get(`${API_BASE}/api/products/my-products`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userProducts: Product[] = Array.isArray(res.data) ? res.data : [];

        setProducts(userProducts);
      } catch (err: any) {
        console.error("Error fetching all products for filtering:", err);
        setError("Failed to load products.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProductsAndFilter();
  }, []);

  // Get current user ID from JWT token
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setCurrentUserId(decoded.id);
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
  }, []);

  // Loading state with premium skeleton cards
  if (loading) {
    return (
      <div className="relative min-h-screen bg-surface text-slate-100 px-4 sm:px-6 pt-20 sm:pt-24 pb-8 sm:pb-12 overflow-hidden">
        {/* Subtle background gradients */}
        <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.15),transparent_30%),radial-gradient(circle_at_80%_0,rgba(124,58,237,0.15),transparent_28%),radial-gradient(circle_at_60%_80%,rgba(255,255,255,0.04),transparent_32%)]" />
        
        {/* Decorative blur orbs */}
        <div className="absolute -bottom-32 -right-24 w-80 h-80 bg-brand-500/10 blur-3xl rounded-full" />
        <div className="absolute -top-24 -left-16 w-64 h-64 bg-brand-700/10 blur-3xl rounded-full" />
        
        <div className="relative">
          <div className="flex flex-col gap-2 mb-8">
            <p className="text-sm uppercase tracking-[0.35em] text-brand-200/80">
              Listings
            </p>
            <h1 className="text-3xl font-bold">My Products</h1>
          </div>

          {/* Skeleton grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <ProductCardSkeleton key={`skeleton-${idx}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-surface text-slate-100 px-4 sm:px-6 pt-20 sm:pt-24 pb-8 sm:pb-12 overflow-hidden">
      {/* Subtle background gradients */}
      <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.12),transparent_30%),radial-gradient(circle_at_80%_0,rgba(124,58,237,0.12),transparent_28%),radial-gradient(circle_at_60%_80%,rgba(255,255,255,0.04),transparent_32%)]" />
      
      {/* Decorative blur orbs */}
      <div className="absolute -bottom-32 -right-24 w-80 h-80 bg-brand-500/10 blur-3xl rounded-full" />
      <div className="absolute -top-24 -left-16 w-64 h-64 bg-brand-700/10 blur-3xl rounded-full" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex flex-col gap-2 mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-brand-200/80">
            Listings
          </p>
          <h1 className="text-3xl font-bold text-white">My Products</h1>
          {!error && products.length > 0 && (
            <p className="text-slate-400 text-sm mt-1">
              You have {products.length} product{products.length !== 1 ? 's' : ''} listed
            </p>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="text-center py-20">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-red-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
              </div>
              <p className="text-red-300 text-lg">{error}</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && products.length === 0 && (
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
              <p className="text-slate-300 text-lg">You haven't added any products yet.</p>
              <a 
                href="/add-product"
                className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add your first product
              </a>
            </div>
          </div>
        )}

        {/* Product Grid - Using Premium ProductCard */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
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
                currentUserId={currentUserId ?? undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProductsPage;
