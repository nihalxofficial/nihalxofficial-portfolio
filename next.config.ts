import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Slim, self-contained production server for the Docker image.
  output: "standalone",
  poweredByHeader: false,
  images: {
    // ImgBB is the media host for every uploaded image.
    remotePatterns: [
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "images.ibb.co" },
      { protocol: "https", hostname: "*.ibb.co" },
    ],
  },
};

export default nextConfig;
