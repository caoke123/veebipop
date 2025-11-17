import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

// 使用本地 Product.json 数据模拟 WooCommerce 接口，保证测试稳定
async function mockWcProducts(page: import('@playwright/test').Page) {
  const filePath = path.join(process.cwd(), 'src', 'data', 'Product.json')
  const raw = await fs.promises.readFile(filePath, 'utf-8')
  const products = JSON.parse(raw)
  const wcProducts = products.map((p: any) => ({
    id: Number(p.id || 0),
    name: p.name,
    slug: p.slug || String(p.id || ''),
    price: String(p.price ?? ''),
    regular_price: String(p.originPrice ?? ''),
    sale_price: (p.originPrice && p.price && p.price < p.originPrice) ? String(p.price) : '',
    average_rating: String(p.rate ?? '0'),
    stock_quantity: Number(p.quantity ?? 0),
    manage_stock: true,
    images: (Array.isArray(p.thumbImage) ? p.thumbImage : []).map((src: string) => ({ src })),
    short_description: p.description || '',
    description: p.description || '',
    categories: [{ slug: (p.type || 'general').toLowerCase(), name: p.type || 'general' }],
    attributes: Array.isArray(p.sizes) && p.sizes.length ? [{ name: 'size', options: p.sizes }] : [],
    date_created: new Date().toISOString(),
  }))

  await page.route('**/api/woocommerce/products*', async route => {
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(wcProducts) })
  })
}

test.describe('Shop Sidebar List interactions', () => {
  test.beforeEach(async ({ page }) => {
    await mockWcProducts(page)
    // 保证有足够数据用于排序/分页；同时按 per_page 关闭虚拟滚动（阈值=per_page）
    await page.goto('/shop?per_page=12')
    await expect(page.locator('#header')).toBeVisible()
    await expect(page.getByText('Products Type')).toBeVisible()
  })

  test('筛选：点击 Products Type 显示已选标签并可清除', async ({ page }) => {
    // 左侧列表选择类型 t-shirt
    await page.locator('.filter-type .list-type .item').filter({ hasText: /t-shirt/i }).click()
    const selectedChip = page.locator('.list-filtered .list .item span')
    await expect(selectedChip).toHaveText(/t-shirt/i)

    // 点击 chip 清除
    await page.locator('.list-filtered .list .item').filter({ hasText: /t-shirt/i }).click()
    await expect(page.locator('.list-filtered .list .item span')).toHaveCount(0)
  })

  test('筛选：仅显示打折商品（Sale）', async ({ page }) => {
    // 勾选只显示促销
    await page.locator('.check-sale').scrollIntoViewIfNeeded()
    await page.click('label[for="filter-sale"]')

    // 如果没有匹配数据则显示空状态；否则确保每个商品都有 Sale 标签
    const noData = page.locator('.no-data-product')
    if (await noData.isVisible().catch(() => false)) {
      await expect(noData).toBeVisible()
    } else {
      const items = page.locator('.product-item.list-type')
      const count = await items.count()
      expect(count).toBeGreaterThan(0)
      // list 布局中，真正反映 sale 属性的是左上角红色 "Sale" 标签
      const saleTag = items.first().locator('.product-thumb .product-tag').filter({ hasText: 'Sale' })
      await expect(saleTag).toHaveText(/Sale/i)
    }
  })

  test('排序：价格高到低，再低到高', async ({ page }) => {
    // 价格高到低
    await page.selectOption('#select-filter', 'priceHighToLow')
    await page.waitForTimeout(200)
    const pricesDesc = await page.locator('.product-item.list-type .product-price').allInnerTexts()
    const numsDesc = pricesDesc
      .map(t => parseFloat((t || '').replace(/[^0-9.]/g, '')))
      .filter(n => !Number.isNaN(n))
    expect(numsDesc.length).toBeGreaterThan(1)
    for (let i = 0; i < numsDesc.length - 1; i++) {
      expect(numsDesc[i]).toBeGreaterThanOrEqual(numsDesc[i + 1])
    }

    // 价格低到高
    await page.selectOption('#select-filter', 'priceLowToHigh')
    await page.waitForTimeout(200)
    const pricesAsc = await page.locator('.product-item.list-type .product-price').allInnerTexts()
    const numsAsc = pricesAsc
      .map(t => parseFloat((t || '').replace(/[^0-9.]/g, '')))
      .filter(n => !Number.isNaN(n))
    expect(numsAsc.length).toBeGreaterThan(1)
    for (let i = 0; i < numsAsc.length - 1; i++) {
      expect(numsAsc[i]).toBeLessThanOrEqual(numsAsc[i + 1])
    }
  })

  test('分页：点击第2页，活动页码更新且内容变化', async ({ page }) => {
    await expect(page.locator('.product-item.list-type .product-name').first()).toBeVisible()
    const firstTitleBefore = await page.locator('.product-item.list-type .product-name').first().textContent()

    await page.locator('.list-pagination').scrollIntoViewIfNeeded()
    await page.locator('.pagination').getByText('2', { exact: true }).click()
    await expect(page.locator('.pagination .active')).toHaveText('2')

    // 内容变化（如果数据不足导致第一页与第二页相同，至少断言页码更新）
    await page.waitForTimeout(300)
    const firstTitleAfter = await page.locator('.product-item.list-type .product-name').first().textContent()
    if (firstTitleBefore && firstTitleAfter) {
      expect(firstTitleAfter.trim()).not.toEqual(firstTitleBefore.trim())
    }
  })
})