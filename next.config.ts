import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PATCH, DELETE" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, x-api-key, x-provider" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ],
      },
    ]
  },
}

export default nextConfig
