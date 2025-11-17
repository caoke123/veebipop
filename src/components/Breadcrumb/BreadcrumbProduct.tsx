'use client'

import React from 'react'
import Link from 'next/link'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { ProductType } from '@/type/ProductType'
import { useRouter } from 'next/navigation'

interface Props {
    data: Array<ProductType>
    productPage: string | null
    productSlug: string | null
}

const BreadcrumbProduct: React.FC<Props> = ({ data, productPage, productSlug }) => {
    const router = useRouter()
    const idx = productSlug ? data.findIndex(p => p.slug === productSlug) : -1

    const handleDetailProduct = (slug: string) => {
        router.push(`/product/${slug}`)
    }

    return (
        <>
            <div className="breadcrumb-product">
                <div className="main bg-surface md:pt-[88px] pt-[70px] pb-[14px]">
                    <div className="container flex items-center justify-between flex-wrap gap-3">
                        <div className="left flex items-center gap-1">
                            <Link href={'/'} className='caption1 text-secondary2 hover:underline'>Homepage</Link>
                            <Icon.CaretRight size={12} className='text-secondary2' />
                            <Link href={'/shop'} className='caption1 text-secondary2 hover:underline'>Product</Link>
                            <Icon.CaretRight size={12} className='text-secondary2' />
                            <div className='caption1 capitalize'>{`Product ${productPage}`}</div>
                        </div>
                        <div className="right flex items-center gap-3">
                            {idx > 0 && (
                                <div onClick={() => handleDetailProduct(data[idx - 1].slug)} className='flex items-center cursor-pointer text-secondary hover:text-black border-r border-line pr-3'>
                                    <Icon.CaretCircleLeft className='text-2xl text-black' />
                                    <span className='caption1 pl-1'>Previous Product</span>
                                </div>
                            )}
                            {idx >= 0 && (idx + 1) < data.length && (
                                <div onClick={() => handleDetailProduct(data[idx + 1].slug)} className='flex items-center cursor-pointer text-secondary hover:text-black'>
                                    <span className='caption1 pr-1'>Next Product</span>
                                    <Icon.CaretCircleRight className='text-2xl text-black' />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default BreadcrumbProduct