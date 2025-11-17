import React from 'react'
import Link from 'next/link'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuEleven from '@/components/Header/Menu/MenuEleven'
import Footer from '@/components/Footer/Footer'
import { buildHref } from '@/utils/url'

const BlogHome = ({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) => {
  const categoryParam = Array.isArray(searchParams?.category) ? searchParams?.category[0] : searchParams?.category
  const category = categoryParam ?? null

  const viewHref = (view: 'list' | 'grid' | 'default') => {
    const mutations: { reset?: Record<string, string> } = { reset: { page: '0' } }
    return buildHref(`/blog/${view}`, searchParams, mutations)
  }

  const categoryHref = (cat: string) => {
    const remove = category === cat ? ['category'] : []
    const mutations: { remove?: string[]; reset?: Record<string, string>; set?: Record<string, string> } = {
      remove,
      reset: { page: '0' },
    }
    if (category !== cat) {
      mutations.set = { category: cat }
    }
    return buildHref('/blog/grid', searchParams, mutations)
  }

  return (
    <>
      <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
      <div id="header" className='relative w-full'>
        <MenuEleven />
      </div>
      <div className='blog home md:py-20 py-10'>
        <div className="container">
          <div className="heading3 text-center">Blog</div>
          <div className="list-entry grid lg:grid-cols-3 md:grid-cols-2 gap-6 md:mt-10 mt-6">
            <Link href={viewHref('list')} className="entry-card border border-line rounded-2xl p-6 duration-300 hover:bg-black hover:text-white">
              <div className="heading5">List View</div>
              <div className="text-secondary mt-2">Browse posts in list layout.</div>
            </Link>
            <Link href={viewHref('grid')} className="entry-card border border-line rounded-2xl p-6 duration-300 hover:bg-black hover:text-white">
              <div className="heading5">Grid View</div>
              <div className="text-secondary mt-2">Explore posts in grid layout.</div>
            </Link>
            <Link href={viewHref('default')} className="entry-card border border-line rounded-2xl p-6 duration-300 hover:bg-black hover:text-white">
              <div className="heading5">Default View</div>
              <div className="text-secondary mt-2">Read posts with full content preview.</div>
            </Link>
          </div>
          <div className="heading6 md:mt-12 mt-8">Popular Categories</div>
          <div className="list-tags flex items-center gap-4 flex-wrap md:mt-3 mt-2">
            {['fashion', 'cosmetic', 'toys-kid', 'yoga', 'organic'].map((cat) => {
              const href = categoryHref(cat)
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
        </div>
      </div>
      <Footer />
    </>
  )
}

export default BlogHome