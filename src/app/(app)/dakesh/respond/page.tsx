"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { getImageSrc } from "@/lib/getImageSrc";

type Product = {
  _id: string;
  title: string;
  images: string[];
  description: string;
};
type User = {
  _id: string;
  username: string;
  email: string;
};
type Barter = {
  _id: string;
  status: string;
  productOfferedId: Product;
  productRequestedId: Product;
  offeredBy: User;
  requestedFrom: User;
};

function RespondBarterContent() {
  const API_BASE = "https://dakesh-backend.onrender.com";
  const router = useRouter();
  const searchParams = useSearchParams();
  const barterId = searchParams.get("barterId");

  const [barter, setBarter] = useState<Barter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [decision, setDecision] = useState<null | "approved" | "declined">(
    null
  );

  useEffect(() => {
    if (!barterId) {
      setError("Missing barter request.");
      setLoading(false);
      return;
    }
    axios
      .get<Barter>(`${API_BASE}/api/barter/${barterId}`, {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      })
      .then((res) => setBarter(res.data))
      .catch(() => setError("Failed to fetch barter."))
      .finally(() => setLoading(false));
  }, [barterId]);

  const handleDecision = async (decisionType: "approved" | "declined") => {
    setLoading(true);

    if (!barterId) {
      console.error("barterId is missing");
      setError("Cannot update: missing barter ID.");
      setLoading(false);
      return;
    }

    // 1) Endpoint must match your Express route exactly:
    const url = `${API_BASE}/api/barter/${barterId}/decision`;
    console.log("PATCHing to:", url);

    // 2) Body must have { decision: "approved" } or { decision: "declined" }
    const payload = { decision: decisionType };
    console.log("Payload:", payload);

    // 3) Include the Bearer token if this route is protected by auth middleware:
    const token = Cookies.get("token");
    console.log("Using token:", token);

    try {
      const response = await axios.patch(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("PATCH response data:", response.data);
      // If the server saved the decision successfully, update UI state:
      setDecision(decisionType);
    } catch (err: any) {
      if (err.response) {
        // The server returned 4xx or 5xx--log status + body for debugging
        console.error("PATCH /barter/:id/decision failed:", {
          status: err.response.status,
          data: err.response.data,
        });
      } else {
        // Network or other error
        console.error("PATCH error:", err.message);
      }
      setError("Failed to update barter status.");
    }

    setLoading(false);
  };

  if (loading)
    return (
      <div className="text-white min-h-screen bg-surface px-4 py-12">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="text-red-500 min-h-screen bg-surface px-4 py-12">
        {error}
      </div>
    );
  if (!barter) return <div>Barter not found.</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md bg-surface-elevated/90 rounded-2xl shadow-2xl p-8 backdrop-blur-md border border-white/10">
        {/* Title */}
        <h1 className="text-3xl font-bold mb-8 text-brand-200 text-center tracking-wide">
          Barter Request
        </h1>

        {/* Your Product */}
        <div className="mb-8 pb-6 border-b border-brand-300/30">
          <h2 className="text-lg font-semibold mb-4 text-brand-100 tracking-wide">
            You own this product:
          </h2>

          <div className="flex items-start gap-4">
            {barter.productRequestedId?.images?.[0] && (
              <img
                src={getImageSrc(barter.productRequestedId.images[0])}
                alt={barter.productRequestedId.title}
                className="w-24 h-24 object-cover rounded-lg border border-brand-400/40 shadow-md shadow-brand-900/30"
              />
            )}

            <div className="flex-1">
              <h3 className="font-semibold text-white text-lg">
                {barter.productRequestedId?.title}
              </h3>
              <p className="text-brand-200/80 text-sm mt-1 leading-relaxed">
                {barter.productRequestedId?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Their Offered Product */}
        <div className="mb-8 pb-6 border-b border-brand-300/30">
          <h2 className="text-lg font-semibold mb-4 text-brand-100 tracking-wide">
            They offer you:
          </h2>

          <div className="flex items-start gap-4">
            {barter.productOfferedId?.images?.[0] && (
              <img
                src={getImageSrc(barter.productOfferedId.images[0])}
                alt={barter.productOfferedId.title}
                className="w-24 h-24 object-cover rounded-lg border border-brand-400/40 shadow-md shadow-brand-900/30"
              />
            )}

            <div className="flex-1">
              <h3 className="font-semibold text-white text-lg">
                {barter.productOfferedId?.title}
              </h3>

              <p className="text-brand-200/80 text-sm mt-1 leading-relaxed">
                {barter.productOfferedId?.description}
              </p>

              <p className="text-xs text-brand-300/70 mt-2">
                Offered by:{" "}
                <span className="font-semibold text-brand-200">
                  {barter.offeredBy?.username}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Decision */}
        {decision ? (
          <div className="mt-6 text-center">
            <span
              className={`inline-block px-5 py-2 rounded-lg text-white font-semibold text-lg shadow-md shadow-brand-900/40
            ${
              decision === "approved"
                ? "bg-green-600/80 border border-green-400/40"
                : "bg-red-600/80 border border-red-400/40"
            }
          `}
            >
              Barter {decision === "approved" ? "Approved" : "Declined"}
            </span>
          </div>
        ) : (
          <div className="flex gap-5 mt-6 justify-center">
            <button
              className="bg-green-600 hover:bg-green-700 transition-all px-6 py-2 rounded-lg text-white font-semibold shadow-md shadow-green-900/40"
              onClick={() => handleDecision("approved")}
            >
              Approve
            </button>

            <button
              className="bg-red-600 hover:bg-red-700 transition-all px-6 py-2 rounded-lg text-white font-semibold shadow-md shadow-red-900/40"
              onClick={() => handleDecision("declined")}
            >
              Decline
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RespondBarterPage() {
  return (
    <Suspense fallback={<div className="text-white min-h-screen bg-surface px-4 py-12 flex items-center justify-center">Loading...</div>}>
      <RespondBarterContent />
    </Suspense>
  );
}
