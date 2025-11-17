import React from 'react'
import Link from 'next/link'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuEleven from '@/components/Header/Menu/MenuEleven'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import blogData from '@/data/Blog.json'
import BlogItem from '@/components/Blog/BlogItem';
import Footer from '@/components/Footer/Footer'
import BlogPagination from '@/components/Blog/BlogPagination'
import { buildHref } from '@/utils/url'

const BlogGrid = ({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined }
}) => {
    const pageParam = Array.isArray(searchParams?.page) ? searchParams?.page[0] : searchParams?.page
    const currentPage = Number(pageParam ?? '0')
    const categoryParam = Array.isArray(searchParams?.category) ? searchParams?.category[0] : searchParams?.category
    const category = categoryParam ?? ''
    const productsPerPage = 9;
    const offset = currentPage * productsPerPage;

    let filteredData = blogData.filter(blog => {
        const isCategoryMatched = category ? (blog.category === category) : (blog.category !== 'underwear')
        return isCategoryMatched
    })


    if (filteredData.length === 0) {
        filteredData = [{
            id: "no-data",
            category: "no-data",
            tag: "no-data",
            title: "no-data",
            date: "no-data",
            author: "no-data",
            avatar: "no-data",
            thumbImg: "",
            coverImg: "",
            subImg: [
                "",
                ""
            ],
            shortDesc: "no-data",
            description: "no-data",
            slug: "no-data"
        }];
    }

    const pageCount = Math.ceil(filteredData.length / productsPerPage);

    const currentProducts = filteredData.slice(offset, offset + productsPerPage);

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuEleven />
                <Breadcrumb heading='Blog Grid' subHeading='Blog Grid' />
            </div>
            <div className='blog grid md:py-20 py-10'>
                <div className="container">
                    <div className="list-tags flex items-center gap-4 flex-wrap">
                        {['fashion', 'cosmetic', 'toys-kid', 'yoga', 'organic'].map((cat) => {
                            const remove = category === cat ? ['category'] : []
                            const mutations: { remove?: string[]; reset?: Record<string, string>; set?: Record<string, string> } = {
                                remove,
                                reset: { page: '0' },
                            }
                            if (category !== cat) {
                                mutations.set = { category: cat }
                            }
                            const href = buildHref('/blog/grid', searchParams, mutations)
                            const active = category === cat
                            return (
                                <Link
                                    key={cat}
                                    href={href}
                                    className={`tags bg-white border border-line py-1.5 px-4 rounded-full text-button-uppercase text-secondary cursor-pointer duration-300 hover:bg-black hover:text-white ${active ? 'active' : ''}`}
                                >
                                    {cat}
                                </Link>
                            )
                        })}
                    </div>
                    <div className="list-blog grid lg:grid-cols-3 sm:grid-cols-2 md:gap-[42px] gap-8">
                        {currentProducts.map(item => (
                            <BlogItem key={item.id} data={item} type='style-one' searchParams={searchParams} />
                        ))}
                    </div>
                    {pageCount > 1 && (
                        <div className="list-pagination w-full flex items-center justify-center md:mt-10 mt-6">
                            <BlogPagination pageCount={pageCount} currentPage={currentPage} />
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    )
}

export default BlogGrid