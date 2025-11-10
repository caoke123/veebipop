import { describe, it, expect } from 'vitest'
import { buildHref, type SearchParams } from './url'

describe('buildHref', () => {
  it('returns basePath when no params or mutations', () => {
    expect(buildHref('/blog/list')).toBe('/blog/list')
  })

  it('preserves existing params by default', () => {
    const sp: SearchParams = { category: 'yoga', page: '2' }
    expect(buildHref('/blog/list', sp)).toBe('/blog/list?category=yoga&page=2')
  })

  it('resets page to 0 while preserving other params', () => {
    const sp: SearchParams = { category: 'yoga', page: '2' }
    const href = buildHref('/blog/list', sp, { reset: { page: '0' } })
    expect(href).toBe('/blog/list?category=yoga&page=0')
  })

  it('removes category when toggling off', () => {
    const sp: SearchParams = { category: 'yoga', page: '2' }
    const href = buildHref('/blog/list', sp, { remove: ['category'] })
    expect(href).toBe('/blog/list?page=2')
  })

  it('sets new category and resets page', () => {
    const sp: SearchParams = { category: 'fashion', page: '3' }
    const href = buildHref('/blog/list', sp, { set: { category: 'yoga' }, reset: { page: '0' } })
    expect(href).toBe('/blog/list?category=yoga&page=0')
  })

  it('uses first value when param is array', () => {
    const sp: SearchParams = { category: ['yoga', 'extra'], page: ['2'] }
    const href = buildHref('/blog/list', sp)
    expect(href).toBe('/blog/list?category=yoga&page=2')
  })

  it('adds id while preserving existing params', () => {
    const sp: SearchParams = { category: 'cosmetic', page: '3' }
    const href = buildHref('/blog/detail1', sp, { set: { id: '14' } })
    expect(href).toBe('/blog/detail1?category=cosmetic&page=3&id=14')
  })
})