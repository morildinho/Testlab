import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "highlights.nowla.org",
          },
        ],
        destination: "/lab/now2025/:path*",
      },
    ];
  },
};

export default nextConfig;
