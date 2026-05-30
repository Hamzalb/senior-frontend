"use client";
import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#1e1b4b",
          color: "#fff",
          border: "1px solid rgba(168,85,247,0.3)",
          borderRadius: "12px",
          fontSize: "14px",
        },
        success: { iconTheme: { primary: "#a855f7", secondary: "#fff" } },
        error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
      }}
    />
  );
}
