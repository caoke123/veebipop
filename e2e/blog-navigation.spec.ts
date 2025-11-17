import { test, expect } from '@playwright/test'

test.describe('Blog navigation', () => {
  test('List to Detail1 preserves category and page', async ({ page }) => {
    await page.goto('/blog/grid?category=yoga&page=0')
    const firstItem = page.locator('a.blog-item.style-one').first()
    await firstItem.click()
    await page.waitForURL('**/blog/detail1**')

    const url = new URL(page.url())
    expect(url.pathname).toBe('/blog/detail1')
    expect(url.searchParams.get('category')).toBe('yoga')
    expect(url.searchParams.get('page')).toBe('0')
    expect(url.searchParams.get('id')).toBeTruthy()
  })

  test('Detail1 previous/next retains params', async ({ page }) => {
    await page.goto('/blog/detail1?category=yoga&page=0&id=1')
    await page.locator('a.right').click()
    await page.waitForURL('**/blog/detail1**')
    let url = new URL(page.url())
    expect(url.searchParams.get('category')).toBe('yoga')
    expect(url.searchParams.get('page')).toBe('0')

    await page.locator('a.left').click()
    await page.waitForURL('**/blog/detail1**')
    url = new URL(page.url())
    expect(url.searchParams.get('category')).toBe('yoga')
    expect(url.searchParams.get('page')).toBe('0')
  })
})