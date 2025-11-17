# 前端首页性能极致优化方案

## 项目概述

本文档基于对当前前端首页的性能分析，提供了一套详细的性能优化方案。当前首页存在以下主要性能问题：

- LCP（最大内容绘制）时间为1,336ms，其中渲染延迟占703ms（52.6%）
- 最大关键路径延迟高达5,197ms，主要由多个产品API请求串行加载导致
- 首页采用混合渲染策略，但数据获取策略不统一
- 组件渲染策略不一致，部分组件不必要地使用客户端渲染

## 一、首页渲染架构重构方案

### 1.1 实施分层ISR策略

**当前问题**：首页采用混合渲染，但数据获取策略不统一，导致关键路径延迟高达5,197ms。

**优化方案**：

```typescript
// 创建 lib/data.ts - 统一数据获取服务
export async function getHomeProducts() {
  // 使用Promise.allSettled确保健壮性
  const results = await Promise.allSettled([
    // 艺术玩具数据 - 变化频率低，设置1小时缓存
    fetchArtToyHomeProducts(3, { next: { revalidate: 3600, tags: ['art-toys'] } }),
    
    // Labubu数据 - 中等变化频率，设置30分钟缓存
    fetchProductsBySubcategory('labubu', 3, 'home', { next: { revalidate: 1800, tags: ['labubu'] } }),
    
    // 大漫亮数据 - 可能更新频繁，设置15分钟缓存
    fetchProductsBySubcategory('大漫亮', 3, 'home', { next: { revalidate: 900, tags: ['damanliang'] } })
  ]);

  // 安全解构数据，即使部分请求失败也能正常渲染
  const artToys = results[0].status === 'fulfilled' ? results[0].value : [];
  const labubu = results[1].status === 'fulfilled' ? results[1].value : [];
  const damanliang = results[2].status === 'fulfilled' ? results[2].value : [];
  
  // 记录失败请求用于监控
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Home data API ${index} failed:`, result.reason);
      // 可以发送错误到监控系统
    }
  });

  return { artToys, labubu, damanliang };
}
```

### 1.2 重构首页组件为纯服务端组件

**当前问题**：MenFashion和WomenFashion等组件使用'use client'，导致不必要的客户端渲染。

**优化方案**：

```typescript
// 重构后的 app/homepages/fashion11/page.tsx
import { getHomeProducts } from '@/lib/data';
import { ProductGalleryServer } from '@/components/ProductGallery.server';
import { TopNavOne, MenuEleven, SliderEleven, TrendingNowServer } from '@/components';

// 保持静态生成
export const dynamic = 'force-static';

export default async function FashionPage() {
  // 在服务端并行获取所有数据
  const { artToys, labubu, damanliang } = await getHomeProducts();
  
  return (
    <>
      <TopNavOne />
      <MenuEleven />
      <SliderEleven />
      
      {/* 服务端渲染的产品展示区 */}
      <ProductGalleryServer 
        title="艺术玩具" 
        products={artToys}
        category="art-toys"
      />
      
      <ProductGalleryServer 
        title="Labubu系列" 
        products={labubu}
        category="labubu"
      />
      
      <ProductGalleryServer 
        title="大漫亮" 
        products={damanliang}
        category="damanliang"
      />
      
      {/* 轮播组件保持客户端渲染，但数据预加载 */}
      <TrendingNowServer />
    </>
  );
}
```

## 二、组件架构优化方案

### 2.1 创建服务端/客户端组件分离架构

**优化方案**：

```typescript
// components/ProductGallery.server.tsx - 纯服务端组件
import { ProductCard } from './ProductCard.server';
import { ClientCarousel } from './ClientCarousel.client';

interface ProductGalleryServerProps {
  title: string;
  products: ProductType[];
  category: string;
}

