"use client"

import React, { useState, useEffect } from 'react'
import Image, { ImageProps } from 'next/image'

type Props = Omit<ImageProps, 'placeholder' | 'blurDataURL'> & {
  src: string
  disableBlur?: boolean
  fallbackSrc?: string
  lazyThreshold?: number
  enableOptimization?: boolean
  preloadPriority?: 'high' | 'low' | 'auto'
}

const allowHosts = new Set(['pixypic.net', 'assets.veebipop.com', 'localhost', '127.0.0.1'])

// 预定义的模糊占位符，避免动态生成
const defaultBlurDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9J2cnIHgxPScwJyB5MT0nMCcgeDI9JzEnIHkyPScxJz48c3RvcCBvZmZzZXQ9JzAnIHN0b3AtY29sb3I9JyNmNWY1ZjUnLz48c3RvcCBvZmZzZXQ9JzEnIHN0b3AtY29sb3I9JyNlZWVlZWUnLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgeD0nMCcgeT0nMCcgcng9JzgnIGZpbGw9J3VybCgjZyknIC8+PC9zdmc+'

const BlurImage: React.FC<Props> = ({
  src,
  disableBlur,
  fallbackSrc,
  lazyThreshold = 200,
  enableOptimization = true,
  preloadPriority = 'auto',
  ...rest
}) => {
  const [isLoading, setLoading] = useState(true)
  const [errored, setErrored] = useState(false)
  const [inView, setInView] = useState(false)
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null)
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null)
  const [loadStartTime, setLoadStartTime] = useState<number>(0)
  
  let unoptimized = false
  try {
    const u = new URL(src)
    if (u.protocol === 'http:' || u.protocol === 'https:') {
      if (!allowHosts.has(u.hostname)) unoptimized = true
    }
  } catch {}
  
  // 优化：为关键图片禁用模糊占位符生成，减少不必要的请求
  const isPriorityImage = rest.priority || rest.loading === 'eager'
  const shouldUseBlur = !disableBlur && !isPriorityImage
  
  // 优化：懒加载实现
  useEffect(() => {
    if (!containerRef || isPriorityImage) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: `${lazyThreshold}px` }
    )
    
    observer.observe(containerRef)
    return () => observer.disconnect()
  }, [containerRef, isPriorityImage, lazyThreshold])
  
  // 图片加载性能监控
  const handleLoad = () => {
    setLoading(false)
    if (loadStartTime > 0) {
      const loadTime = performance.now() - loadStartTime
      // 开发环境下输出性能信息
      if (process.env.NODE_ENV === 'development') {
        console.log(`Image loaded: ${src}`, {
          loadTime: `${loadTime.toFixed(2)}ms`
        })
      }
    }
  }
  
  const handleLoadStart = () => {
    setLoadStartTime(performance.now())
  }
  
  if (errored && fallbackSrc) {
    return (
      <Image
        ref={setImageRef}
        src={fallbackSrc}
        unoptimized={unoptimized}
        onError={() => setErrored(true)}
        onLoad={handleLoad}
        onLoadStart={handleLoadStart}
        {...rest}
      />
    )
  }
  
  if (errored) {
    return (
      // Fallback to native img when Next/Image fails
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={setImageRef}
        src={src}
        alt={rest.alt || ''}
        className={rest.className}
        style={rest.style}
        onLoad={handleLoad}
        onLoadStart={handleLoadStart}
      />
    )
  }
  
  // 优化：对于非关键图片，在进入视口前不渲染
  if (!isPriorityImage && !inView) {
    return (
      <div
        ref={setContainerRef}
        className={rest.className}
        style={{
          ...rest.style,
          backgroundColor: '#f5f5f5',
          backgroundImage: `url(${defaultBlurDataURL})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    )
  }
  
  return (
    <Image
      ref={setImageRef}
      src={src}
      placeholder={shouldUseBlur ? 'blur' : 'empty'}
      blurDataURL={shouldUseBlur ? defaultBlurDataURL : undefined}
      unoptimized={unoptimized}
      onError={() => setErrored(true)}
      loading={isPriorityImage ? 'eager' : 'lazy'}
      onLoad={handleLoad}
      onLoadStart={handleLoadStart}
      className={`duration-700 ease-in-out ${
        isLoading ? 'scale-105 blur-xl' : 'scale-100 blur-0'
      } ${rest.className || ''}`}
      {...rest}
    />
  )
}

export default BlurImage