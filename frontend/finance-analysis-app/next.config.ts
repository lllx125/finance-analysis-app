import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',      // Build static HTML files so we can host on S3 + CloudFront
  trailingSlash: true,   // <- makes /data/index.html instead of data.html
  images: { unoptimized: true }, // Disable built-in image optimizer (needs a server)
};

export default nextConfig;
