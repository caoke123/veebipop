// app/sitemap.ts

import { MetadataRoute } from 'next';
import { getWcApi } from '@/utils/woocommerce';

// 这个函数将被 Next.js 调用以生成站点地图
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.veebipop.com';
  
  // 静态页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/homepages/fashion11`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/wishlist`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/my-account`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/pages/about`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/pages/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/order-tracking`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/pages/customer-feedbacks`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/pages/store-list`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/pages/coming-soon`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${baseUrl}/pages/page-not-found`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.1,
    },
  ];

  // 动态生成分类页面
  const categoryPages: MetadataRoute.Sitemap = [];
  const productPages: MetadataRoute.Sitemap = [];

  try {
    const wcApi = getWcApi();
    
    if (wcApi) {
      // 获取所有分类
      const categoriesRes = await wcApi.get('products/categories', {
        per_page: 100,
        hide_empty: false
      });
      
      const categories = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
      
      // 为每个分类生成页面
      categories.forEach((category: any) => {
        if (category.slug) {
          categoryPages.push({
            url: `${baseUrl}/shop?category=${category.slug}`,
            lastModified: category.date_created ? new Date(category.date_created) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      });

      // 获取所有产品（分页获取）
      let allProducts: any[] = [];
      let page = 1;
      const perPage = 100;
      let hasMore = true;

      while (hasMore && page <= 10) { // 限制最多10页，避免sitemap过大
        try {
          const productsRes = await wcApi.get('products', {
            per_page: perPage,
            page: page,
            status: 'publish',
            _fields: 'id,slug,date_created'
          });
          
          const products = Array.isArray(productsRes.data) ? productsRes.data : [];
          
          if (products.length === 0) {
            hasMore = false;
          } else {
            allProducts.push(...products);
            page++;
          }
        } catch (error) {
          console.log('Error fetching products for sitemap:', error);
          hasMore = false;
        }
      }

      // 为每个产品生成页面
      allProducts.forEach((product: any) => {
        if (product.slug) {
          productPages.push({
            url: `${baseUrl}/product/${product.slug}`,
            lastModified: product.date_created ? new Date(product.date_created) : new Date(),
            changeFrequency: 'monthly',
            priority: 0.9,
          });
        }
      });

      console.log(`Generated sitemap with ${categories.length} categories and ${allProducts.length} products`);
    }
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
    // 如果API失败，至少返回静态页面
  }

  return [
    ...staticPages,
    ...categoryPages,
    ...productPages,
  ];
}