export function ProductGalleryServer({ title, products, category }: ProductGalleryServerProps) {
  // 服务端数据处理和过滤
  const featuredProducts = products.slice(0, 8);
  
  return (
    <section className="product-gallery">
      <h2>{title}</h2>
      
      {/* 将交互逻辑委托给最小化的客户端组件 */}
      <ClientCarousel category={category}>
        {featuredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ClientCarousel>
    </section>
  );
}

// components/ProductCard.server.tsx - 纯服务端产品卡片
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: ProductType;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.slug}`} className="product-card">
      <div className="product-image-container">
        <Image
          src={product.image}
          alt={product.name}
          width={300}
          height={300}
          className="product-image"
          // 优化图片加载
          priority={index < 4} // 前4张图片高优先级加载
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,..."
        />
      </div>
      <h3 className="product-name">{product.name}</h3>
      <p className="product-price">{product.price}</p>
    </Link>
  );
}

// components/ClientCarousel.client.tsx - 最小化客户端组件
'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ClientCarouselProps {
  category: string;
  children: React.ReactNode;
}

export function ClientCarousel({ category, children }: ClientCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 最小化的客户端交互逻辑
  const nextSlide = () => setCurrentIndex(prev => prev + 1);
  const prevSlide = () => setCurrentIndex(prev => prev - 1);
  
  return (
    <div className="carousel-container">
      <div className="carousel-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {children}
      </div>
      
      <button onClick={prevSlide} className="carousel-nav prev">
        <ChevronLeft />
      </button>
      <button onClick={nextSlide} className="carousel-nav next">
        <ChevronRight />
      </button>
    </div>
  );
}
```

### 2.2 优化TrendingNow组件

**当前问题**：TrendingNow组件完全客户端渲染，导致LCP延迟。

**优化方案**：

```typescript
// components/TrendingNow.server.tsx
import { getTrendingCategories } from '@/lib/data';
import { TrendingCarouselClient } from './TrendingCarousel.client';

export async function TrendingNowServer() {
  // 服务端获取趋势数据
  const trendingCategories = await getTrendingCategories();
  
  return (
    <section className="trending-now">
      <h2>热门趋势</h2>
      <TrendingCarouselClient categories={trendingCategories} />
    </section>
  );
}

// components/TrendingCarousel.client.tsx
'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';

interface TrendingCarouselClientProps {
  categories: Array<{
    id: string;
    name: string;
    image: string;
    link: string;
  }>;
}

export function TrendingCarouselClient({ categories }: TrendingCarouselClientProps) {
  return (
    <Swiper
      modules={[Navigation, Autoplay]}
      spaceBetween={20}
      slidesPerView={4}
      navigation
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      breakpoints={{
        640: { slidesPerView: 2 },
        768: { slidesPerView: 3 },
        1024: { slidesPerView: 4 },
      }}
    >
      {categories.map((category) => (
        <SwiperSlide key={category.id}>
          <Link href={category.link} className="trending-category">
            <div className="category-image-container">
              <Image
                src={category.image}
                alt={category.name}
                width={250}
                height={250}
                className="category-image"
                // 优化图片加载
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,..."
              />
            </div>
            <h3>{category.name}</h3>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
```

## 三、数据获取与缓存优化方案

### 3.1 实现按需重新验证标签系统

**优化方案**：

```typescript
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { tag, secret } = await request.json();

  // 安全验证
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }
  
  if (!tag) {
    return NextResponse.json({ message: 'Tag is required' }, { status: 400 });
  }

  // 按标签重新验证缓存
  revalidateTag(tag);
  
  console.log(`Revalidated tag: ${tag} at ${new Date().toISOString()}`);

  return NextResponse.json({ 
    revalidated: true, 
    now: Date.now(),
    tag 
  });
}

// lib/data.ts - 更新数据获取函数以支持标签
export async function fetchProductsBySubcategory(
  subcategory: string, 
  limit: number = 10,
  context: string = 'default',
  options: RequestInit = {}
) {
  const url = new URL('/api/woocommerce/products/by-category-and-tag', process.env.NEXT_PUBLIC_BASE_URL);
  
  url.searchParams.append('category', subcategory);
  url.searchParams.append('limit', limit.toString());
  url.searchParams.append('context', context);

  // 默认缓存选项，可通过参数覆盖
  const cacheOptions = {
    next: {
      revalidate: 1800, // 30分钟默认缓存
      tags: [`products-${subcategory}`], // 按分类打标签
      ...options.next
    },
    ...options
  };

  const response = await fetch(url.toString(), cacheOptions);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch products for ${subcategory}: ${response.statusText}`);
  }
  
  return response.json();
}
```

### 3.2 实现智能预加载策略

**优化方案**：

```typescript
// lib/preloader.ts - 智能数据预加载
import { prefetch } from 'next/prefetch';

