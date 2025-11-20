import 'server-only'
import { cacheManager } from './cache'
import { BlogType } from '@/type/BlogType'

// WordPress REST API Post 类型定义
interface WPPost {
  id: number
  date: string
  date_gmt: string
  guid: {
    rendered: string
  }
  modified: string
  modified_gmt: string
  slug: string
  status: string
  type: string
  link: string
  title: {
    rendered: string
  }
  content: {
    rendered: string
  }
  excerpt: {
    rendered: string
  }
  author: number
  featured_media: number
  comment_status: string
  ping_status: string
  sticky: boolean
  template: string
  format: string
  meta: any[]
  categories: Array<{
    id: number
    name: string
    slug: string
  }>
  tags: Array<{
    id: number
    name: string
    slug: string
  }>
  _embedded?: {
    author?: Array<{
      id: number
      name: string
      url: string
      description: string
      link: string
      slug: string
      avatar_urls: {
        '24': string
        '48': string
        '96': string
      }
    }>
    'wp:featuredmedia'?: Array<{
      id: number
      date: string
      slug: string
      source_url: string
      link: string
      alt_text?: string
    }>
  }
}

// 缓存键生成器
class BlogCacheKeyBuilder {
  public static readonly PREFIX = 'anvogue_blog:'
  public static readonly VERSION = process.env.CACHE_VERSION || '1'

  static postsList(page: number, perPage: number, category?: string): string {
    const categoryPart = category ? `:category:${category}` : ''
    return `${this.PREFIX}posts:v${this.VERSION}:list:page:${page}:perPage:${perPage}${categoryPart}`
  }

  static postDetail(slug: string): string {
    return `${this.PREFIX}posts:v${this.VERSION}:detail:${slug}`
  }

  static postsCount(category?: string): string {
    const categoryPart = category ? `:category:${category}` : ''
    return `${this.PREFIX}posts:v${this.VERSION}:count${categoryPart}`
  }
}

