"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://senior-backend-e4gw.onrender.com";

export default function VerifyEmailPage() {
  const params = useParams() as { token?: string };
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = params.token;
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    fetch(`${API_BASE}/api/auth/verify-email/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [params.token]);

  return (
    <div className="relative min-h-screen bg-surface text-slate-50 overflow-hidden px-4 flex items-center justify-center">
      <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.22),transparent_30%),radial-gradient(circle_at_80%_0,rgba(124,58,237,0.2),transparent_28%)]" />
      <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full bg-brand-500/15 blur-3xl" />
      <div className="absolute -top-20 -right-10 w-64 h-64 rounded-full bg-brand-700/20 blur-3xl" />

      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl shadow-[0_25px_70px_-35px_rgba(168,85,247,0.35)] p-8 sm:p-10 text-center space-y-6">
          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 text-brand-400 animate-spin mx-auto" />
              <h1 className="text-2xl font-semibold">Verifying your email…</h1>
              <p className="text-slate-400">Please wait a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-semibold">Email Verified!</h1>
              <p className="text-slate-400">{message}</p>
              <Link
                href="/"
                className="inline-block w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-brand-500 via-brand-400 to-brand-700 text-slate-950 shadow-lg shadow-brand-500/30 hover:translate-y-[-1px] transition-all"
              >
                Go to Homepage
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-20 h-20 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
              <h1 className="text-2xl font-semibold">Verification Failed</h1>
              <p className="text-slate-400">{message}</p>
              <p className="text-sm text-slate-500">
                The link may have expired (valid for 24 hours). Register again to get a new link.
              </p>
              <Link
                href="/login"
                className="inline-block w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-brand-500 via-brand-400 to-brand-700 text-slate-950 shadow-lg shadow-brand-500/30 hover:translate-y-[-1px] transition-all"
              >
                Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