export class DataPreloader {
  // 预加载用户可能访问的页面数据
  static preloadLikelyPages() {
    // 预加载热门分类页面
    prefetch('/shop/category/art-toys');
    prefetch('/shop/category/labubu');
    prefetch('/shop/category/damanliang');
    
    // 预加载热门产品页面
    prefetch('/product/labubu-secret-edition');
    prefetch('/product/art-toy-exclusive');
  }
  
  // 预加载搜索相关数据
  static preloadSearchData() {
    prefetch('/api/search/suggestions');
    prefetch('/api/search/popular-keywords');
  }
}

// components/SmartLink.tsx - 增强版Link组件，支持智能预取
'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface SmartLinkProps {
  href: string;
  children: React.ReactNode;
  prefetchData?: boolean;
  className?: string;
}

export function SmartLink({ href, children, prefetchData = true, className }: SmartLinkProps) {
  const pathname = usePathname();
  
  useEffect(() => {
    // 当链接进入视口时预取数据
    if (prefetchData) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // 根据路径预取相关数据
              if (href.includes('/category/')) {
                const category = href.split('/category/')[1];
                fetch(`/api/products/category/${category}?preview=true`);
              }
              
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      
      const linkElement = document.getElementById(`smart-link-${href.replace(/\//g, '-')}`);
      if (linkElement) {
        observer.observe(linkElement);
      }
      
      return () => observer.disconnect();
    }
  }, [href, prefetchData]);
  
  return (
    <Link 
      href={href} 
      className={className}
      id={`smart-link-${href.replace(/\//g, '-')}`}
    >
      {children}
    </Link>
  );
}
```

## 四、图片与资源优化方案

### 4.1 优化图片加载策略

**当前问题**：LCP元素是背景图片，加载延迟536ms，渲染延迟703ms。

**优化方案**：

```typescript
// components/OptimizedImage.tsx - 高度优化的图片组件
import Image from 'next/image';
import { useState } from 'react';
import { blurPlaceholder } from '@/lib/blur-placeholder';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  priority = false,
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <div className={`image-container ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-70' : 'opacity-100'}`}
        placeholder="blur"
        blurDataURL={blurPlaceholder(width, height)}
        onLoadingComplete={() => setIsLoading(false)}
        // 优化加载策略
        fetchPriority={priority ? 'high' : 'auto'}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}

