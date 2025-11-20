"use client"

import React from 'react'
import { useProductDetail } from '@/hooks/useProductDetail'
import { ProductType } from '@/type/ProductType'
import Sale from './Sale'

interface ProductDetailClientProps {
  slug: string
  initial?: any
  relatedProducts?: ProductType[]
}

const ProductDetailClient: React.FC<ProductDetailClientProps> = ({ 
  slug, 
  initial, 
  relatedProducts: initialRelatedProducts = [] 
}) => {
  const { data: mainProduct, isLoading: mainLoading, error: mainError } = useProductDetail(slug, initial)
  
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
  
  // Use provided related products, fallback to empty array
  const finalRelatedProducts = initialRelatedProducts || []
  
  // Combine main product with related products
  const products = [mainProduct, ...finalRelatedProducts]
  
  // Only render Sale component when we have the main product
  return <Sale data={products} productKey={slug} />
}

export default ProductDetailClient