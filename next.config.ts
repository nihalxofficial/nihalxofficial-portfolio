import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Slim, self-contained production server for the Docker image.
  output: "standalone",
  poweredByHeader: false,
};

export default nextConfig;
