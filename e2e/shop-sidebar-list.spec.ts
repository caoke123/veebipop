import { test, expect } from '@playwright/test'

test.describe('Shop page', () => {
  test('loads and renders sidebar filters', async ({ page }) => {
    await page.goto('/shop')
    // Ensure page header and filter block render
    await expect(page.locator('#header')).toBeVisible()
    await expect(page.getByText('Products Type')).toBeVisible()
  })
})