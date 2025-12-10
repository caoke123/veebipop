export const revalidate = 900 // 15 minutes cache for shop pages

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
// Removed Product.json import - no fallback data

import { fetchCategories } from '@/lib/data/categories'
import { fetchBrands } from '@/lib/data/brands'

export const metadata: Metadata = {
  title: 'Wholesale Trendy Plush Toys, Doll Outfits, Car Charms | VeebiPop Factory-Direct Manufacturer',
  description: 'Bulk buy from factory-direct manufacturer: Labubu, plush dolls, fashion accessories, seatbelt covers. 50pcs MOQ · Free samples · Custom logo welcome.',
}

export default async function ShopIndex({
  searchParams,
}: {
  searchParams?: { type?: string; gender?: string; category?: string; on_sale?: string; price_min?: string; price_max?: string; per_page?: string; page?: string }
}) {
  const type = searchParams?.type ?? null
  const gender = searchParams?.gender ?? null
  const categoryParam = searchParams?.category ?? null
  // Support legacy 'type' param as fallback for category
  const category = categoryParam || type || null
  const on_sale = searchParams?.on_sale ?? null
  const price_min = searchParams?.price_min ?? null
  const price_max = searchParams?.price_max ?? null
  const perPage = searchParams?.per_page ?? '9'
  const page = searchParams?.page ?? '1'

  let products: ProductType[] = []
  let initialCategories: any[] = []
  let initialBrands: any[] = []
  let paginationMeta: any = null
  let host = 'localhost:3002'
  let protocol = 'http'
  
  // Directly fetch filtered products without HTTP overhead
  const productPromise = import('@/lib/data/filteredProducts').then(mod => {
    return mod.fetchFilteredProducts({
      per_page: Number(perPage),
      page: Number(page),
      category: category || undefined,
      on_sale: on_sale ? true : undefined,
      price_min: price_min || undefined,
      price_max: price_max || undefined
    })
  })

  try {
    const hdrs = headers()
    const forwardedHost = hdrs.get('x-forwarded-host')
    const hostHdr = hdrs.get('host')
    const forwardedProto = hdrs.get('x-forwarded-proto')
    host = forwardedHost ?? hostHdr ?? 'localhost:3000'
    protocol = forwardedProto ?? 'http'
    
    const [productResult, catResult, brandResult] = await Promise.allSettled([
      productPromise,
      fetchCategories({ per_page: 100, hide_empty: false }),
      fetchBrands()
    ])

    // Process Product Result
    if (productResult.status === 'fulfilled') {
      const res = productResult.value
      // @ts-ignore - The structure is known
      const data = res.data?.data || []
      products = Array.isArray(data) ? (data as ProductType[]) : []
      
      if (res.data?.meta) {
        paginationMeta = res.data.meta
      }
      console.log(`ShopIndex: Loaded ${products.length} products from ${res.source}`)
    } else {
      console.error('ShopIndex: Product fetch failed', productResult.reason)
    }

    // Process Categories Result
    if (catResult.status === 'fulfilled') {
      initialCategories = catResult.value
    }
    
    // Process Brands Result
    if (brandResult.status === 'fulfilled') {
      initialBrands = brandResult.value
    }
  } catch (e) {
    console.error('Failed to load products from WooCommerce API', e)
    console.error('Error details:', {
      message: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : 'No stack trace',
      host: host,
      protocol: protocol
    })
    // No fallback - rethrow the error
    throw e instanceof Error ? e : new Error(String(e))
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
