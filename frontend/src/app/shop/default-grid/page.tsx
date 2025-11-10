import React from 'react'
import fs from 'fs'
import path from 'path'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuEleven from '@/components/Header/Menu/MenuEleven'
import ShopBreadCrumb1 from '@/components/Shop/ShopBreadCrumb1'
import Footer from '@/components/Footer/Footer'

export default async function DefaultGrid({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined }
}) {
    const typeParam = Array.isArray(searchParams?.type) ? searchParams?.type[0] : searchParams?.type
    const genderParam = Array.isArray(searchParams?.gender) ? searchParams?.gender[0] : searchParams?.gender
    const categoryParam = Array.isArray(searchParams?.category) ? searchParams?.category[0] : searchParams?.category

    const type = typeParam ?? null
    const gender = genderParam ?? null
    const category = categoryParam ?? null

    const filePath = path.join(process.cwd(), 'src', 'data', 'Product.json')
    const fileData = fs.readFileSync(filePath, 'utf-8')
    const productData = JSON.parse(fileData)

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
    <MenuEleven />
            </div>
            <ShopBreadCrumb1 data={productData} productPerPage={9} dataType={type} gender={gender} category={category} />
            <Footer />      
        </>
    )
}
