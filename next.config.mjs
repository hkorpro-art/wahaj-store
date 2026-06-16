/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io"
      }
    ],
    formats: ["image/avif", "image/webp"]
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts"]
  },
  allowedDevOrigins: ["172.27.210.125", "*.local"],
  async headers() {
    return [
      {
        source: "/sitemap.xml",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=43200" }
        ]
      },
      {
        source: "/robots.txt",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=43200" }
        ]
      }
    ];
  }
};

export default nextConfig;
