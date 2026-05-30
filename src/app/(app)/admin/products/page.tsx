"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

type Product = {
  _id: string;
  title: string;
  category: string;
  owner: {
    username: string;
  };
};
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (productId: string) => {
    try {
      const token = Cookies.get("token");
      await axios.delete(`${API_BASE}/api/admin/product/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts(products.filter((product) => product._id !== productId)); // Update the state to remove the deleted product
      alert("Product deleted successfully!");
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product.");
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = Cookies.get("token");
        const res = await axios.get(`${API_BASE}/api/admin/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(res.data?.products ?? res.data ?? []);
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(err.response?.data?.message || "Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  return (
    <div className="bg-surface p-6 shadow-2xl min-h-screen backdrop-blur-xl">
      {/* Go Back Button */}
      <button
        onClick={() => window.history.back()}
        className="mb-6 inline-flex items-center gap-2 text-brand-200 hover:text-brand-100 font-semibold text-sm transition-all duration-300 ease-out"
      >
        - Go Back
      </button>

      {/* Title */}
      <h2 className="text-3xl font-bold text-brand-500 mb-8 drop-shadow-sm">
        Products
      </h2>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
          <p className="font-semibold">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-sm px-3 py-1 bg-red-500/30 hover:bg-red-500/40 rounded transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <div className="text-center py-12 text-slate-300">
          <p>Loading products...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && products.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p>No products found</p>
        </div>
      )}

      {/* Table Wrapper */}
      {!isLoading && products.length > 0 && (
      <div className="overflow-x-auto rounded-xl shadow-lg bg-white/5 backdrop-blur-md border border-white/10">
        <table className="min-w-full text-left text-slate-100 text-sm">
          <thead className="bg-white/10 border-b border-white/10">
            <tr>
              <th className="px-6 py-3 uppercase text-xs font-semibold tracking-wide text-brand-200">
                Title
              </th>
              <th className="px-6 py-3 uppercase text-xs font-semibold tracking-wide text-brand-200">
                Category
              </th>
              <th className="px-6 py-3 uppercase text-xs font-semibold tracking-wide text-brand-200">
                Owner
              </th>
              <th className="px-6 py-3 uppercase text-xs font-semibold tracking-wide text-brand-200">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {products.map((product: Product, idx: number) => (
              <tr
                key={product._id}
                className={`
              border-t border-white/10 transition
              ${idx % 2 === 0 ? "bg-white/5" : "bg-white/0"}
              hover:bg-white/10
            `}
              >
                <td className="px-6 py-4 text-white">{product.title}</td>
                <td className="px-6 py-4 text-brand-200">
                  {product.category}
                </td>
                <td className="px-6 py-4 text-brand-200">
                  {product.owner?.username || "N/A"}
                </td>

                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="
                  bg-red-600/80 hover:bg-red-500 
                  text-white text-sm px-4 py-1.5 rounded-lg 
                  transition shadow-md hover:shadow-red-900/40
                "
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
    </div>
  );
}
