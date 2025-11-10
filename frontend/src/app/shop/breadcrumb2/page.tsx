import React from 'react'
import fs from 'fs'
import path from 'path'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuEleven from '@/components/Header/Menu/MenuEleven'
import ShopBreadCrumb2 from '@/components/Shop/ShopBreadCrumb2'
import Footer from '@/components/Footer/Footer'

export default async function BreadCrumb2({
  searchParams,
}: { searchParams?: { type?: string; category?: string } }) {
  const type = searchParams?.type ?? null
  const category = searchParams?.category ?? null

  const filePath = path.join(process.cwd(), 'src', 'data', 'Product.json')
  const fileData = fs.readFileSync(filePath, 'utf-8')
  const productData = JSON.parse(fileData)

  return (
    <>
      <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
      <div id="header" className='relative w-full'>
        <MenuEleven />
      </div>
      <ShopBreadCrumb2 data={productData} productPerPage={9} dataType={type} />
      <Footer />
    </>
  )
}
