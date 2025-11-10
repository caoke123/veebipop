import React from 'react'
import nextDynamic from 'next/dynamic'
import blogData from '@/data/Blog.json'

// 首屏必要组件保持 SSR，其他组件采用动态导入以减少首屏 JS
const TopNavOne = nextDynamic(() => import('@/components/Header/TopNav/TopNavOne'))
const MenuEleven = nextDynamic(() => import('@/components/Header/Menu/MenuEleven'))
// 重型首屏组件（含 Swiper）仅在客户端渲染，并提供占位避免布局抖动
const SliderEleven = nextDynamic(
  () => import('@/components/Slider/SliderEleven'),
  {
    ssr: false,
    loading: () => (
      // 与实际 Slider 匹配的大致高度占位，减少 CLS
      <div className="w-full lg:h-[400px] max-lg:h-[300px] max-[420px]:h-[340px] rounded-3xl bg-surface" />
    )
  }
)
// 使用 swiper 的组件改为仅在客户端渲染，避免在首屏加载其 JS
const TrendingNow = nextDynamic(() => import('@/components/Home11/TrendingNow'), { ssr: false })
const Brand = nextDynamic(() => import('@/components/Home1/Brand'), { ssr: false })
// 其余非首屏组件按需分包加载
const MenFashion = nextDynamic(() => import('@/components/Home11/MenFashion'))
const Banner = nextDynamic(() => import('@/components/Home11/Banner'))
const WomenFashion = nextDynamic(() => import('@/components/Home11/WomenFashion'))
const Benefit = nextDynamic(() => import('@/components/Home1/Benefit'))
const NewsInsight = nextDynamic(() => import('@/components/Home3/NewsInsight'))
const Newsletter = nextDynamic(() => import('@/components/Home11/Newsletter'))
const Footer = nextDynamic(() => import('@/components/Footer/Footer'))
// ModalNewsletter removed per request to hide popup

import productData from '@/data/Product.json'

// 将页面静态化，避免运行时 fs 读取的动态开销
export const dynamic = 'force-static'

export default function HomeEleven() {
    return (
        <>
            <TopNavOne props="style-one bg-black" slogan='New customers save 10% with the code GET10' />
            <div id="header" className='relative w-full'>
                <MenuEleven />
                <SliderEleven />
            </div>
            <TrendingNow />
            <MenFashion data={productData} start={0} limit={3} />
            <Banner />
            <WomenFashion data={productData} start={0} limit={3} />
            <Benefit props="md:mt-20 mt-10 py-10 px-2.5 bg-surface rounded-[32px]" />
            <NewsInsight data={blogData} start={0} limit={3} />
            <Brand />
            <Newsletter />
            <Footer />
            {/* ModalNewsletter hidden */}
        </>
    )
}
