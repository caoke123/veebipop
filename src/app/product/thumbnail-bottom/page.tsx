import { Suspense } from 'react'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuEleven from '@/components/Header/Menu/MenuEleven'
import Footer from '@/components/Footer/Footer'
import ProductThumbnailBottomContent from './ProductThumbnailBottomContent'

export const revalidate = 3600 // 1 hour cache for product pages

const ProductThumbnailBottom = ({ searchParams }: { searchParams: { id?: string } }) => {
    const productId = String(searchParams?.id ?? '1')

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuEleven />
            </div>
            <Suspense fallback={
                <div className="container md:py-20 py-10">
                    <div className="text-center">Loading...</div>
                </div>
            }>
                <ProductThumbnailBottomContent productId={productId} />
            </Suspense>
            <Footer />
        </>
    )
}

export default ProductThumbnailBottom
