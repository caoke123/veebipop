'use client'

import React from 'react'
import Link from 'next/link'
import BlurImage from '@/components/common/BlurImage'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { useRouter } from 'next/navigation';

const TrendingNow = () => {
    const router = useRouter()

    const handleTypeClick = (type: string) => {
router.push(`/shop?type=${type}`);
    };

    return (
        <>
            <div className="trending-block style-six md:pt-20 pt-10">
                <div className="container">
                    <div className="heading3 text-center">Trending Right Now
                    </div>
                    <div className="list-trending section-swiper-navigation style-small-border style-outline md:mt-10 mt-6">
                        <Swiper
                            spaceBetween={12}
                            slidesPerView={2}
                            navigation
                            loop={true}
                            modules={[Navigation]}
                            breakpoints={{
                                576: {
                                    slidesPerView: 3,
                                    spaceBetween: 12,
                                },
                                768: {
                                    slidesPerView: 4,
                                    spaceBetween: 20,
                                },
                                992: {
                                    slidesPerView: 5,
                                    spaceBetween: 20,
                                },
                                1290: {
                                    slidesPerView: 5,
                                    spaceBetween: 30,
                                },
                            }}
                            className='h-full'
                        >
                            <SwiperSlide>
                                <div className="trending-item block relative cursor-pointer" onClick={() => router.push('/shop?category=art-toys')}>
                                    <div className="bg-img rounded-full overflow-hidden">
                                        <BlurImage
                                            src="https://image.nv315.top/images/art%20toys1-optimized.webp"
                                            width={1000}
                                            height={1000}
                                            alt='outerwear'
                                            sizes="(max-width: 768px) 40vw, 200px"
                                            className='w-full'
                                            disableBlur
                                        />
                                    </div>
                                    <div className="trending-name text-center mt-5 duration-500">
                                        <span className='heading5'>Art Toys</span>
                                        {/* <span className='text-secondar2'> (12)</span> */}
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="trending-item block relative cursor-pointer" onClick={() => router.push('/shop?category=charms')}>
                                    <div className="bg-img rounded-full overflow-hidden">
                                        <BlurImage
                                            src="https://image.nv315.top/images/charm-optimized.webp"
                                            width={1000}
                                            height={1000}
                                            alt='swimwear'
                                            sizes="(max-width: 768px) 40vw, 200px"
                                            className='w-full'
                                            disableBlur
                                        />
                                    </div>
                                    <div className="trending-name text-center mt-5 duration-500">
                                        <span className='heading5'>Charms</span>
                                        {/* <span className='text-secondar2'> (12)</span> */}
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="trending-item block relative cursor-pointer" onClick={() => router.push('/shop?category=clothing-for-toys')}>
                                    <div className="bg-img rounded-full overflow-hidden">
                                        <BlurImage
                                            src="https://image.nv315.top/images/clothing3-optimized.webp"
                                            width={1000}
                                            height={1000}
                                            alt='clothes'
                                            sizes="(max-width: 768px) 40vw, 200px"
                                            className='w-full'
                                            disableBlur
                                        />
                                    </div>
                                    <div className="trending-name text-center mt-5 duration-500">
                                        <span className='heading5'>clothing</span>
                                        {/* <span className='text-secondar2'> (12)</span> */}
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="trending-item block relative cursor-pointer" onClick={() => router.push('/shop?category=seatbelt')}>
                                    <div className="bg-img rounded-full overflow-hidden">
                                        <BlurImage
                                            src="https://image.nv315.top/images/seatbelt-optimized.webp"
                                            width={1000}
                                            height={1000}
                                            alt='sets'
                                            sizes="(max-width: 768px) 40vw, 200px"
                                            className='w-full'
                                            disableBlur
                                        />
                                    </div>
                                    <div className="trending-name text-center mt-5 duration-500">
                                        <span className='heading5'>Seatbelt Covers</span>
                                        {/* <span className='text-secondar2'> (12)</span> */}
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="trending-item block relative cursor-pointer" onClick={() => router.push('/shop?category=grab-handle-covers')}>
                                    <div className="bg-img rounded-full overflow-hidden">
                                        <BlurImage
                                            src="https://image.nv315.top/images/handle%20covers-optimized.webp"
                                            width={1000}
                                            height={1000}
                                            alt='accessories'
                                            sizes="(max-width: 768px) 40vw, 200px"
                                            className='w-full'
                                            disableBlur
                                        />
                                    </div>
                                    <div className="trending-name text-center mt-5 duration-500">
                                        <span className='heading5'>Grab Handle Covers</span>
                                        {/* <span className='text-secondar2'> (12)</span> */}
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="trending-item block relative cursor-pointer" onClick={() => router.push('/shop?category=clothing-for-toys')}>
                                    <div className="bg-img rounded-full overflow-hidden">
                                        <BlurImage
                                            src="https://image.nv315.top/images/wayi-optimized.webp"
                                            width={1000}
                                            height={1000}
                                            alt='lingerie'
                                            sizes="(max-width: 768px) 40vw, 200px"
                                            className='w-full'
                                            disableBlur
                                        />
                                    </div>
                                    <div className="trending-name text-center mt-5 duration-500">
                                        <span className='heading5'> Clothing for Toys</span>
                                        {/* <span className='text-secondar2'> (12)</span> */}
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="trending-item block relative cursor-pointer" onClick={() => router.push('/shop?category=steering-wheel-cover')}>
                                    <div className="bg-img rounded-full overflow-hidden">
                                        <BlurImage
                                            src="https://image.nv315.top/images/fangxingpan-optimized.webp"
                                            width={1000}
                                            height={1000}
                                            alt='lingerie'
                                            sizes="(max-width: 768px) 40vw, 200px"
                                            className='w-full'
                                            disableBlur
                                        />
                                    </div>
                                    <div className="trending-name text-center mt-5 duration-500">
                                        <span className='heading5'>Steering Wheel Cover</span>
                                        {/* <span className='text-secondar2'> (12)</span> */}
                                    </div>
                                </div>
                            </SwiperSlide>
                        </Swiper>
                    </div>
                </div>
            </div>
        </>
    )
}

export default TrendingNow