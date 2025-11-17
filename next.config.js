/** @type {import('next').NextConfig} */
const getHost = (v) => {
  try { return new URL(v).hostname } catch { return null }
}
const envHosts = [process.env.WOOCOMMERCE_URL, process.env.NEXT_PUBLIC_WOOCOMMERCE_URL].map(getHost).filter(Boolean)
const extraDomains = (process.env.IMAGE_ALLOWED_DOMAINS || '').split(',').map(s => s.trim()).filter(Boolean)
const imageDomains = Array.from(new Set(['pixypic.net', 'www.pixypic.net', 'image.nv315.top', ...envHosts, ...extraDomains]))

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
    domains: imageDomains,
  },
}
const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' })
module.exports = withBundleAnalyzer(nextConfig)
