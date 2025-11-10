import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import BlogItem from './BlogItem'

const mockData = {
  id: '5',
  category: 'yoga',
  tag: 'wellness',
  title: 'Yoga For Life',
  date: '2023-10-01',
  author: 'Alice',
  avatar: '/images/avatar.png',
  thumbImg: '/images/blog/thumb-1.jpg',
  coverImg: '/images/blog/cover-1.jpg',
  subImg: ['/images/blog/sub-1.jpg', '/images/blog/sub-2.jpg'],
  shortDesc: 'desc',
  description: 'full',
  slug: 'yoga-for-life',
}

describe('BlogItem', () => {
  it('renders anchor with href preserving params and adding id', () => {
    render(<BlogItem data={mockData as any} type="style-one" searchParams={{ category: 'yoga', page: '2' }} />)
    const link = screen.getByRole('link') as HTMLAnchorElement
    expect(link).toBeInTheDocument()
    expect(link.href).toMatch('/blog/detail1?category=yoga&page=2&id=5')
  })
})