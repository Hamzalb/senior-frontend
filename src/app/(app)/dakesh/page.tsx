// pages/dakesh.tsx
"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import { getImageSrc } from "@/lib/getImageSrc";
import { motion } from "framer-motion";
import { CheckCircle, MessageCircle, Home, ArrowLeft } from "lucide-react";

type Product = {
  _id: string;
  title: string;
  description: string;
  images?: string[];
  category: string;
  price?: number;
  owner: {
    _id: string;
    username: string;
  };
  isAvailable: boolean;
  createdAt: string;
};

type BarterData = {
  _id: string;
  productOfferedId: Product;
  productRequestedId: Product;
  offeredBy: { _id: string; username: string };
  requestedFrom: { _id: string; username: string };
  offeredProductPrice?: number;
  requestedProductPrice?: number;
  status: string;
};

const getLoggedInUsername = () => Cookies.get("username");

function DakeshContent() {
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";
  const router = useRouter();
  const searchParams = useSearchParams();
  const productIdToBarterFor = searchParams.get("productIdToBarterFor");

  // 1. State for the target product (the one we want to barter for)
  const [targetProduct, setTargetProduct] = useState<Product | null>(null);

  // 2. State for "myProducts" that match that category
  const [myProducts, setMyProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedProductToOffer, setSelectedProductToOffer] = useState<
    string | null
  >(null);
  const [barterInitiated, setBarterInitiated] = useState(false);
  const [barterData, setBarterData] = useState<BarterData | null>(null);
  
  // Price inputs for barter
  const [offeredProductPrice, setOfferedProductPrice] = useState<string>("");
  const [requestedProductPrice, setRequestedProductPrice] = useState<string>("");

  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
  }, []);

  const handleGoHome = () => {
    router.push("/");
  };

  const handleGoToMessages = () => {
    if (barterData?.requestedFrom) {
      router.push(`/messages?userId=${barterData.requestedFrom._id}`);
    } else {
      router.push("/messages");
    }
  };

  // Handle contacting the product owner
  const handleContactOwner = async () => {
    if (!mountedRef.current) return;

    if (!targetProduct?.owner?._id) {
      if (mountedRef.current) {
        setError("Unable to identify product owner.");
      }
      return;
    }

    const token = Cookies.get("token");
    if (!token) {
      if (mountedRef.current) {
        setError("Authentication token missing. Please log in again.");
      }
      return;
    }

    try {
      if (!mountedRef.current) return;

      setLoading(true);
      
      // Navigate to messages with the owner's userId
      router.push(`/messages?userId=${targetProduct.owner._id}`);
    } catch (err: any) {
      console.error("Error navigating to messages:", err);
      if (mountedRef.current) {
        setError("Failed to open chat. Please try again.");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  //
  // --- STEP A: Fetch the target product first (to learn its category) ---
  //
  useEffect(() => {
    if (!mountedRef.current) return;

    if (!productIdToBarterFor) {
      if (mountedRef.current) {
        setError("No target product specified for barter.");
        setLoading(false);
      }
      return;
    }

    const fetchTargetProduct = async () => {
      try {
        if (!mountedRef.current) return;
        
        setLoading(true);
        const res = await axios.get<Product>(
          `${API_BASE}/api/products/${productIdToBarterFor}`
        );
        if (mountedRef.current) {
          setTargetProduct(res.data);
        }
      } catch (err: any) {
        console.error("Error fetching target product:", err);
        if (mountedRef.current) {
          setError("Failed to load the product you want to barter for.");
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchTargetProduct();
  }, [productIdToBarterFor]);

  //
  // --- STEP B: Once targetProduct is known, fetch "my products" and filter to same category ---
  //
  useEffect(() => {
    if (!mountedRef.current) return;
    if (!targetProduct) return;

    const loggedInUsername = getLoggedInUsername();
    if (!loggedInUsername) {
      if (mountedRef.current) {
        setError("Please log in to initiate a barter.");
      }
      return;
    }

    const fetchAndFilterMyProducts = async () => {
      try {
        if (!mountedRef.current) return;

        setLoading(true);
        setError(null);

        const res = await axios.get<Product[]>(`${API_BASE}/api/products/my-products`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });
        const allProducts: Product[] = Array.isArray(res.data) ? res.data : [];

        // Keep only products in the same category as the target
        const sameCategory: Product[] = allProducts.filter(
          (p) =>
            p.category === targetProduct.category && p._id !== targetProduct._id
        );

        if (mountedRef.current) {
          setMyProducts(sameCategory);
        }
      } catch (err: any) {
        console.error("Error fetching/filtering my products:", err);
        if (mountedRef.current) {
          setError("Failed to load your products to offer.");
          setMyProducts([]);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchAndFilterMyProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetProduct]);

  //
  // --- SELECTION HANDLER ---
  //
  const handleProductSelect = (productId: string) => {
    setSelectedProductToOffer((prev) =>
      prev === productId ? null : productId
    );
  };

  //
  // --- INITIATE BARTER ---
  //
  const handleInitiateBarter = async () => {
    if (!mountedRef.current) return;

    if (!productIdToBarterFor) {
      if (mountedRef.current) {
        setError("Target product ID for barter is missing from the URL.");
      }
      return;
    }
    if (!selectedProductToOffer) {
      if (mountedRef.current) {
        setError("Please select one of your products to offer for barter.");
      }
      return;
    }

    const token = Cookies.get("token");
    if (!token) {
      if (mountedRef.current) {
        setError("Authentication token missing. Please log in again.");
      }
      return;
    }

    try {
      if (!mountedRef.current) return;

      setLoading(true);
      setError(null);

      const res = await axios.post(
        `${API_BASE}/api/barter/initiate`,
        {
          productIdToBarterFor,
          productOfferedId: selectedProductToOffer,
          offeredProductPrice: offeredProductPrice ? parseFloat(offeredProductPrice) : 0,
          requestedProductPrice: requestedProductPrice ? parseFloat(requestedProductPrice) : 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Success - show success message with barter data
      if (mountedRef.current) {
        if (res.data?.barter) {
          setBarterData(res.data.barter);
          setBarterInitiated(true);
          setSelectedProductToOffer(null);
        } else {
          // Still consider it success if barterId exists
          setBarterInitiated(true);
          setSelectedProductToOffer(null);
        }
      }
    } catch (err: any) {
      console.error("Error initiating barter:", err);
      if (mountedRef.current) {
        setError(
          err.response?.data?.message || "Failed to initiate barter request."
        );
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Replacement Request</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        {/* Target Product Info */}
        {targetProduct && !barterInitiated && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10"
          >
            <p className="text-brand-200 text-sm mb-2">You want to request:</p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                {(targetProduct.images?.length ?? 0) > 0 ? (
                  <img
                    src={getImageSrc(targetProduct.images?.[0] || "")}
                    alt={targetProduct.title}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-white/5 flex items-center justify-center text-white/30 text-xs flex-shrink-0">
                    No image
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold truncate">{targetProduct.title}</h2>
                  <p className="text-brand-200 text-sm">
                    Category: {targetProduct.category} · Owner: {targetProduct.owner.username}
                  </p>
                </div>
              </div>
              {/* Contact Owner Button */}
              <button
                onClick={handleContactOwner}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-600/30 hover:bg-brand-600/50 border border-brand-400/30 rounded-xl text-brand-200 hover:text-white transition-all text-sm font-medium flex-shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                Contact Owner
              </button>
            </div>
          </motion.div>
        )}

        {/* Price Input Section */}
        {targetProduct && selectedProductToOffer && !barterInitiated && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10"
          >
            <h3 className="text-lg font-semibold text-brand-200 mb-4">Approximate Prices (Optional)</h3>
            <p className="text-brand-200/70 text-sm mb-4">
              Enter approximate prices for both products to help with the trade evaluation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-brand-200 mb-2">
                  Your Product Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={offeredProductPrice}
                  onChange={(e) => setOfferedProductPrice(e.target.value)}
                  placeholder="Enter price"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
                />
              </div>
              <div>
                <label className="block text-sm text-brand-200 mb-2">
                  Requested Product Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={requestedProductPrice}
                  onChange={(e) => setRequestedProductPrice(e.target.value)}
                  placeholder="Enter price"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Success Message */}
        {barterInitiated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-2xl border border-green-400/40 bg-green-900/20 text-green-200 shadow-xl text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Request Sent Successfully!</h3>
            <p className="mb-4 text-green-200/80">
              The product owner has been notified about your replacement request.
              They can now accept, decline, or message you about the proposal.
            </p>

            {barterData && (
              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                <p className="text-sm text-brand-200 mb-2">Request Details:</p>
                <p className="text-white">
                  Your <span className="font-semibold">{barterData.productOfferedId?.title || "product"}</span> for{" "}
                  <span className="font-semibold">{barterData.productRequestedId?.title || "their product"}</span>
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGoToMessages}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-all duration-300 ease-out font-semibold"
              >
                <MessageCircle className="w-5 h-5" />
                Message the Owner
              </button>

              <button
                onClick={handleGoHome}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 ease-out font-semibold"
              >
                <Home className="w-5 h-5" />
                Go to Homepage
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading / Error */}
        {loading && !barterInitiated && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-400"></div>
            <p className="ml-4 text-brand-200">Loading...</p>
          </div>
        )}
        
        {error && !barterInitiated && (
          <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200">
            {error}
          </div>
        )}

        {/* No products in same category */}
        {!loading && !error && targetProduct && myProducts.length === 0 && !barterInitiated && (
          <div className="p-6 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-200">
            <p className="font-medium mb-2">No matching products</p>
            <p>
              You have no products in the{" "}
              <span className="font-semibold text-white">{targetProduct.category}</span>{" "}
              category to offer for exchange.
            </p>
            <Link
              href="/add-product"
              className="inline-block mt-4 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg transition-all duration-300 ease-out"
            >
              Add a Product
            </Link>
          </div>
        )}

        {/* Product Selection */}
        {!loading && !error && myProducts.length > 0 && !barterInitiated && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-brand-200 mb-4">
              Select a product to offer (Category:{" "}
              <span className="text-white">{targetProduct?.category}</span>)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProducts.map((product) => {
                const selected = selectedProductToOffer === product._id;

                return (
                  <motion.div
                    key={product._id}
                    whileHover={{ y: -4 }}
                    onClick={() => handleProductSelect(product._id)}
                    className={`
                      cursor-pointer rounded-2xl transition-all duration-300 p-4 border
                      ${
                        selected
                          ? "bg-brand-500/20 border-brand-400 shadow-lg shadow-brand-500/20"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }
                    `}
                  >
                    {/* Image */}
                    <div className="relative w-full h-40 mb-3 rounded-xl overflow-hidden bg-white/5">
                      {(product.images?.length ?? 0) > 0 ? (
                        <img
                          src={getImageSrc(product.images?.[0] || "")}
                          alt={product.title}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-white/30">
                          No image
                        </div>
                      )}
                      {selected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg font-bold text-white mb-1">
                      {product.title}
                    </h3>
                    <p className="text-brand-200 text-sm line-clamp-2">
                      {product.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Submit Button */}
        {!loading && !error && myProducts.length > 0 && !barterInitiated && (
          <motion.button
            whileHover={{ scale: selectedProductToOffer ? 1.02 : 1 }}
            whileTap={{ scale: selectedProductToOffer ? 0.98 : 1 }}
            onClick={handleInitiateBarter}
            disabled={!selectedProductToOffer || loading}
            className={`
              mt-8 w-full sm:w-auto py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300
              ${
                !selectedProductToOffer || loading
                  ? "bg-slate-500/50 cursor-not-allowed text-slate-400"
                  : "bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-lg hover:shadow-brand-500/25"
              }
            `}
          >
            {loading ? "Sending Request..." : "Send Replacement Request"}
          </motion.button>
        )}
      </div>
    </div>
  );
}

export default function DakeshPage() {
  return (
    <Suspense fallback={<div className="text-white min-h-screen bg-surface px-4 py-12 flex items-center justify-center">Loading...</div>}>
      <DakeshContent />
    </Suspense>
  );
}
