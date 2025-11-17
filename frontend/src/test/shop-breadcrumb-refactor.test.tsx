import React from 'react'
import { render, screen } from '@testing-library/react'
import ShopBreadCrumb1 from '../components/Shop/ShopBreadCrumb1'

// Mock data for testing
const mockData = [
  {
    id: 1,
    name: 'Test Product 1',
    price: 100,
    images: [{ src: 'test1.jpg', alt: 'Test Product 1' }],
    categories: [{ name: 'Test Category', slug: 'test-category' }],
    on_sale: false,
    stock_quantity: 10
  },
  {
    id: 2,
    name: 'Test Product 2',
    price: 200,
    images: [{ src: 'test2.jpg', alt: 'Test Product 2' }],
    categories: [{ name: 'Test Category', slug: 'test-category' }],
    on_sale: true,
    stock_quantity: 5
  }
]

const mockCategories = [
  { name: 'Category 1', slug: 'category-1' },
  { name: 'Category 2', slug: 'category-2' }
]

const mockBrands = [
  { name: 'Brand 1', slug: 'brand-1' },
  { name: 'Brand 2', slug: 'brand-2' }
]

// Test props
const testProps = {
  data: mockData,
  productPerPage: 10,
  category: null,
  categories: mockCategories,
  brands: mockBrands
}

describe('ShopBreadCrumb1 Refactor Test', () => {
  test('should render without errors', () => {
    // This test checks that our refactored component can render without 
    // the useInfiniteQuery-related errors we had before
    expect(() => {
      render(<ShopBreadCrumb1 {...testProps} />)
    }).not.toThrow()
  })

  test('should display product count correctly', () => {
    render(<ShopBreadCrumb1 {...testProps} />)
    // Check if products are rendered (this indicates the component is working with props data)
    expect(screen.getByText('2 products')).toBeInTheDocument()
  })

  test('should not contain useInfiniteQuery references', () => {
    // This is a structural test to ensure our refactoring removed all useInfiniteQuery logic
    const componentCode = require('fs').readFileSync(
      'src/components/Shop/ShopBreadCrumb1.tsx',
      'utf8'
    )
    
    // Check that useInfiniteQuery, isFetchingNextPage, hasNextPage are not present
    expect(componentCode).not.toMatch(/useInfiniteQuery/)
    expect(componentCode).not.toMatch(/isFetchingNextPage/)
    expect(componentCode).not.toMatch(/hasNextPage/)
    expect(componentCode).not.toMatch(/fetchNextPage/)
  })
})