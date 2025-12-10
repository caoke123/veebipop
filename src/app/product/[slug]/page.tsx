export const revalidate = 3600 // 1 hour cache for product pages

import React from 'react'
import { Metadata } from 'next'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuEleven from '@/components/Header/Menu/MenuEleven'
import BreadcrumbProduct from '@/components/Breadcrumb/BreadcrumbProduct'
import ProductDetailClient from '@/components/Product/Detail/ProductDetailClient'
import Footer from '@/components/Footer/Footer'
import { ProductType } from '@/type/ProductType'
import { fetchProductDetail } from '@/lib/data/productData'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const productSlug = String(params?.slug ?? '')
  let product: ProductType | null = null
  
  try {
    const result = await fetchProductDetail(productSlug, false) // No need for related products for metadata
    product = result.mainProduct
  } catch (e) {
    console.error('Failed to load product metadata', e)
  }

  if (!product) {
    return {
      title: 'Product Not Found | VeebiPop',
      description: 'The requested product could not be found.',
    }
  }

  const productImage = product.images?.[0] || "https://image.veebipop.com/og-product.jpg"
  
  return {
    title: `${product.name} - Wholesale from VeebiPop Factory-Direct Manufacturer | 50pcs MOQ`,
    description: `Bulk wholesale ${product.name} directly from China factory. MOQ 50pcs · Free samples · OEM/ODM available.`,
    openGraph: {
      title: `${product.name} - VeebiPop Factory-Direct Wholesale`,
      images: [
        {
          url: productImage,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} - VeebiPop Factory-Direct Wholesale`,
      description: `Bulk wholesale ${product.name} from China factory. MOQ 50pcs · Free samples · OEM/ODM available.`,
      images: [productImage],
    },
  }
}

export default async function ProductDetailBySlug({ params }: { params: { slug: string } }) {
  const productSlug = String(params?.slug ?? '')

  let mainProduct: ProductType | null = null
  let relatedProducts: ProductType[] = []
  let fallbackProducts: ProductType[] = []

  try {
    // Use direct function call instead of internal API fetch
    // Use includeRelated=false to skip server-side fetching of related products
    // They will be fetched client-side to improve initial load performance
    const result = await fetchProductDetail(productSlug, false)
    mainProduct = result.mainProduct
    relatedProducts = result.relatedProducts || []
    fallbackProducts = result.fallbackProducts || []
    
    console.log('Product loaded directly:', mainProduct?.name)
    console.log('Related products count:', relatedProducts.length)
    console.log('Fallback products count:', fallbackProducts.length)
  } catch (error) {
    console.error('Failed to load product detail:', error)
  }

  // Combine related and fallback products
  const finalRelatedProducts = [...relatedProducts, ...fallbackProducts]

  return (
    <>
      <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
      <div id="header" className='relative w-full'>
        <MenuEleven />
        {mainProduct && (
          <BreadcrumbProduct data={[mainProduct]} productPage={'detail'} productSlug={productSlug} />
        )}
      </div>
      {mainProduct ? (
        <ProductDetailClient
          slug={productSlug}
          initial={mainProduct}
          relatedProducts={finalRelatedProducts}
        />
      ) : (
        <div className="container md:py-20 py-10">
          <div className="text-center">
            <div className="heading2">Product Not Found</div>
            <p className="text-gray-600 mt-4">The product "{productSlug}" could not be found.</p>
            <p className="text-sm text-gray-500 mt-2">This might be due to API connection issues or the product being temporarily unavailable.</p>
          </div>
        </div>
      )}
      <Footer />
    </>
  )
}
