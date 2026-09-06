import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // the PDF engine ships its own node deps (fontkit, yoga) — keep it external
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
