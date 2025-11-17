"use client"

import React, { useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import * as Icon from "@phosphor-icons/react/dist/ssr"
import { useCategories } from "@/hooks/useCategories"

interface ActiveFiltersBarProps {
  className?: string
  includeKeys?: string[] // configurable URL keys to render as tags; default includes common filters
  showClearAll?: boolean
  onClearAll?: () => void // optional extra clear action for local states
}

const DEFAULT_KEYS = [
  'category',
  'on_sale',
  'price_min',
  'price_max',
  'type',
  'brand',
]

const ActiveFiltersBar: React.FC<ActiveFiltersBarProps> = ({ className, includeKeys = DEFAULT_KEYS, showClearAll = true, onClearAll }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const cats = useCategories()

  const hasKey = (k: string) => includeKeys.includes(k)
  const category = hasKey('category') ? searchParams.get("category") : null
  const onSale = hasKey('on_sale') ? (searchParams.get("on_sale") ?? "").toLowerCase() === "true" : false
  const priceMin = hasKey('price_min') ? searchParams.get("price_min") : null
  const priceMax = hasKey('price_max') ? searchParams.get("price_max") : null
  const type = hasKey('type') ? searchParams.get('type') : null
  const brand = hasKey('brand') ? searchParams.get('brand') : null

  const priceLabel = useMemo(() => {
    const min = priceMin ? Math.max(0, parseInt(priceMin, 10) || 0) : null
    const max = priceMax ? Math.max(0, parseInt(priceMax, 10) || 0) : null
    if (min == null && max == null) return null
    const a = min ?? 0
    const b = max ?? (min ?? 0)
    return `Price: $${a} - $${b}`
  }, [priceMin, priceMax])

  const hasActive = !!(category || onSale || priceLabel || type || brand)

  const updateUrlParams = (mutate: (qs: URLSearchParams) => void) => {
    const qs = new URLSearchParams(searchParams.toString())
    mutate(qs)
    const q = qs.toString()
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false })
  }

  const removeFilter = (key: string | string[]) => {
    updateUrlParams(qs => {
      if (Array.isArray(key)) {
        key.forEach(k => qs.delete(k))
      } else {
        qs.delete(key)
      }
    })
  }

  const clearAll = () => {
    updateUrlParams(qs => {
      includeKeys.forEach(k => qs.delete(k))
      // Ensure price pair cleared even if only one key configured
      if (!includeKeys.includes('price_min')) qs.delete('price_min')
      if (!includeKeys.includes('price_max')) qs.delete('price_max')
    })
    onClearAll?.()
  }

  const categoryName = useMemo(() => {
    if (!hasKey('category')) return null
    if (!category) return null
    const found = Array.isArray(cats)
      ? cats.find((c: any) => String(c.slug || "").toLowerCase() === String(category).toLowerCase())
      : null
    return found?.name || String(category)
  }, [cats, category, includeKeys])

  if (!hasActive) return null

  return (
    <>
      <div className={`list flex items-center gap-3 ${className ?? ""}`}>
        <div className="w-px h-4 bg-line"></div>
        {category && hasKey('category') && (
          <div
            className="item flex items-center px-2 py-1 gap-1 bg-linear rounded-full capitalize"
            onClick={() => removeFilter("category")}
          >
            <Icon.X className="cursor-pointer" />
            <span>{categoryName ?? category}</span>
          </div>
        )}
        {onSale && hasKey('on_sale') && (
          <div
            className="item flex items-center px-2 py-1 gap-1 bg-linear rounded-full capitalize"
            onClick={() => removeFilter("on_sale")}
          >
            <Icon.X className="cursor-pointer" />
            <span>On Sale</span>
          </div>
        )}
        {priceLabel && (hasKey('price_min') || hasKey('price_max')) && (
          <div
            className="item flex items-center px-2 py-1 gap-1 bg-linear rounded-full capitalize"
            onClick={() => removeFilter(["price_min", "price_max"])}
          >
            <Icon.X className="cursor-pointer" />
            <span>{priceLabel}</span>
          </div>
        )}
        {type && hasKey('type') && (
          <div
            className="item flex items-center px-2 py-1 gap-1 bg-linear rounded-full capitalize"
            onClick={() => removeFilter("type")}
          >
            <Icon.X className="cursor-pointer" />
            <span>{type}</span>
          </div>
        )}
        {brand && hasKey('brand') && (
          <div
            className="item flex items-center px-2 py-1 gap-1 bg-linear rounded-full capitalize"
            onClick={() => removeFilter("brand")}
          >
            <Icon.X className="cursor-pointer" />
            <span>{brand}</span>
          </div>
        )}
      </div>
      {showClearAll && (
        <div
          className="clear-btn flex items-center px-2 py-1 gap-1 rounded-full border border-red cursor-pointer"
          onClick={clearAll}
        >
          <Icon.X color="rgb(219, 68, 68)" className="cursor-pointer" />
          <span className="text-button-uppercase text-red">Clear All</span>
        </div>
      )}
    </>
  )
}

export default ActiveFiltersBar