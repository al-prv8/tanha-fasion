import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    // Serve modern formats for maximum compression
    formats: ["image/avif", "image/webp"],
    // Allow images from our backend server and production domain
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "tanhafashion.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "tanhafashion.com",
        pathname: "/assets/**",
      },
      {
        protocol: "https",
        hostname: "media.tanhafashion.com",
        pathname: "/**",
      },
    ],
    // Responsive breakpoints for srcset generation
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
