import React from 'react'
import { redirect } from 'next/navigation'

export default function SidebarList({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const qs = new URLSearchParams()
  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (!value) return
    if (Array.isArray(value)) {
      value.forEach((v) => qs.append(key, v))
    } else {
      qs.set(key, value)
    }
  })
  redirect(`/shop${qs.size ? `?${qs.toString()}` : ''}`)
}