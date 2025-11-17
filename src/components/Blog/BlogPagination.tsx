'use client'

import React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import HandlePagination from '@/components/Other/HandlePagination'

interface Props {
  pageCount: number
  currentPage: number
}

const BlogPagination: React.FC<Props> = ({ pageCount, currentPage }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const onPageChange = (selected: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(selected))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <HandlePagination pageCount={pageCount} onPageChange={onPageChange} forcePage={currentPage} />
  )
}

export default BlogPagination