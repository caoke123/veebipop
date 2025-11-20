'use client'

import React, { Component, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import BlurImage from '@/components/common/BlurImage'
// 静态导入首帧与轮播图片以启用内置 blurDataURL，占位不改变布局
import bg11_1 from '../../../public/images/slider/bg11-1.png'
import bg11_2 from '../../../public/images/slider/bg11-2.png'
import bg11_3 from '../../../public/images/slider/bg11-3.png'
import banner_bg2_2 from '../../../public/images/slider/bg2-2.png'
import banner_feature from '../../../public/images/other/bg-feature.png'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import { formatPrice } from '@/utils/priceFormat'


const SliderEleven = () => {
    const [ready, setReady] = useState(false)
    const [inView, setInView] = useState(false)
    const [swiperModules, setSwiperModules] = useState<any[]>([Pagination])
    const containerRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    
    // 优化：预加载关键图片
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const criticalImages = [
                'https://image.nv315.top/art%20toys4-optimized.webp',
                'https://image.nv315.top/images/slide-3-optimized.webp',
                'https://image.nv315.top/images/s11-3-optimized.webp'
            ]
            
            criticalImages.forEach(src => {
                const img = new window.Image()
                img.src = src
            })
        }
    }, [])

    const handleTypeClick = (type: string) => {
router.push(`/shop?type=${type}`);
    };

    useEffect(() => {
        // 在浏览器空闲时再初始化 Swiper，减少主线程阻塞，不改变布局与视觉
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
            setSwiperModules([Pagination, (mod as any).Autoplay])
          }
        }).catch(() => {})
      }
    }, [ready, inView])

    return (
        <>
            <div className="slider-block style-two w-full" ref={containerRef}>
                <div className="container banner-block lg:pt-[30px] flex gap-y-5 h-full w-full">
                    <div className="slider-main lg:w-1/2 w-full lg:pr-0 max-lg:h-[300px] max-[420px]:h-[340px]">
                        {ready ? (
                            <Swiper
                                spaceBetween={0}
                                slidesPerView={1}
                                loop={true}
                                pagination={{ clickable: true }}
                                modules={swiperModules}
                                className='w-full h-full relative rounded-3xl overflow-hidden'
                                autoplay={inView ? {
                                    delay: 4000,
                                    disableOnInteraction: false,
                                } : false}
                            >
                                <SwiperSlide>
                                    <div className="slider-item h-full w-full flex items-center bg-linear relative">
                                        <div className="text-content relative z-[1] md:pl-[60px] pl-5 lg:basis-full basis-1/2">
                                            <div className="text-button-uppercase">Partner with us</div>
                                            <div className="heading2 lg:mt-3 mt-2">Define the trendy Market</div>
                                            <div className="body1 lg:mt-4 mt-3">Discover the beauty of fashion living</div>
<Link href='/shop' prefetch={false} className="button-main lg:mt-8 mt-3">Shop Now</Link>
                                        </div>
                                        <div className="sub-img absolute lg:right-0 xl:right-0 md:right-0 sm:right-0 right-0 top-0 bottom-0 w-1/2 lg:w-full">
                                            <BlurImage
                                              src="https://image.nv315.top/art%20toys4-optimized.webp"
                                              width={2000}
                                              height={1936}
                                              alt='bg11-1'
                                              sizes="(min-width: 1024px) 66vw, 100vw"
                                              className='object-cover object-center w-full h-full'
                                              priority
                                              disableBlur
                                            />
                                        </div>
                                    </div>
                                </SwiperSlide>
                                <SwiperSlide>
                                    <div className="slider-item h-full w-full flex items-center bg-linear relative">
                                        <div className="text-content relative z-[1] md:pl-[60px] pl-5 lg:basis-full basis-1/2">
                                            <div className="text-button-uppercase">Unmatched Quality</div>
                                            <div className="heading2 lg:mt-3 mt-2">Every detail is perfect</div>
                                            <div className="body1 lg:mt-4 mt-3">One supplier, endless possibilities</div>
<Link href='/shop' prefetch={false} className="button-main lg:mt-8 mt-3">Shop Now</Link>
                                        </div>
                                        <div className="sub-img absolute lg:right-0 xl:right-0 md:right-0 sm:right-0 right-0 top-0 bottom-0 w-1/2 lg:w-full">
                                            <BlurImage
                                              src="https://image.nv315.top/images/slide-3-optimized.webp"
                                              width={2000}
                                              height={1936}
                                              alt='bg11-2'
                                              sizes="(min-width: 1024px) 66vw, 100vw"
                                              className='object-cover object-center w-full h-full'
                                              disableBlur
                                            />
                                        </div>
                                    </div>
                                </SwiperSlide>
                                <SwiperSlide>
                                    <div className="slider-item h-full w-full flex items-center bg-linear relative">
                                        <div className="text-content relative z-[1] md:pl-[60px] pl-5 lg:basis-full basis-1/2">
                                            <div className="text-button-uppercase">Fresh and Tasty</div>
                                            <div className="heading2 lg:mt-3 mt-2">Summer Sale Collections</div>
                                            <div className="body1 lg:mt-4 mt-3">Discover the beauty of fashion living</div>
<Link href='/shop' prefetch={false} className="button-main lg:mt-8 mt-3">Shop Now</Link>
                                        </div>
                                        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[45%] md:w-[40%] lg:w-[38%] xl:w-[40%] h-full hidden lg:block overflow-hidden rounded-l-3xl shadow-2xl">
                                            <BlurImage
                                              src="https://image.nv315.top/images/s11-3-optimized.webp"
                                              width={2000}
                                              height={2000}
                                              alt='bg11-3'
                                              sizes="(min-width: 1024px) 66vw, 100vw"
                                              className='object-cover object-center w-full h-full'
                                              disableBlur
                                            />
                                        </div>
                                    </div>
                                </SwiperSlide>
                            </Swiper>
                        ) : (
                            // 未就绪时渲染首帧静态内容，保持布局一致，不执行 Swiper 初始化
                            <div className='w-full h-full relative rounded-3xl overflow-hidden'>
                                <div className="slider-item h-full w-full flex items-center bg-linear relative">
                                    <div className="text-content relative z-[1] md:pl-[60px] pl-5 lg:basis-full basis-1/2">
                                        <div className="text-button-uppercase">Fresh and Tasty</div>
                                        <div className="heading2 lg:mt-3 mt-2">New Season Women's style</div>
                                        <div className="body1 lg:mt-4 mt-3">Discover the beauty of fashion living</div>
<Link href='/shop' prefetch={false} className="button-main lg:mt-8 mt-3">Shop Now</Link>
                                    </div>
                                    <div className="sub-img absolute lg:right-0 xl:right-0 md:right-0 sm:right-0 right-0 top-0 bottom-0 w-1/2 lg:w-full">
                                        <BlurImage
                                          src="https://image.nv315.top/art%20toys4.png"
                                          width={2000}
                                          height={1936}
                                          alt='bg11-1'
                                          sizes="(min-width: 1024px) 66vw, 100vw"
                                          className='object-cover object-center w-full h-full'
                                          priority
                                          disableBlur
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="banner-ads-block lg:w-1/2 lg:pl-0 w-full max-lg:grid sm:grid-cols-2 gap-5">
                        <div className="banner-ads-item bg-linear rounded-2xl relative overflow-hidden cursor-pointer" onClick={() => handleTypeClick('swimwear')}>
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
                        <div className="banner-ads-item bg-linear rounded-2xl relative overflow-hidden cursor-pointer lg:mt-8" onClick={() => handleTypeClick('accessories')}>
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
        </>
    )
}

export default SliderEleven