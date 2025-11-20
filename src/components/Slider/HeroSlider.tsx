'use client'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay, Pagination, EffectFade } from 'swiper/modules'
import Image from 'next/image'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'
import { useState, useEffect, useRef } from 'react'
import BlurImage from '@/components/common/BlurImage'
import Link from 'next/link'

interface Slide {
  id: number
  image: string
  title?: string
  subtitle?: string
  buttonText?: string
  link?: string
  badge?: string
}

export default function HeroSlider({ slides }: { slides: Slide[] }) {
  const [ready, setReady] = useState(false)
  const [inView, setInView] = useState(false)
  const [swiperModules, setSwiperModules] = useState<any[]>([Pagination, Navigation])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 预加载关键图片
    if (typeof window !== 'undefined') {
      const criticalImages = slides.map(slide => slide.image)
      criticalImages.forEach(src => {
        const img = new window.Image()
        img.src = src
      })
    }
  }, [slides])

  useEffect(() => {
    // 在浏览器空闲时再初始化 Swiper，减少主线程阻塞
    const idle = (cb: () => void) => {
      // @ts-ignore
      if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
        // @ts-ignore
        window.requestIdleCallback(cb, { timeout: 300 });
      } else {
        setTimeout(cb, 200);
      }
    };
    idle(() => setReady(true));
    
    // Observe visibility to defer heavy modules until visible
    const el = containerRef.current
    if (el && typeof IntersectionObserver !== 'undefined') {
      const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setInView(true)
        }
      }, { rootMargin: '0px', threshold: 0.1 })
      io.observe(el)
      return () => io.disconnect()
    } else {
      setInView(true)
    }
  }, [])

  useEffect(() => {
    // Dynamically import Autoplay only when visible and ready
    if (ready && inView) {
      import('swiper/modules').then(mod => {
        if (mod && (mod as any).Autoplay) {
          setSwiperModules([Pagination, Navigation, (mod as any).Autoplay])
        }
      }).catch(() => {})
    }
  }, [ready, inView])

  if (!slides || slides.length === 0) {
    return (
      <div className="slider-block style-two w-full">
        <div className="container banner-block lg:pt-[30px] flex max-lg:flex-wrap gap-y-5 h-full w-full">
          <div className="slider-main lg:w-2/3 w-full lg:pr-[15px] max-lg:h-[300px] max-[420px]:h-[340px]">
            <div className="w-full h-full relative rounded-3xl overflow-hidden bg-gray-100 flex items-center justify-center">
              <div className="text-gray-500">Loading banners...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="slider-block style-two w-full" ref={containerRef}>
      <div className="container banner-block lg:pt-[30px] flex max-lg:flex-wrap gap-y-5 h-full w-full">
        <div className="slider-main lg:w-2/3 w-full lg:pr-[15px] max-lg:h-[300px] max-[420px]:h-[340px]">
          {ready ? (
            <Swiper
              modules={swiperModules}
              spaceBetween={0}
              slidesPerView={1}
              loop={true}
              pagination={{ clickable: true }}
              navigation={{
                prevEl: '.swiper-button-prev',
                nextEl: '.swiper-button-next',
              }}
              className='w-full h-full relative rounded-3xl overflow-hidden'
              autoplay={inView ? {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
              } : false}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              speed={800}
            >
              {slides.map((slide, index) => (
                <SwiperSlide key={slide.id}>
                  <div className="slider-item h-full w-full flex items-center bg-linear relative">
                    <div className="text-content relative z-[1] md:pl-[60px] pl-5 basis-1/2">
                      <div className="text-button-uppercase">{slide.badge || 'Partner with us'}</div>
                      <div className="heading2 lg:mt-3 mt-2">{slide.title || 'Define the trendy Market'}</div>
                      <div className="body1 lg:mt-4 mt-3">{slide.subtitle || 'Discover the beauty of fashion living'}</div>
                      <Link href={slide.link || '/shop'} prefetch={false} className="button-main lg:mt-8 mt-3">
                        {slide.buttonText || 'Shop Now'}
                      </Link>
                    </div>
                    <div
                      className={
                        index === 2 || slide.id === 3
                          ? "custom-sub-img-right absolute top-1/2 -translate-y-1/2 right-0 w-[55%] md:w-[50%] lg:w-[48%] xl:w-[46%] h-full hidden lg:block overflow-hidden rounded-l-3xl shadow-2xl"
                          : "sub-img absolute xl:right-[50px] lg:right-[20px] md:right-[40px] sm:right-[20px] -right-10 top-0 bottom-0"
                      }
                      data-slide-id={slide.id}
                      data-slide-index={index}
                    >
                      <BlurImage
                        src={slide.image}
                        width={2000}
                        height={2000}
                        alt={slide.title || `slide-${slide.id}`}
                        sizes="(min-width: 1024px) 66vw, 100vw"
                        className='object-cover object-center w-full h-full'
                        priority={index === 0}
                        disableBlur={index === 0}
                      />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            // 未就绪时渲染首帧静态内容，保持布局一致
            <div className='w-full h-full relative rounded-3xl overflow-hidden'>
              {slides[0] && (
                <div className="slider-item h-full w-full flex items-center bg-linear relative">
                  <div className="text-content relative z-[1] md:pl-[60px] pl-5 basis-1/2">
                    <div className="text-button-uppercase">{slides[0].badge || 'Partner with us'}</div>
                    <div className="heading2 lg:mt-3 mt-2">{slides[0].title || 'Define the trendy Market'}</div>
                    <div className="body1 lg:mt-4 mt-3">{slides[0].subtitle || 'Discover the beauty of fashion living'}</div>
                    <Link href={slides[0].link || '/shop'} prefetch={false} className="button-main lg:mt-8 mt-3">
                      {slides[0].buttonText || 'Shop Now'}
                    </Link>
                  </div>
                  <div className="sub-img absolute xl:right-[50px] lg:right-[20px] md:right-[40px] sm:right-[20px] -right-10 top-0 bottom-0">
                    <BlurImage
                      src={slides[0].image}
                      width={2000}
                      height={2000}
                      alt={slides[0].title || 'slide-1'}
                      sizes="(min-width: 1024px) 66vw, 100vw"
                      className='object-cover object-center w-full h-full'
                      priority
                      disableBlur
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 导航箭头 - 保持原有样式 */}
          {ready && (
            <>
              <div className="swiper-button-prev !text-white !shadow-lg" />
              <div className="swiper-button-next !text-white !shadow-lg" />
            </>
          )}
        </div>
        
        {/* 右侧广告区块 - 保持原有设计 */}
        <div className="banner-ads-block lg:w-1/3 lg:pl-[15px] w-full max-lg:grid sm:grid-cols-2 gap-5">
          <div className="banner-ads-item bg-linear rounded-2xl relative overflow-hidden cursor-pointer" onClick={() => window.location.href = '/shop?type=charms'}>
            <div className="text-content relative z-[1] py-12 pl-8">
              <div className="text-button-uppercase text-white bg-red px-2 py-0.5 inline-block rounded-sm">China Direct</div>
              <div className="heading6 mt-2">Direct Sourcing   <br />for Charms</div>
              <div className="body1 mt-3 text-secondary">
                Save More
              </div>
            </div>
            <BlurImage
              src="https://image.nv315.top/images/s4-optimized.webp"
              width={200}
              height={100}
              alt='bg-img'
              sizes="(min-width: 1024px) 33vw, 50vw"
              className='basis-1/3 absolute right-0 top-0'
            />
          </div>
          <div className="banner-ads-item bg-linear rounded-2xl relative overflow-hidden cursor-pointer lg:mt-8" onClick={() => window.location.href = '/shop?type=in-car-accessories'}>
            <div className="text-content relative z-[1] py-12 pl-8">
              <div className="text-button-uppercase text-white bg-red px-2 py-0.5 inline-block rounded-sm">China Direct</div>
              <div className="heading6 mt-2"> Premium Accessories<br/>For Driver</div>
              <div className="body1 mt-3 text-secondary">
                Source Directly
              </div>
            </div>
            <BlurImage
              src="https://image.nv315.top/images/s5-3-optimized.webp"
              width={200}
              height={100}
              alt='bg-img'
              sizes="(min-width: 1024px) 33vw, 50vw"
              className='basis-1/3 absolute right-0 top-0'
            />
          </div>
        </div>
      </div>
    </div>
  )
}