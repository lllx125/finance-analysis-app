import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',      // Build static HTML files so we can host on S3 + CloudFront
  images: { unoptimized: true }, // Disable built-in image optimizer (needs a server)
};

export default nextConfig;
