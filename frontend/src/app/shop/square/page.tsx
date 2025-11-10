'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation';
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuEleven from '@/components/Header/Menu/MenuEleven'
import ShopFilterDropdown from '@/components/Shop/ShopFilterDropdown'
import { ProductType } from '@/type/ProductType'
import Footer from '@/components/Footer/Footer'

export default function FilterDropdown() {
    const searchParams = useSearchParams()
    const type = searchParams.get('type')
    const category = searchParams.get('category')

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
            </div>
            <div className="shop-square">
                <ShopFilterDropdown data={products} productPerPage={12} dataType={type} />
            </div>
            <Footer />
        </>
    )
}
