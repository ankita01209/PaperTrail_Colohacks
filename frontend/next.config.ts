import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ── Performance ────────────────────────────────────────────── */
  reactStrictMode: false, // Avoid double-renders in dev mode
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "firebase/app",
      "firebase/auth",
      "@hookform/resolvers",
    ],
  },
};

export default nextConfig;
