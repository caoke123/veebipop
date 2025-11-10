import React from 'react'
import fs from 'fs'
import path from 'path'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuEleven from '@/components/Header/Menu/MenuEleven'
import ShopSidebarList from '@/components/Shop/ShopSidebarList'
import Footer from '@/components/Footer/Footer'

export default async function DefaultList({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined }
}) {
    const typeParam = Array.isArray(searchParams?.type) ? searchParams?.type[0] : searchParams?.type
    const type = typeParam ?? null

    const filePath = path.join(process.cwd(), 'src', 'data', 'Product.json')
    const fileData = fs.readFileSync(filePath, 'utf-8')
    const productData = JSON.parse(fileData)

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
    <MenuEleven />
            </div>
            <ShopSidebarList data={productData} productPerPage={4} dataType={type} />
            <Footer />
        </>
    )
}
