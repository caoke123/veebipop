// app/sitemap.ts

import { MetadataRoute } from 'next';

// 这个函数将被 Next.js 调用以生成站点地图。
// 它可以是一个异步函数，如果您需要为动态路由获取数据。
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.veebipop.com'; // 重要：请替换为您的实际域名

  // 静态页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily', // 页面更新频率：always, hourly, daily, weekly, monthly, yearly, never
      priority: 1, // 优先级：0.0 - 1.0
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pages/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pages/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // 在这里添加任何其他静态页面
    // 示例：
    // {
    //   url: `${baseUrl}/blog`,
    //   lastModified: new Date(),
    //   changeFrequency: 'weekly',
    //   priority: 0.6,
    // },
  ];

  // 动态页面示例（例如，产品分类或单个产品页面）
  // 您需要从您的 API 或数据库获取数据来生成这些 URL。
  // 例如，如果您有产品分类，如 'art-toys', 'charms' 等。
  //
  // const categories = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`).then(res => res.json());
  // const categoryPages: MetadataRoute.Sitemap = categories.map((category: { slug: string, updatedAt: string }) => ({
  //   url: `${baseUrl}/shop?category=${category.slug}`,
  //   lastModified: new Date(category.updatedAt), // 如果有实际的更新日期，请使用它
  //   changeFrequency: 'weekly',
  //   priority: 0.8,
  // }));

  // 对于单个产品页面（例如，/products/my-awesome-toy）
  // const products = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`).then(res => res.json());
  // const productPages: MetadataRoute.Sitemap = products.map((product: { slug: string, updatedAt: string }) => ({
  //   url: `${baseUrl}/products/${product.slug}`,
  //   lastModified: new Date(product.updatedAt),
  //   changeFrequency: 'daily',
  //   priority: 0.9,
  // }));

  return [
    ...staticPages,
    // ...categoryPages, // 如果您有分类页面，请取消注释并实现
    // ...productPages,  // 如果您有产品页面，请取消注释并实现
  ];
}