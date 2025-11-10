'use client'

import React, { useEffect, useState } from 'react'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuEleven from '@/components/Header/Menu/MenuEleven'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import ShopCollection from '@/components/Shop/ShopCollection'
import Footer from '@/components/Footer/Footer'
import { ProductType } from '@/type/ProductType'

export default function Collection() {
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
                <Breadcrumb heading='Shop Collection' subHeading='Collection' />
            </div>
            <ShopCollection data={products} />
            <Footer />
        </>
    )
}
