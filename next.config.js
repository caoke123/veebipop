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
  // 优化实验性功能
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@tanstack/react-query', 'swiper'],
    // 关键：强制把 sharp 打进去
    outputFileTracingIncludes: {
      '/**/*': ['node_modules/sharp/**/*'],  // 这行治愈一切
    },
  },
  // 优化图片配置
  images: {
    unoptimized: true, // 在 standalone 模式下禁用图片优化以避免 Sharp 依赖问题
    formats: ['image/webp', 'image/avif'], // 添加 AVIF 支持
    domains: imageDomains,
    // 图片优化配置
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 图片质量优化
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30天缓存
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // 启用图片压缩
    loader: 'default',
  },
  // 启用压缩
  compress: true,
  // 优化构建
  swcMinify: true,
  // 启用静态优化
  poweredByHeader: false,
  // 生成源码映射
  productionBrowserSourceMaps: false,
  // 优化输出
  output: 'standalone',
}
const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' })
module.exports = withBundleAnalyzer(nextConfig)
