/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add experimental options to handle potential issues
  experimental: {
    // Disable server components externalization to prevent potential issues
    serverComponentsExternalPackages: [],
    // Try to optimize build process
    optimizeCss: true,
    optimizePackageImports: ['@phosphor-icons/react'],
  },
  // Simplify image configuration to avoid potential issues
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    // Use domains instead of remotePatterns to avoid potential micromatch issues
    domains: ['pixypic.net', 'www.pixypic.net', 'image.nv315.top', 'localhost', '127.0.0.1'],
    minimumCacheTTL: 60,
  },
}
const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' })
module.exports = withBundleAnalyzer(nextConfig)