// lib/blur-placeholder.ts - 生成模糊占位符
export function blurPlaceholder(width: number, height: number) {
  // 生成一个低质量的SVG占位符
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <rect width="80%" height="80%" x="10%" y="10%" fill="#e5e7eb" rx="4"/>
    </svg>
  `;
  
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}
```

### 4.2 实现关键CSS内联和非关键资源延迟加载

**优化方案**：

```typescript
// app/layout.tsx - 优化布局组件
import { Inter } from 'next/font/google';
import { CriticalCSS } from '@/components/CriticalCSS';
import { DeferredStyles } from '@/components/DeferredStyles';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: '时尚家居 - 发现美好生活',
  description: '探索最新时尚家居产品，提升生活品质',
  // 预加载关键资源
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  // 预连接到外部域名
  other: {
    'preconnect': 'https://fonts.googleapis.com, https://pixypic.net',
    'dns-prefetch': 'https://www.googletagmanager.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={inter.className}>
      <head>
        {/* 内联关键CSS */}
        <CriticalCSS />
        
        {/* 预加载关键字体 */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
        
        {/* 延迟加载非关键样式 */}
        <DeferredStyles />
      </body>
    </html>
  );
}

// components/CriticalCSS.tsx - 内联关键CSS
export function CriticalCSS() {
  const criticalStyles = `
    body {
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 0;
      line-height: 1.6;
      color: #333;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 15px;
    }
    
    /* 首屏关键元素样式 */
    .hero-section {
      min-height: 500px;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;
  
  return <style dangerouslySetInnerHTML={{ __html: criticalStyles }} />;
}

// components/DeferredStyles.tsx - 延迟加载非关键样式
'use client';

import { useEffect, useState } from 'react';

export function DeferredStyles() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // 页面加载完成后延迟加载非关键CSS
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!isLoaded) return null;
  
  return (
    <>
      <link
        href="/styles/non-critical.css"
        rel="stylesheet"
        media="print"
        onLoad="this.media='all'"
      />
      <link
        href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css"
        rel="stylesheet"
        media="print"
        onLoad="this.media='all'"
      />
    </>
  );
}
```

## 五、骨架屏与加载状态优化方案

### 5.1 实现匹配页面布局的骨架屏

**优化方案**：

```typescript
// app/loading.tsx - 全局加载状态
import { HomePageSkeleton } from '@/components/skeletons/HomePageSkeleton';

export default function Loading() {
  return <HomePageSkeleton />;
}

// components/skeletons/HomePageSkeleton.tsx
export function HomePageSkeleton() {
  return (
    <div className="home-page-skeleton">
      <header className="skeleton-header">
        <div className="skeleton-nav" />
      </header>
      
      <main>
        <section className="skeleton-hero">
          <div className="skeleton-slider" />
        </section>
        
        <section className="skeleton-section">
          <div className="skeleton-title" />
          <div className="skeleton-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton-product-card" />
            ))}
          </div>
        </section>
        
        <section className="skeleton-section">
          <div className="skeleton-title" />
          <div className="skeleton-carousel" />
        </section>
      </main>
      
      <footer className="skeleton-footer">
        <div className="skeleton-footer-content" />
      </footer>
    </div>
  );
}

