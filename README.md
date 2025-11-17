This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Shop Page Layout

Route: `/shop` (note: `/shop/sidebar-list` now redirects to `/shop`)

- Unified layout and styles
  - Page entry: `src/app/shop/page.tsx` (Server Component)
  - Client renderer: `ShopBreadCrumb1` receives `data`, `productPerPage`, `dataType`, and other filters

- Data flow
  - Server-side fetch via proxy: `GET /api/woocommerce/products?per_page=<N>` with `{ cache: 'no-store' }`
  - Adaptation: `wcArrayToProductTypes` → `ProductType[]`

- Responsive design
  - Filters, sorting, and grid handled by `ShopBreadCrumb1` client component

- How to customize
  - Adjust `productPerPage` or pass `type`/`category`/`gender` via URL query: `/shop?type=dress`

- Testing
  - E2E: `e2e/shop-sidebar-list.spec.ts` 与 `e2e/shop-sidebar-list-interactions.spec.ts` 现已导航到 `/shop`
  - 运行：`npm run dev` 后执行 `npx playwright test e2e/shop-sidebar-list.spec.ts`

## WooCommerce Proxy Setup

- API route: `src/app/api/woocommerce/products/route.ts`
- Required env variables (create `frontend/.env.local`):
  - `WC_API_BASE` = `https://yourstore.example.com`
  - `WC_CONSUMER_KEY` = `ck_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
  - `WC_CONSUMER_SECRET` = `cs_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
  - Aliases supported (you can use either set):
    - `WOOCOMMERCE_URL` as alias of `WC_API_BASE`
    - `WOOCOMMERCE_CONSUMER_KEY` as alias of `WC_CONSUMER_KEY`
    - `WOOCOMMERCE_CONSUMER_SECRET` as alias of `WC_CONSUMER_SECRET`
- After setting env, rebuild and start:
  - `npm run build` then `npm run start -- -p 3001`
- Images from your store domain:
  - Add your domain to `next.config.js > images.remotePatterns` for product images to load