// WordPress Post 转换为 BlogType
function adaptWpPostToBlogType(wpPost: WPPost): BlogType {
  const author = wpPost._embedded?.author?.[0]
  const featuredMedia = wpPost._embedded?.['wp:featuredmedia']?.[0]
  const category = wpPost.categories[0] // 使用第一个分类
  const tag = wpPost.tags[0] // 使用第一个标签

  return {
    id: wpPost.id.toString(),
    title: wpPost.title.rendered.replace(/<[^>]*>/g, ''), // 移除HTML标签
    description: wpPost.content.rendered,
    shortDesc: wpPost.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
    date: new Date(wpPost.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    author: author?.name || 'Unknown Author',
    avatar: author?.avatar_urls?.['96'] || '/images/avatar/1.png',
    thumbImg: featuredMedia?.source_url || '/images/blog/1.png',
    coverImg: featuredMedia?.source_url || '/images/blog/1.png',
    subImg: [], // WordPress API 可能不直接提供，需要额外处理
    category: category?.slug || 'uncategorized',
    tag: tag?.name || 'general',
    slug: wpPost.slug
  }
}

// 获取所有文章
export async function getAllPosts(page: number = 1, perPage: number = 9, category?: string): Promise<BlogType[]> {
  const cacheKey = BlogCacheKeyBuilder.postsList(page, perPage, category)
  
  return await cacheManager.getOrSet(
    cacheKey,
    async () => {
      try {
        const baseUrl = process.env.WOOCOMMERCE_URL || process.env.NEXT_PUBLIC_WOOCOMMERCE_URL
        if (!baseUrl) {
          console.error('WooCommerce URL not configured')
          // 返回测试数据
          return getTestBlogPosts(page, perPage, category)
        }

        // 构建API URL
        let apiUrl = `${baseUrl}/wp-json/wp/v2/posts?_embed&per_page=${perPage}&page=${page}`
        
        // 如果有分类，添加分类筛选
        if (category) {
          apiUrl += `&categories=${category}`
        }

        // 获取认证信息
        const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || process.env.WC_CONSUMER_KEY
        const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || process.env.WC_CONSUMER_SECRET

        const headers: Record<string, string> = {}
        if (consumerKey && consumerSecret) {
          const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')
          headers['Authorization'] = `Basic ${auth}`
        }

        const response = await fetch(apiUrl, {
          headers,
          cache: 'force-cache' // 强制缓存
        })

        if (!response.ok) {
          console.error('Failed to fetch posts:', response.status, response.statusText)
          // 返回测试数据
          return getTestBlogPosts(page, perPage, category)
        }

        const wpPosts: WPPost[] = await response.json()
        return wpPosts.map(adaptWpPostToBlogType)
      } catch (error) {
        console.error('Error fetching posts:', error)
        // 返回测试数据
        return getTestBlogPosts(page, perPage, category)
      }
    },
    3600 // 1小时缓存
  ) || []
}

// 测试博客数据
function getTestBlogPosts(page: number, perPage: number, category?: string): BlogType[] {
  const allPosts: BlogType[] = [
    {
      id: "1",
      title: "Fashion Trends 2024: What's Hot This Season",
      description: "<p>Explore the latest fashion trends that are dominating the runways and streets this season. From bold colors to sustainable materials, discover what's making waves in the fashion world.</p>",
      shortDesc: "Explore the latest fashion trends that are dominating the runways and streets this season...",
      date: "Mar 15, 2024",
      author: "Fashion Editor",
      avatar: "/images/avatar/1.png",
      thumbImg: "/images/blog/1.png",
      coverImg: "/images/blog/1.png",
      subImg: [],
      category: "fashion",
      tag: "Fashion",
      slug: "fashion-trends-2024-whats-hot-this-season"
    },
    {
      id: "2",
      title: "Organic Skincare: Benefits and Best Products",
      description: "<p>Discover the benefits of organic skincare and learn about the best products to incorporate into your daily routine for healthier, glowing skin.</p>",
      shortDesc: "Discover the benefits of organic skincare and learn about the best products...",
      date: "Mar 14, 2024",
      author: "Beauty Expert",
      avatar: "/images/avatar/2.png",
      thumbImg: "/images/blog/2.png",
      coverImg: "/images/blog/2.png",
      subImg: [],
      category: "cosmetic",
      tag: "Beauty",
      slug: "organic-skincare-benefits-and-best-products"
    },
    {
      id: "3",
      title: "Educational Toys: Making Learning Fun",
      description: "<p>Learn about the best educational toys that combine fun and learning, helping children develop essential skills while playing.</p>",
      shortDesc: "Learn about the best educational toys that combine fun and learning...",
      date: "Mar 13, 2024",
      author: "Parenting Guide",
      avatar: "/images/avatar/3.png",
      thumbImg: "/images/blog/3.png",
      coverImg: "/images/blog/3.png",
      subImg: [],
      category: "toys-kid",
      tag: "Education",
      slug: "educational-toys-making-learning-fun"
    }
  ]

  // 如果有分类筛选，过滤数据
  let filteredPosts = allPosts
  if (category) {
    filteredPosts = allPosts.filter(post => post.category === category)
  }

  // 分页处理
  const startIndex = (page - 1) * perPage
  const endIndex = startIndex + perPage
  return filteredPosts.slice(startIndex, endIndex)
}

// 根据slug获取单个文章
export async function getPostBySlug(slug: string): Promise<BlogType | null> {
  const cacheKey = BlogCacheKeyBuilder.postDetail(slug)
  
  return await cacheManager.getOrSet(
    cacheKey,
    async () => {
      try {
        const baseUrl = process.env.WOOCOMMERCE_URL || process.env.NEXT_PUBLIC_WOOCOMMERCE_URL
        if (!baseUrl) {
          // 返回测试数据
          return getTestBlogPostBySlug(slug)
        }

        const apiUrl = `${baseUrl}/wp-json/wp/v2/posts?slug=${slug}&_embed`

        // 获取认证信息
        const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || process.env.WC_CONSUMER_KEY
        const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || process.env.WC_CONSUMER_SECRET

        const headers: Record<string, string> = {}
        if (consumerKey && consumerSecret) {
          const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')
          headers['Authorization'] = `Basic ${auth}`
        }

        const response = await fetch(apiUrl, {
          headers,
          cache: 'force-cache' // 强制缓存
        })

        if (!response.ok) {
          // 返回测试数据
          return getTestBlogPostBySlug(slug)
        }

        const wpPosts: WPPost[] = await response.json()
        if (wpPosts.length === 0) {
          return null
        }

        return adaptWpPostToBlogType(wpPosts[0])
      } catch (error) {
        // 返回测试数据
        return getTestBlogPostBySlug(slug)
      }
    },
    7200 // 2小时缓存
  )
}

// 根据slug获取测试博客文章
function getTestBlogPostBySlug(slug: string): BlogType | null {
  const testPosts: BlogType[] = [
    {
      id: "1",
      title: "Fashion Trends 2024: What's Hot This Season",
      description: "<p>Explore the latest fashion trends that are dominating the runways and streets this season. From bold colors to sustainable materials, discover what's making waves in the fashion world.</p><p>This comprehensive guide covers everything from color palettes to fabric choices, helping you stay ahead of the fashion curve.</p><p>Whether you're updating your wardrobe or simply curious about current trends, this article has something for every fashion enthusiast.</p>",
      shortDesc: "Explore the latest fashion trends that are dominating the runways and streets this season...",
      date: "Mar 15, 2024",
      author: "Fashion Editor",
      avatar: "/images/avatar/1.png",
      thumbImg: "/images/blog/1.png",
      coverImg: "/images/blog/1.png",
      subImg: [],
      category: "fashion",
      tag: "Fashion",
      slug: "fashion-trends-2024-whats-hot-this-season"
    },
    {
      id: "2",
      title: "Organic Skincare: Benefits and Best Products",
      description: "<p>Discover the benefits of organic skincare and learn about the best products to incorporate into your daily routine for healthier, glowing skin.</p><p>Organic skincare products are free from harmful chemicals and synthetic ingredients that can damage your skin over time.</p><p>Learn about the key ingredients to look for and how to build an effective organic skincare routine.</p>",
      shortDesc: "Discover the benefits of organic skincare and learn about the best products...",
      date: "Mar 14, 2024",
      author: "Beauty Expert",
      avatar: "/images/avatar/2.png",
      thumbImg: "/images/blog/2.png",
      coverImg: "/images/blog/2.png",
      subImg: [],
      category: "cosmetic",
      tag: "Beauty",
      slug: "organic-skincare-benefits-and-best-products"
    },
    {
      id: "3",
      title: "Educational Toys: Making Learning Fun",
      description: "<p>Learn about the best educational toys that combine fun and learning, helping children develop essential skills while playing.</p><p>Educational toys play a crucial role in child development, enhancing cognitive abilities, motor skills, and social interaction.</p><p>Discover age-appropriate recommendations and tips for choosing the right educational toys for your child.</p>",
      shortDesc: "Learn about the best educational toys that combine fun and learning...",
      date: "Mar 13, 2024",
      author: "Parenting Guide",
      avatar: "/images/avatar/3.png",
      thumbImg: "/images/blog/3.png",
      coverImg: "/images/blog/3.png",
      subImg: [],
      category: "toys-kid",
      tag: "Education",
      slug: "educational-toys-making-learning-fun"
    }
  ]

  return testPosts.find(post => post.slug === slug) || null
}

// 获取文章总数
export async function getTotalPostsCount(category?: string): Promise<number> {
  const cacheKey = BlogCacheKeyBuilder.postsCount(category)
  
  return await cacheManager.getOrSet(
    cacheKey,
    async () => {
      try {
        const baseUrl = process.env.WOOCOMMERCE_URL || process.env.NEXT_PUBLIC_WOOCOMMERCE_URL
        if (!baseUrl) {
          console.error('WooCommerce URL not configured')
          return 0
        }

        let apiUrl = `${baseUrl}/wp-json/wp/v2/posts?per_page=1`
        
        // 如果有分类，添加分类筛选
        if (category) {
          apiUrl += `&categories=${category}`
        }

        // 获取认证信息
        const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || process.env.WC_CONSUMER_KEY
        const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || process.env.WC_CONSUMER_SECRET

        const headers: Record<string, string> = {}
        if (consumerKey && consumerSecret) {
          const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')
          headers['Authorization'] = `Basic ${auth}`
        }

        const response = await fetch(apiUrl, {
          headers,
          cache: 'force-cache' // 强制缓存
        })

        if (!response.ok) {
          console.error('Failed to fetch posts count:', response.status, response.statusText)
          return 0
        }

        // 从响应头获取总数
        const totalCount = response.headers.get('X-WP-Total')
        return totalCount ? parseInt(totalCount, 10) : 0
      } catch (error) {
        console.error('Error fetching posts count:', error)
        return 0
      }
    },
    86400 // 24小时缓存
  ) || 0
}

// 获取分类列表
export async function getCategories(): Promise<Array<{id: number, name: string, slug: string}>> {
  const cacheKey = `${BlogCacheKeyBuilder.PREFIX}categories:v${BlogCacheKeyBuilder.VERSION}`
  
  return await cacheManager.getOrSet(
    cacheKey,
    async () => {
      try {
        const baseUrl = process.env.WOOCOMMERCE_URL || process.env.NEXT_PUBLIC_WOOCOMMERCE_URL
        if (!baseUrl) {
          console.error('WooCommerce URL not configured')
          return []
        }

        const apiUrl = `${baseUrl}/wp-json/wp/v2/categories?per_page=100`

        // 获取认证信息
        const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || process.env.WC_CONSUMER_KEY
        const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || process.env.WC_CONSUMER_SECRET

        const headers: Record<string, string> = {}
        if (consumerKey && consumerSecret) {
          const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')
          headers['Authorization'] = `Basic ${auth}`
        }

        const response = await fetch(apiUrl, {
          headers,
          cache: 'force-cache' // 强制缓存
        })

        if (!response.ok) {
          console.error('Failed to fetch categories:', response.status, response.statusText)
          return []
        }

        const categories = await response.json()
        return categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug
        }))
      } catch (error) {
        console.error('Error fetching categories:', error)
        return []
      }
    },
    86400 // 24小时缓存
  ) || []
}

// 清除博客相关缓存
export async function clearBlogCache(): Promise<void> {
  try {
    const pattern = `${BlogCacheKeyBuilder.PREFIX}*`
    // 这里需要实现清除所有博客缓存的功能
    // 由于使用的是 Upstash Redis，可能需要特殊处理
    console.log('Clearing blog cache with pattern:', pattern)
    // 实际实现可能需要根据具体的 Redis 客户端来调整
  } catch (error) {
    console.error('Error clearing blog cache:', error)
  }
}