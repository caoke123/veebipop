'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation';
import Link from 'next/link'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuEleven from '@/components/Header/Menu/MenuEleven'
import BreadcrumbProduct from '@/components/Breadcrumb/BreadcrumbProduct'
import Sale from '@/components/Product/Detail/Sale';
import Footer from '@/components/Footer/Footer'
import { ProductType } from '@/type/ProductType'

const ProductThumbnailBottom = () => {
    const searchParams = useSearchParams()
    let productId = searchParams.get('id')

    if (productId === null) {
        productId = '1'
    }

    const [products, setProducts] = useState<ProductType[]>([])

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/Product.json')
                const data = await res.json()
                setProducts(data)
            } catch (e) {
                console.error('Failed to load products', e)
            }
        }
        load()
    }, [])

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuEleven />
                {products.length > 0 && (
                    <BreadcrumbProduct data={products} productPage='thumbnail-bottom' productId={productId} />
                )}
            </div>
            {products.length > 0 ? (
                <Sale data={products} productId={productId} />
            ) : (
                <div className="container md:py-20 py-10">
                    <div className="heading5">Loading product...</div>
                </div>
            )}
            <Footer />
        </>
    )
}

export default ProductThumbnailBottom