"use client"
import { useEffect, useState } from "react"

type WcCategory = {
  id: number
  name: string
  slug: string
  parent: number
  count?: number
}

let cache: WcCategory[] | null = null
let inflight: Promise<WcCategory[]> | null = null

export function useCategories(): WcCategory[] | null {
  const [data, setData] = useState<WcCategory[] | null>(cache)

  useEffect(() => {
    if (data) return
    let cancelled = false
    const run = async () => {
      try {
        if (cache) {
          if (!cancelled) setData(cache)
          return
        }
        if (!inflight) {
          inflight = fetch('/api/woocommerce/categories?per_page=100&hide_empty=false', { cache: 'force-cache' })
            .then(res => {
              if (!res.ok) {
                throw new Error('Failed to fetch categories')
              }
              return res.json()
            })
            .then((arr) => {
              const cats = Array.isArray(arr) ? (arr as WcCategory[]) : []
              cache = cats
              inflight = null
              return cats
            })
            .catch(() => {
              inflight = null
              return [] as WcCategory[]
            })
        }
        const cats = await inflight
        if (!cancelled) setData(cats)
      } catch {
        if (!cancelled) setData([])
      }
    }
    run()
    return () => { cancelled = true }
  }, [data])

  return data
}