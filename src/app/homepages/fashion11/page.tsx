import React from 'react'
import { Metadata } from 'next'
import nextDynamic from 'next/dynamic'
import MenFashion from '@/components/Home11/MenFashion'
import blogData from '@/data/Blog.json'

// 首屏必要组件保持 SSR，其他组件采用动态导入以减少首屏 JS
const TopNavOne = nextDynamic(() => import('@/components/Header/TopNav/TopNavOne'))
const MenuEleven = nextDynamic(() => import('@/components/Header/Menu/MenuEleven'))
// 重型首屏组件（含 Swiper）仅在客户端渲染，并提供占位避免布局抖动
const HeroSlider = nextDynamic(
  () => import('@/components/Slider/HeroSlider'),
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

// Removed Product.json import - no fallback data

export const revalidate = 1800 // 30 minutes cache for homepage

export const metadata: Metadata = {
  title: 'VeebiPop - Factory-Direct Custom Plush Toys & Accessories Manufacturer',
  description: 'Leading factory-direct manufacturer of custom plush toys, stuffed animals, and fashion accessories. We provide wholesale OEM/ODM services for global brands. Get a direct quote today.',
}

export default async function HomeEleven() {
    const host = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).host : 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const homeDataUrl = `${protocol}://${host}/api/woocommerce/home-data`
    const bannersUrl = `${protocol}://${host}/api/banners`
    
    // Step 1: 并行获取首页数据和轮播数据
    const [homeRes, bannersRes] = await Promise.allSettled([
        fetch(homeDataUrl, {
            next: { revalidate: 1800 }, // 30分钟缓存
        }).catch(() => null),
        fetch(bannersUrl, {
            next: { revalidate: 3600 }, // 1小时缓存
        }).catch(() => null)
    ])
    
    let homeData = null
    let banners = []
    let artInitial = []
    let charmsInitial = []
    let carInitial = []
    
    // 处理轮播数据
    if (bannersRes.status === 'fulfilled' && bannersRes.value && bannersRes.value.ok) {
        try {
            const bannersData = await bannersRes.value.json()
            banners = bannersData?.banners || []
            console.log('Successfully loaded banners:', banners.length, 'items')
        } catch (error) {
            console.error('Failed to parse banners data from API:', error)
        }
    } else {
        console.log('Banners API response status:', bannersRes.status)
        if (bannersRes.status === 'rejected') {
            console.log('Banners API rejected:', bannersRes.reason)
        }
        console.log('Using fallback banners data due to API error')
        // 使用默认轮播数据
        banners = [
            {
                id: 1,
                image: "https://assets.veebipop.com/art%20toys4-optimized.webp",
                title: "Partner with us",
                subtitle: "Define the trendy Market",
                buttonText: "Shop Now",
                link: "/shop",
                badge: "China Direct",
                textPosition: "left"
            },
            {
                id: 2,
                image: "https://assets.veebipop.com/images/slide-3-optimized.webp",
                title: "Unmatched Quality",
                subtitle: "Every detail is perfect",
                buttonText: "Shop Now",
                link: "/shop",
                badge: "Premium Quality",
                textPosition: "left"
            },
            {
    id: 3,
    image: "https://assets.veebipop.com/images/s11-3-optimized.webp",
    title: "Factory-Direct Manufacturer",
    subtitle: "Free Samples",
    buttonText: "Start Wholesale",
    link: "/shop",
    badge: "Factory Direct",
    textPosition: "left"
}
        ]
    }
    
    // 处理首页数据
    if (homeRes.status === 'fulfilled' && homeRes.value && homeRes.value.ok) {
        try {
            homeData = await homeRes.value.json()
            // Step 2: 高优先级 - 立即提取并渲染 MenFashion（最上方板块）
            artInitial = homeData?.artToys || []
            
            // Step 3: 中低优先级 - 并行提取下面两个（不阻塞上方）
            charmsInitial = homeData?.charms || []
            carInitial = homeData?.inCarAccessories || []
        } catch (error) {
            console.error('Failed to parse home data from API:', error)
        }
    } else {
        console.log('Using fallback data for home page due to API error')
        // No fallback - initialize with empty arrays
        artInitial = []
        charmsInitial = []
        carInitial = []
    }
    
    return (
        <>
            <TopNavOne props="style-one bg-black" slogan='New customers save 10% with the code GET10' />
            <div id="header" className='relative w-full'>
                <MenuEleven />
                <HeroSlider slides={banners} />
            </div>
            <TrendingNow />
            {/* 最上方板块最高优先级，先渲染 */}
            <MenFashion start={0} limit={3} initialData={artInitial} />
            <Banner />
            {/* 下面两个并行渲染，用户已看到上方内容，不care谁先谁后 */}
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
