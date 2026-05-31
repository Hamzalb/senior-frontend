"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import Image from "next/image";
import { ArrowRightLeft, CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import { getImageSrc } from "@/lib/getImageSrc";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";

type Product = {
  _id: string;
  title: string;
  images: string[];
};

type Barter = {
  _id: string;
  productOfferedId: Product;
  productRequestedId: Product;
  offeredBy: { _id: string; username: string };
  requestedFrom: { _id: string; username: string };
  status: "pending" | "approved" | "declined";
  createdAt: string;
};

const STATUS_CONFIG = {
  pending:  { icon: Clock,       label: "Pending",  color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  approved: { icon: CheckCircle, label: "Approved", color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20"  },
  declined: { icon: XCircle,     label: "Declined", color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20"      },
};

export default function TradeHistoryPage() {
  const [barters, setBarters] = useState<Barter[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "declined">("all");

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = Cookies.get("token");
        const res = await axios.get(`${API_BASE}/api/barter/my-barters`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBarters(Array.isArray(res.data) ? res.data : res.data.barters ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const visible = filter === "all" ? barters : barters.filter((b) => b.status === filter);

  return (
    <div className="relative min-h-screen bg-surface pt-20 sm:pt-24 pb-12 px-4 sm:px-6 overflow-x-hidden">
      <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.12),transparent_30%),radial-gradient(circle_at_80%_0,rgba(124,58,237,0.12),transparent_28%)]" />
      <div className="absolute -bottom-32 -right-24 w-80 h-80 bg-brand-500/10 blur-3xl rounded-full" />

      <div className="relative max-w-4xl mx-auto">
        <Link href="/dakesh" className="inline-flex items-center gap-2 text-brand-200 hover:text-brand-100 text-sm font-semibold mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to yalla nbadel
        </Link>

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-brand-200/80 mb-1">History</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Trade History</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "approved", "declined"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                  filter === s
                    ? "bg-brand-500 text-white"
                    : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-20">
            <ArrowRightLeft className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-slate-300 text-lg">No trades found.</p>
            <Link href="/products" className="mt-4 inline-flex text-brand-400 hover:text-brand-300 text-sm transition-colors">
              Browse products to start trading →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {visible.map((barter) => {
              const cfg = STATUS_CONFIG[barter.status] ?? STATUS_CONFIG.pending;
              const StatusIcon = cfg.icon;
              return (
                <div key={barter._id} className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Products */}
                  <div className="flex-1 flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* Offered */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 border border-white/10">
                        {barter.productOfferedId?.images?.[0] ? (
                          <Image src={getImageSrc(barter.productOfferedId.images[0])} alt={barter.productOfferedId.title} fill className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-white/20 text-xs">?</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-white/40">Offered</p>
                        <p className="text-sm font-medium text-white truncate">{barter.productOfferedId?.title ?? "—"}</p>
                        <p className="text-xs text-white/40">by @{barter.offeredBy?.username}</p>
                      </div>
                    </div>

                    <ArrowRightLeft className="w-4 h-4 text-brand-400 flex-shrink-0" />

                    {/* Requested */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 border border-white/10">
                        {barter.productRequestedId?.images?.[0] ? (
                          <Image src={getImageSrc(barter.productRequestedId.images[0])} alt={barter.productRequestedId.title} fill className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-white/20 text-xs">?</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-white/40">Requested</p>
                        <p className="text-sm font-medium text-white truncate">{barter.productRequestedId?.title ?? "—"}</p>
                        <p className="text-xs text-white/40">from @{barter.requestedFrom?.username}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status + date */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {cfg.label}
                    </span>
                    <span className="text-xs text-white/30">
                      {new Date(barter.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
