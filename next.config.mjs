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
  }
};

export default nextConfig;
