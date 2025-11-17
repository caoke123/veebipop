import { Suspense } from 'react'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuEleven from '@/components/Header/Menu/MenuEleven'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import SearchResultContent from './SearchResultContent'

const SearchResult = ({ searchParams }: { searchParams: { query?: string } }) => {
    const query = (searchParams?.query ?? 'dress') as string

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuEleven />
                <Breadcrumb heading='Search Result' subHeading='Search Result' />
            </div>
            <Suspense fallback={
                <div className="shop-product breadcrumb1 lg:py-20 md:py-14 py-10">
                    <div className="container">
                        <div className="text-center">Loading...</div>
                    </div>
                </div>
            }>
                <SearchResultContent query={query} />
            </Suspense>
            <Footer />
        </>
    )
}

export default SearchResult
