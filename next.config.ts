import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  turbopack: {},
  experimental: {
    // only import the icons/components actually used — biggest speed win
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@radix-ui/react-slot",
      "react-icons",
    ],
  },
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      { protocol: "https", hostname: "i.pinimg.com" },
      { protocol: "https", hostname: "www.pinterest.com" },
      { protocol: "https", hostname: "dakesh-backend.onrender.com" },
      { protocol: "https", hostname: "ujrfdfzipgxnivlyjjso.supabase.co" },
      { protocol: "https", hostname: "hxrhbfrjlhgpimrngalp.supabase.co" },
      { protocol: "http", hostname: "localhost", port: "5001", pathname: "/uploads/**" },
      { protocol: "http", hostname: "10.*" },
      { protocol: "http", hostname: "192.168.*" },
    ],
  },
};

export default nextConfig;