// styles/skeletons.css - 骨架屏样式
.home-page-skeleton {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-nav,
.skeleton-slider,
.skeleton-title,
.skeleton-product-card,
.skeleton-carousel,
.skeleton-footer-content {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-nav {
  height: 80px;
  margin-bottom: 20px;
}

.skeleton-slider {
  height: 400px;
  margin-bottom: 40px;
  border-radius: 8px;
}

.skeleton-title {
  height: 32px;
  width: 200px;
  margin-bottom: 24px;
  border-radius: 4px;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.skeleton-product-card {
  height: 320px;
  border-radius: 8px;
}

.skeleton-carousel {
  height: 200px;
  border-radius: 8px;
}

.skeleton-footer {
  height: 200px;
  margin-top: 60px;
}

.skeleton-footer-content {
  height: 100%;
  border-radius: 8px;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
```

### 5.2 实现渐进式加载与交互优化

**优化方案**：

```typescript
// components/ProgressiveImage.tsx - 渐进式图片加载
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export function ProgressiveImage({ src, alt, width, height, className }: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {isInView && (
        <>
          {/* 低质量占位符 */}
          <Image
            src={`${src}?w=10&blur=20`}
            alt={alt}
            width={width}
            height={height}
            className={`absolute inset-0 transition-opacity duration-500 ${
              isLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />
          
          {/* 高质量图片 */}
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={`transition-opacity duration-500 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoadingComplete={() => setIsLoaded(true)}
          />
        </>
      )}
      
      {/* 加载指示器 */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}

// hooks/useProgressiveLoading.ts - 渐进式加载Hook
import { useState, useEffect, useRef } from 'react';

export function useProgressiveLoading<T>(
  fetcher: () => Promise<T>,
  options: {
    threshold?: number;
    rootMargin?: string;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setLoading(true);
          setHasLoaded(true);
          
          try {
            const result = await fetcher();
            setData(result);
          } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
          } finally {
            setLoading(false);
          }
          
          observer.disconnect();
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '50px',
      }
    );
    
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    
    return () => observer.disconnect();
  }, [fetcher, hasLoaded, options.threshold, options.rootMargin]);
  
  return { data, loading, error, elementRef };
}
```

## 六、性能监控与优化迭代方案

### 6.1 实现性能监控系统

**优化方案**：

```typescript
// lib/performance.ts - 性能监控工具
export class PerformanceMonitor {
  // 监控关键指标
  static observeWebVitals() {
    if (typeof window !== 'undefined') {
      // 监控LCP
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
        
        // 发送到分析服务
        this.sendMetric('lcp', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      // 监控FID
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          console.log('FID:', entry.processingStart - entry.startTime);
          this.sendMetric('fid', entry.processingStart - entry.startTime);
        }
      }).observe({ entryTypes: ['first-input'] });
      
      // 监控CLS
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            console.log('CLS:', clsValue);
            this.sendMetric('cls', clsValue);
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }
  
  // 发送指标到分析服务
  static sendMetric(name: string, value: number) {
    // 使用sendBeacon确保页面卸载时也能发送
    if (navigator.sendBeacon) {
      const data = JSON.stringify({ name, value, url: window.location.href });
      navigator.sendBeacon('/api/analytics', data);
    }
  }
  
  // 监控资源加载
  static observeResourceTiming() {
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      // 分析慢资源
      const slowResources = resources.filter(resource => resource.duration > 1000);
      
      if (slowResources.length > 0) {
        console.warn('Slow resources detected:', slowResources);
        this.sendMetric('slow_resources', slowResources.length);
      }
      
      // 分析资源大小
      const totalSize = resources.reduce((total, resource) => {
        return total + (resource.transferSize || 0);
      }, 0);
      
      console.log('Total transfer size:', totalSize);
      this.sendMetric('page_size', totalSize);
    });
  }
}

// components/PerformanceMonitor.tsx - 性能监控组件
'use client';

import { useEffect } from 'react';
import { PerformanceMonitor } from '@/lib/performance';

export function PerformanceMonitor() {
  useEffect(() => {
    // 启动性能监控
    PerformanceMonitor.observeWebVitals();
    PerformanceMonitor.observeResourceTiming();
  }, []);
  
  return null; // 这是一个无UI组件
}
```

### 6.2 实现A/B测试框架

**优化方案**：

```typescript
// lib/ab-testing.ts - A/B测试框架
export class ABTesting {
  // 获取用户分组
  static getGroup(testName: string, groups: string[]): string {
    // 从localStorage获取已有分组
    const savedGroup = localStorage.getItem(`ab_test_${testName}`);
    if (savedGroup && groups.includes(savedGroup)) {
      return savedGroup;
    }
    
    // 生成新分组
    const userId = this.getUserId();
    const hash = this.hashCode(userId + testName);
    const groupIndex = Math.abs(hash) % groups.length;
    const group = groups[groupIndex];
    
    // 保存分组
    localStorage.setItem(`ab_test_${testName}`, group);
    
    return group;
  }
  
  // 获取用户ID
  static getUserId(): string {
    let userId = localStorage.getItem('user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('user_id', userId);
    }
    return userId;
  }
  
  // 字符串哈希函数
  static hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return hash;
  }
  
  // 记录测试事件
  static trackEvent(testName: string, group: string, event: string, value?: number) {
    const data = {
      testName,
      group,
      event,
      value,
      timestamp: Date.now(),
      url: window.location.href
    };
    
    // 发送到分析服务
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/ab-testing', JSON.stringify(data));
    }
  }
}

// components/ABTest.tsx - A/B测试组件
'use client';

import { useEffect, useState } from 'react';
import { ABTesting } from '@/lib/ab-testing';

