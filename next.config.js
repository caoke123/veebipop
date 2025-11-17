/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Simplify experimental options
  experimental: {
    optimizeCss: true,
  },
  // Simplify image configuration
  images: {
    unoptimized: false,
    formats: ['image/webp'],
    domains: ['pixypic.net', 'www.pixypic.net', 'image.nv315.top'],
  },
}
const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' })
module.exports = withBundleAnalyzer(nextConfig)
