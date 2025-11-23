'use client'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import Image from 'next/image'
import 'swiper/css'
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
  // 预加载关键图片
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const criticalImages = slides.map(slide => slide.image)
      criticalImages.forEach(src => {
        const img = new window.Image()
        img.src = src
      })
    }
  }, [slides])

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
    <div className="slider-block style-two w-full">
      <div className="container banner-block lg:pt-[30px] flex max-lg:flex-wrap gap-y-5 h-full w-full">
        <div className="slider-main lg:w-2/3 w-full lg:pr-[15px] max-lg:h-[300px] max-[420px]:h-[340px]">
          <Swiper
            modules={[Autoplay, Pagination, EffectFade]}
            spaceBetween={0}
            slidesPerView={1}
            loop={true}
            pagination={{ clickable: true }}
            className='w-full h-full relative rounded-3xl overflow-hidden'
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
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

          {/* 导航箭头已隐藏 */}
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