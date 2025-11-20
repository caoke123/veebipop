// 强制动态渲染，避免 Vercel DYNAMIC_SERVER_USAGE 错误
export const dynamic = 'force-dynamic'
export const revalidate = 0

import React from 'react'
import { Metadata } from 'next'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuEleven from '@/components/Header/Menu/MenuEleven'
import ShopBreadCrumb1 from '@/components/Shop/ShopBreadCrumb1'
import Footer from '@/components/Footer/Footer'
import { wcArrayToProductTypes } from '@/utils/wcAdapter'
import { buildProductParams } from '@/utils/wcQuery'
import { ProductType } from '@/type/ProductType'
import { headers } from 'next/headers'
import ProductData from '@/data/Product.json'

export const metadata: Metadata = {
  title: 'Wholesale Trendy Plush Toys, Doll Outfits, Car Charms | Selmi Yiwu Factory',
  description: 'Bulk buy from Yiwu source factory: Labubu, plush dolls, fashion accessories, seatbelt covers. 50pcs MOQ · Free samples · Custom logo welcome.',
}

export default async function ShopIndex({
  searchParams,
}: {
  searchParams?: { type?: string; gender?: string; category?: string; on_sale?: string; price_min?: string; price_max?: string; per_page?: string }
}) {
  const type = searchParams?.type ?? null
  const gender = searchParams?.gender ?? null
  const category = searchParams?.category ?? null
  const on_sale = searchParams?.on_sale ?? null
  const price_min = searchParams?.price_min ?? null
  const price_max = searchParams?.price_max ?? null
  const perPage = searchParams?.per_page ?? '9'

  let products: ProductType[] = []
  let initialCategories: any[] = []
  let initialBrands: any[] = []
  let paginationMeta: any = null
  let host = 'localhost:3002'
  let protocol = 'http'
  let url = ''
  try {
    const hdrs = headers()
    const forwardedHost = hdrs.get('x-forwarded-host')
    const hostHdr = hdrs.get('host')
    const forwardedProto = hdrs.get('x-forwarded-proto')
    host = forwardedHost ?? hostHdr ?? 'localhost:3000'
    protocol = forwardedProto ?? 'http'
    // 使用新的服务端筛选API端点，减少客户端数据处理
    const filterParams = new URLSearchParams({
      per_page: perPage,
      category: category || '',
      on_sale: on_sale || '',
      price_min: price_min || '',
      price_max: price_max || '',
    })
    url = `${protocol}://${host}/api/woocommerce/products/filtered?${filterParams.toString()}`
    const catUrl = `${protocol}://${host}/api/woocommerce/categories?per_page=100&hide_empty=false`
    const brandsUrl = `${protocol}://${host}/api/woocommerce/brands`

    console.log('ShopIndex fetch url:', url)
    const res = await fetch(url, {
      next: { revalidate: 300 } // 5分钟重新验证缓存
    })
    console.log('ShopIndex fetch status:', res.status)
    
    // Handle 204 No Content response
    if (res.status === 204) {
      console.log('ShopIndex: API returned 204 No Content - no products available for this category')
      products = []
    } else if (!res.ok) {
      const text = await res.text()
      console.error('ShopIndex fetch failed body snippet:', text.slice(0, 500))
      throw new Error(`API request failed with status ${res.status}`)
    } else {
      const data = await res.json()
      const raw = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : [])
      products = Array.isArray(raw) ? (raw as ProductType[]) : []
      
      // Extract pagination metadata
      if (data?.meta) {
        paginationMeta = data.meta
      }
    }

    const [catResult, brandResult] = await Promise.allSettled([
      fetch(catUrl, {
        next: { revalidate: 600, tags: ['categories:all'] }
      }),
      fetch(brandsUrl, {
        next: { revalidate: 600, tags: ['brands:all'] }
      })
    ])

    if (catResult.status === 'fulfilled' && catResult.value.ok) {
      const cats = await catResult.value.json()
      initialCategories = Array.isArray(cats) ? cats : []
    }
    if (brandResult.status === 'fulfilled' && brandResult.value.ok) {
      const brands = await brandResult.value.json()
      initialBrands = Array.isArray(brands) ? brands : []
    }
  } catch (e) {
    const isDev = process.env.NODE_ENV !== 'production'
    const isPreview = (process.env.VERCEL_ENV || '').toLowerCase() === 'preview' || (process.env.APP_ENV || '').toLowerCase() === 'staging'
    // 临时启用回退数据，即使是在开发环境中，以便在没有 WooCommerce 配置时也能正常显示
    const disableFallback = (process.env.DISABLE_FALLBACK_JSON || '').toLowerCase() === 'true' || isPreview
    console.error('Failed to load products from WooCommerce API', e)
    console.error('Error details:', {
      message: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : 'No stack trace',
      url: url,
      host: host,
      protocol: protocol
    })
    if (disableFallback) {
      throw e instanceof Error ? e : new Error(String(e))
    } else {
      console.log('Using fallback product data from Product.json')
      products = Array.isArray(ProductData) ? ProductData.slice(0, parseInt(perPage)).map(product => ({
        ...product,
        imageStatus: product.imageStatus as 'mapped' | 'fallback' | 'empty' | undefined
      })) : []
    }
  }

  // Helper function to resolve category name for empty state display
  function resolvedCategoryName() {
    if (!category) return null
    
    // Try to find category name from initialCategories
    const found = initialCategories?.find((c: any) => 
      String(c.slug || '').toLowerCase() === String(category).toLowerCase()
    )
    return found?.name || category
  }

  // Determine if this is an empty state scenario
  const isEmptyCategory = Boolean(category && products.length === 0)
  const displayCategoryName = resolvedCategoryName() || category || '此分类'

  return (
    <>
      <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
      <div id="header" className='relative w-full'>
        <MenuEleven />
      </div>
      <ShopBreadCrumb1
        data={products}
        productPerPage={parseInt(perPage) || 9}
        dataType={type}
        gender={gender}
        category={category}
        initialCategories={initialCategories}
        initialBrands={initialBrands}
        isEmptyState={isEmptyCategory}
        emptyCategoryName={displayCategoryName}
        paginationMeta={paginationMeta}
      />
      <Footer />
    </>
  )
}
