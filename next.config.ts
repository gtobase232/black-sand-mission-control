import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/black-sand-mission-control",
  images: { unoptimized: true },
};

export default nextConfig;