interface ABTestProps {
  testName: string;
  groups: string[];
  children: (group: string) => React.ReactNode;
  trackEvent?: (group: string, eventName: string) => void;
}

export function ABTest({ testName, groups, children, trackEvent }: ABTestProps) {
  const [group, setGroup] = useState<string>('');
  
  useEffect(() => {
    const assignedGroup = ABTesting.getGroup(testName, groups);
    setGroup(assignedGroup);
    
    // 记录测试参与
    ABTesting.trackEvent(testName, assignedGroup, 'participated');
  }, [testName, groups]);
  
  useEffect(() => {
    if (group && trackEvent) {
      trackEvent(group, 'viewed');
    }
  }, [group, trackEvent]);
  
  if (!group) {
    return null; // 或者返回加载状态
  }
  
  return <>{children(group)}</>;
}
```

## 七、实施计划与优先级

### 7.1 第一阶段：核心性能优化（1-2周）

1. **实施ISR与数据获取优化**
   - 重构首页为纯服务端组件
   - 实现Promise.allSettled并行数据获取
   - 添加按需重新验证标签系统

2. **组件架构优化**
   - 分离服务端/客户端组件
   - 优化TrendingNow组件
   - 实现最小化客户端组件

3. **图片优化**
   - 实现OptimizedImage组件
   - 添加图片优先级和懒加载
   - 优化LCP图片加载

### 7.2 第二阶段：用户体验优化（2-3周）

1. **加载状态优化**
   - 实现骨架屏系统
   - 添加渐进式图片加载
   - 优化页面过渡效果

2. **智能预加载**
   - 实现SmartLink组件
   - 添加数据预加载策略
   - 优化路由预取

3. **性能监控**
   - 实现性能监控系统
   - 添加关键指标追踪
   - 建立性能基准

### 7.3 第三阶段：高级优化与迭代（3-4周）

1. **A/B测试框架**
   - 实现A/B测试系统
   - 测试不同加载策略
   - 优化转化率

2. **高级缓存策略**
   - 实现边缘缓存
   - 优化CDN配置
   - 添加离线支持

3. **持续优化**
   - 建立性能预算
   - 实施自动化性能测试
   - 持续监控和优化

## 八、预期性能提升

通过实施以上优化方案，预期可以实现以下性能提升：

1. **LCP（最大内容绘制）**：从1,336ms降低到600-800ms（提升40-55%）
2. **FID（首次输入延迟）**：从当前状态降低到100ms以下
3. **CLS（累积布局偏移）**：保持在0.1以下
4. **首屏加载时间**：减少50%以上
5. **页面大小**：减少30-40%（通过代码拆分和优化）
6. **缓存命中率**：提升到80%以上

## 九、风险评估与缓解策略

### 9.1 潜在风险

1. **重构风险**：大规模组件重构可能引入新bug
2. **缓存一致性**：多层缓存可能导致数据不一致
3. **兼容性问题**：新特性可能与旧浏览器不兼容
4. **开发复杂度**：增加代码复杂度，影响开发效率

### 9.2 缓解策略

1. **渐进式重构**：分模块逐步重构，每个模块独立测试
2. **缓存策略文档**：详细记录缓存层级和失效策略
3. **渐进增强**：确保核心功能在所有浏览器中可用
4. **团队培训**：提供培训文档和代码示例，降低学习曲线

## 十、总结

这份优化方案基于对当前首页性能问题的深入分析，结合Next.js App Router的最新特性，提供了一套全面、可行的性能优化策略。通过实施这些优化，预期可以显著提升用户体验，减少加载时间，提高转化率。

方案采用分阶段实施的方式，确保在优化过程中不影响现有功能的稳定性。同时，通过性能监控和A/B测试框架，可以持续优化和迭代，确保长期性能提升。

建议在实施前进行小规模试点，验证效果后再全面推广。同时，建立性能监控体系，持续跟踪关键指标，确保优化效果符合预期。