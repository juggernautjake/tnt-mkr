import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/hztcciq26/image/upload/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_API_URL || "http://localhost:1337"}/api/:path*`,
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during build
  },
  compiler: {
    removeConsole: {
      exclude: ["error"], // Keep console.error for critical issues
    },
  },
};

export default nextConfig;