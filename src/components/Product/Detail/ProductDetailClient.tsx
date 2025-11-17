"use client"

import React from 'react'
import { useProductDetail, useRelatedProducts } from '@/hooks/useProductDetail'
import Sale from './Sale'

const ProductDetailClient: React.FC<{ slug: string; initial?: any }> = ({ slug, initial }) => {
  const { data: mainProduct, isLoading: mainLoading, error: mainError } = useProductDetail(slug, initial)
  
  // Fetch related products by category - only fetch when main product is available
  const { data: relatedProducts, isLoading: relatedLoading } = useRelatedProducts(
    mainProduct?.category || 'general',
    mainProduct?.id ? parseInt(mainProduct.id) : undefined,
    !!mainProduct // Only enable when main product is available
  )
  
  // Show loading state while data is being fetched
  if (mainLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  
  // Show error state if main product failed to load
  if (mainError || !mainProduct) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600">The requested product could not be loaded.</p>
        </div>
      </div>
    )
  }
  
  // Combine main product with related products
  const products = [mainProduct, ...(relatedProducts || [])]
  
  // Only render Sale component when we have the main product
  return <Sale data={products} productKey={slug} />
}

export default ProductDetailClient