"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { Suspense } from "react";

function CallbackContent() {
  const params = useSearchParams();

  useEffect(() => {
    const token    = params.get("token");
    const username = params.get("username");
    const role     = params.get("role");
    const error    = params.get("error");

    if (error || !token) {
      window.location.href = "/login?error=google_failed";
      return;
    }

    // Store exactly like the login page does
    Cookies.set("token",    token,          { expires: 7 });
    Cookies.set("username", username || "", { expires: 7 });
    Cookies.set("role",     role     || "customer", { expires: 7 });

    // Hard redirect so AuthContext re-reads the cookies
    window.location.href = "/";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white/60 text-sm">Signing you in…</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
