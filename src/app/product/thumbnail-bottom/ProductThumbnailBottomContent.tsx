"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { ProductType } from '@/type/ProductType'
import { fetchProductById } from '@/utils/productService'
import productData from '@/data/Product.json'
import { formatPrice } from '@/utils/priceFormat'

interface ProductThumbnailBottomProps {
    productId: string;
}

const ProductThumbnailBottomContent: React.FC<ProductThumbnailBottomProps> = ({ productId }) => {
    const searchParams = useSearchParams()
    
    // 初始化为本地 Product.json 列表，保证 Related Products 有数据可用
    const [products, setProducts] = useState<ProductType[]>(productData as ProductType[])
    const [loading, setLoading] = useState(true)
    const [product, setProduct] = useState<ProductType | null>(null)

    useEffect(() => {
        let cancelled = false
        const run = async () => {
            try {
                const fetchedProduct = await fetchProductById(productId)
                if (!cancelled && fetchedProduct) {
                    setProduct(fetchedProduct)
                    // 用远端数据替换本地列表中对应商品，避免将列表缩减为单项
                    setProducts(prev => {
                        const idx = prev.findIndex(p => String(p.id) === String(fetchedProduct.id) || String(p.slug || '') === String(fetchedProduct.slug || ''))
                        if (idx >= 0) {
                            const next = [...prev]
                            next[idx] = fetchedProduct
                            return next
                        }
                        // 若本地未包含该商品，则将其插入列表头部
                        return [fetchedProduct, ...prev]
                    })
                }
            } catch (e) {
                console.error('Failed to load product', e)
                if (!cancelled) setProducts([])
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        run()
        return () => { cancelled = true }
    }, [productId])

    if (loading) {
        return (
            <div className="container md:py-20 py-10">
                <div className="text-center">Loading...</div>
            </div>
        )
    }

    return (
        <>
            {product ? (
                <div className="container md:py-20 py-10">
                    <h1 className="heading1">{product.name}</h1>
                    <p className="text-gray-600 mt-4">Product ID: {product.id}</p>
                    <p className="text-gray-600">Price: {formatPrice(product.price)}</p>
                    <p className="text-gray-600">Category: {product.category}</p>
                    <div className="mt-8">
                        <h2 className="heading5">Description</h2>
                        <p className="text-gray-700 mt-2">{product.description}</p>
                    </div>
                </div>
            ) : (
                <div className="container md:py-20 py-10">
                    <div className="heading5">Product not found</div>
                </div>
            )}
        </>
    )
}

export default ProductThumbnailBottomContent