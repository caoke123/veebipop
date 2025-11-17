import { Suspense } from 'react'
import { useParams } from 'next/navigation'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuEleven from '@/components/Header/Menu/MenuEleven'
import Footer from '@/components/Footer/Footer'
import ProductThumbnailBottomContent from './ProductThumbnailBottomContent'

// 强制动态渲染
export const dynamic = 'force-dynamic'
export const revalidate = 0

const ProductThumbnailBottom = () => {
    const params = useParams()

    // Prefer dynamic segment id; fallback to query param id
    const idFromParams = Array.isArray(params?.id) ? params?.id?.[0] : (params as any)?.id
    const productId = (idFromParams ?? '1') as string

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