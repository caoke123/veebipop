// 强制动态渲染，避免 Vercel DYNAMIC_SERVER_USAGE 错误
export const dynamic = 'force-dynamic'
export const revalidate = 1800 // 30分钟重新验证

import React from 'react'
import { Metadata } from 'next'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuEleven from '@/components/Header/Menu/MenuEleven'
import BreadcrumbProduct from '@/components/Breadcrumb/BreadcrumbProduct'
import ProductDetailClient from '@/components/Product/Detail/ProductDetailClient'
import Footer from '@/components/Footer/Footer'
import { ProductType } from '@/type/ProductType'
import { wcToProductType, WcProduct } from '@/utils/wcAdapter'
import { getWcApiWithRetry } from '@/utils/woocommerce'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const productSlug = String(params?.slug ?? '')
  let product: ProductType | null = null
  
  try {
    // Try direct API call with retry
    const wcApi = await getWcApiWithRetry()
    if (wcApi) {
      try {
        const response = await wcApi.get('products', {
          slug: productSlug,
          per_page: 1,
          _fields: 'id,name,slug,price,regular_price,sale_price,average_rating,stock_quantity,manage_stock,images,short_description,description,categories,attributes,tags,date_created,meta_data',
        })
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          product = await wcToProductType(response.data[0])
        }
      } catch (apiError) {
        console.error('Direct WooCommerce API call failed:', apiError)
      }
    }
    
    // Fallback to local API endpoint if direct API fails
    if (!product) {
      try {
        const url = `/api/woocommerce/products?slug=${encodeURIComponent(
          productSlug,
        )}&per_page=1&_fields=id,name,slug,price,regular_price,sale_price,average_rating,stock_quantity,manage_stock,images,short_description,description,categories,attributes,tags,date_created,meta_data`
        const res = await fetch(url, {
          next: { revalidate: 300 },
          cache: 'no-store'
        })
        
        if (res.ok) {
          const contentType = res.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const text = await res.text()
            if (text.trim()) {
              try {
                const data = JSON.parse(text)
                const list = Array.isArray(data) ? (data as WcProduct[]) : []
                if (list.length > 0) {
                  product = await wcToProductType(list[0])
                }
              } catch (parseError) {
                console.error('Failed to parse JSON from API:', parseError)
              }
            }
          }
        }
      } catch (apiRouteError) {
        console.error('API route call failed:', apiRouteError)
      }
    }
  } catch (e) {
    console.error('Failed to load product from WooCommerce', e)
  }

  // Fallback to local Product.json
  if (!product) {
    try {
      const res = await fetch(`/Product.json`, {
        next: { revalidate: 60 },
        cache: 'no-store'
      })
      if (res.ok) {
        const text = await res.text()
        if (text.trim()) {
          try {
            const arr = JSON.parse(text)
            const list: ProductType[] = Array.isArray(arr) ? arr : []
            product = list.find(p => String(p.slug) === productSlug) || null
          } catch (parseError) {
            console.error('Failed to parse Product.json:', parseError)
          }
        }
      }
    } catch (e) {
      console.error('Failed to load product from local Product.json', e)
    }
  }

  if (!product) {
    return {
      title: 'Product Not Found | Selmi',
      description: 'The requested product could not be found.',
    }
  }

  const productImage = product.images?.[0] || "https://image.selmi.cc/og-product.jpg"
  
  return {
    title: `${product.name} - Wholesale from Yiwu Selmi Factory | 50pcs MOQ`,
    description: `Bulk wholesale ${product.name} directly from Yiwu China factory. MOQ 50pcs · Free samples · OEM/ODM available.`,
    openGraph: {
      title: `${product.name} - Selmi Yiwu Wholesale`,
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
      title: `${product.name} - Selmi Yiwu Wholesale`,
      description: `Bulk wholesale ${product.name} from Yiwu China factory. MOQ 50pcs · Free samples · OEM/ODM available.`,
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
    // 使用新的专用API一次性获取所有数据
    const url = `/api/woocommerce/product-detail?slug=${encodeURIComponent(productSlug)}&includeRelated=true`
    console.log('Product detail API URL:', url)
    
    const res = await fetch(url, {
      next: { revalidate: 1800 },
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'
      }
    })

    console.log('Product detail API Response status:', res.status)

    if (res.ok) {
      const contentType = res.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const text = await res.text()
        console.log('Product detail API response length:', text.length)
        
        if (text.trim()) {
          try {
            const data = JSON.parse(text)
            mainProduct = data.mainProduct
            relatedProducts = data.relatedProducts || []
            fallbackProducts = data.fallbackProducts || []
            
            console.log('Product loaded from new API:', mainProduct?.name)
            console.log('Related products count:', relatedProducts.length)
            console.log('Fallback products count:', fallbackProducts.length)
          } catch (parseError) {
            console.error('Failed to parse JSON from product detail API:', parseError)
          }
        }
      }
    } else {
      console.error('Product detail API request failed with status:', res.status)
    }
  } catch (error) {
    console.error('Failed to load product detail:', error)
  }

  // 如果新API失败，回退到原来的逻辑
  if (!mainProduct) {
    console.log('Falling back to original product loading logic')
    try {
      // Try direct API call with retry
      const wcApi = await getWcApiWithRetry()
      if (wcApi) {
        try {
          const response = await wcApi.get('products', {
            slug: productSlug,
            per_page: 1,
            _fields: 'id,name,slug,price,regular_price,sale_price,average_rating,stock_quantity,manage_stock,images,short_description,description,categories,attributes,tags,date_created,meta_data',
          })
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            mainProduct = await wcToProductType(response.data[0])
            console.log('Product loaded from WooCommerce API (fallback):', mainProduct.name)
          }
        } catch (apiError) {
          console.error('Direct WooCommerce API call failed:', apiError)
        }
      }
    } catch (e) {
      console.error('Failed to load product from WooCommerce (fallback)', e)
    }

    // 最后回退到本地Product.json
    if (!mainProduct) {
      try {
        const res = await fetch(`/Product.json`, {
          next: { revalidate: 60 },
          cache: 'no-store'
        })
        if (res.ok) {
          const text = await res.text()
          if (text.trim()) {
            try {
              const arr = JSON.parse(text)
              const list: ProductType[] = Array.isArray(arr) ? arr : []
              mainProduct = list.find(p => String(p.slug) === productSlug) || null
              if (mainProduct) {
                console.log('Product loaded from local Product.json (fallback):', mainProduct.name)
              }
            } catch (parseError) {
              console.error('Failed to parse Product.json (fallback):', parseError)
            }
          }
        }
      } catch (e) {
        console.error('Failed to load product from local Product.json (fallback)', e)
      }
    }
  }

  // 合并相关产品和兜底产品
  const finalRelatedProducts = relatedProducts.length > 0 ? relatedProducts : fallbackProducts

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
