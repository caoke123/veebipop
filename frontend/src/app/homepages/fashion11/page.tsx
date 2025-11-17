import React from 'react'
import nextDynamic from 'next/dynamic'
import MenFashion from '@/components/Home11/MenFashion'
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
const InCarAccessories = nextDynamic(() => import('@/components/Home11/InCarAccessories'))
// 其余非首屏组件按需分包加载
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

export default async function HomeEleven() {
    const host = 'localhost:3000'
    const protocol = 'http'
    const artToysUrl = `${protocol}://${host}/api/woocommerce/products/by-category-and-tag?category=art-toys&per_page=3&tag=home`
    const charmsUrl = `${protocol}://${host}/api/woocommerce/products/by-category-and-tag?category=charms&per_page=3&tag=home`
    const inCarUrl = `${protocol}://${host}/api/woocommerce/products/by-category-and-tag?category=in-car-accessories&per_page=3&tag=home`
    const [artRes, charmsRes, carRes] = await Promise.all([
      fetch(artToysUrl, { next: { revalidate: 60 } }).catch(() => null),
      fetch(charmsUrl, { next: { revalidate: 60 } }).catch(() => null),
      fetch(inCarUrl, { next: { revalidate: 60 } }).catch(() => null),
    ])
    const artData = artRes && artRes.ok ? await artRes.json() : null
    const charmsData = charmsRes && charmsRes.ok ? await charmsRes.json() : null
    const carData = carRes && carRes.ok ? await carRes.json() : null
    const artInitial = artData?.data || []
    const charmsInitial = charmsData?.data || []
    const carInitial = carData?.data || []
    return (
        <>
            <TopNavOne props="style-one bg-black" slogan='New customers save 10% with the code GET10' />
            <div id="header" className='relative w-full'>
                <MenuEleven />
                <SliderEleven />
            </div>
            <TrendingNow />
            <MenFashion start={0} limit={3} initialData={artInitial} />
            <Banner />
            <WomenFashion start={0} limit={3} initialData={charmsInitial} />
            <Benefit props="md:mt-20 mt-10 py-10 px-2.5 bg-surface rounded-[32px]" />
            {/* NewsInsight component removed */}
            <InCarAccessories initialData={carInitial} />
            <Newsletter />
            <Footer />
            {/* ModalNewsletter hidden */}
        </>
    )
}
