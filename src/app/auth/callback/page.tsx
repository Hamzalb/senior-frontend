"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { useAuth } from "@/contexts/AuthContext";
import { Suspense } from "react";

function CallbackContent() {
  const router     = useRouter();
  const params     = useSearchParams();
  const { login }  = useAuth();

  useEffect(() => {
    const token    = params.get("token");
    const username = params.get("username");
    const role     = params.get("role");
    const error    = params.get("error");

    if (error || !token) {
      router.replace("/login?error=google_failed");
      return;
    }

    // Store auth data exactly like the login page does
    login(token);
    if (username) Cookies.set("username", username, { expires: 7 });
    if (role)     Cookies.set("role",     role,     { expires: 7 });

    router.replace("/");
  }, [params, login, router]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white/60 text-sm">Signing you in with Google…</p>
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
