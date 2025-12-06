/** @type {import('next').NextConfig} */

const getHost = (v) => {
  try { return new URL(v).hostname } catch { return null }
}

const envHosts = [process.env.WOOCOMMERCE_URL, process.env.NEXT_PUBLIC_WOOCOMMERCE_URL]
  .map(getHost)
  .filter(Boolean)

const extraDomains = (process.env.IMAGE_ALLOWED_DOMAINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

// 只留你的 3 个真实域名 + 环境变量
const allowedHosts = Array.from(new Set([
  'pixypic.net',
  'assets.veebipop.com',
  'assets.veebipop.com',
  'assets.veebipop.com',
  'picsum.photos',
  ...envHosts,
  ...extraDomains
]))

const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },



  images: {
    // 删除 unoptimized: true（你已经删了，完美）
    formats: ['image/avif', 'image/webp'],

    // 关键修改：domains 已废弃 → 改 remotePatterns
    remotePatterns: allowedHosts.map(host => ({
      protocol: 'https',
      hostname: host,
      pathname: '/**',
    })),

    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30天缓存
  },

  compress: true,
  swcMinify: true,
  poweredByHeader: false,
  // output: 'standalone',
  
  // 减少 RSC 请求中断问题
  serverRuntimeConfig: {
    // 增加服务器超时时间
    apiTimeout: 30000,
  },
  
  // 优化 React Server Components
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@tanstack/react-query', 'swiper'],
    // 终极必备：standalone 模式下 Sharp 永不丢
    outputFileTracingIncludes: {
      '/**/*': ['node_modules/sharp/**/*'],
    },
    // 减少 RSC 请求超时问题
    serverComponentsExternalPackages: ['sharp'],
    // 启用 React Server Components 优化
    serverActions: {
      allowedOrigins: ['localhost:3000', 'veebipop.com'],
    },
  },
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)