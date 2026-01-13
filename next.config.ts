import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/",
        has: [{ type: "host", value: "highlights.nowla.org" }],
        destination: "/lab/now2025",
      },
      {
        source: "/:album",
        has: [{ type: "host", value: "highlights.nowla.org" }],
        destination: "/lab/now2025/:album",
      },
      {
        source: "/upload",
        has: [{ type: "host", value: "highlights.nowla.org" }],
        destination: "/lab/now2025/upload",
      },
    ];
  },
};

export default nextConfig;
