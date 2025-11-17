"use client"
import React, { useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCategories } from '@/hooks/useCategories'

type WcCategory = {
  id: number
  name: string
  slug: string
  parent: number
  count?: number
}

const fallbackItems = ['t-shirt', 'dress', 'top', 'swimwear', 'shirt']

export default function CategoryTabs({ initialCategories }: { initialCategories?: WcCategory[] }) {
  const searchParams = useSearchParams()
  const activeCategory = (searchParams?.get('category') ?? '').toLowerCase() || null
  const cats = useCategories()
  const sourceCats: WcCategory[] | null = (cats ?? initialCategories ?? null) as any
  const loading = sourceCats == null
  const items = useMemo(() => {
    const all = Array.isArray(sourceCats) ? (sourceCats as WcCategory[]) : []
    const parentZero = all.filter(c => Number(c.parent) === 0)
    return parentZero
  }, [sourceCats])

  return (
    <div className="list-tab flex flex-wrap items-center justify-center gap-y-5 gap-8 lg:mt-[70px] mt-12 overflow-hidden">
      {loading && items.length === 0 && (
        fallbackItems.map((name, idx) => (
          <div key={`skeleton-${idx}`} className="tab-item text-button-uppercase has-line-before line-2px opacity-50 select-none">
            {name}
          </div>
        ))
      )}
      {!loading && items.length === 0 && (
        fallbackItems.map((name, idx) => (
          <Link
            key={idx}
            href={`/shop?category=${encodeURIComponent(name)}`}
            className={`tab-item text-button-uppercase has-line-before line-2px`}
          >
            {name}
          </Link>
        ))
      )}
      {items.length > 0 && items.map((cat) => {
        const isActive = activeCategory === cat.slug.toLowerCase() || activeCategory === String(cat.id)
        return (
          <Link
            key={cat.id}
            href={`/shop?category=${encodeURIComponent(cat.slug)}`}
            className={`tab-item text-button-uppercase cursor-pointer has-line-before line-2px ${isActive ? 'active' : ''}`}
          >
            {cat.name}
          </Link>
        )
      })}
    </div>
  )
}