import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const robotsContent = `# https://www.veebipop.com/robots.txt
# 欢迎所有搜索引擎爬取

User-agent: *
Allow: /

# 优先索引重要页面
Allow: /shop
Allow: /product/
Allow: /blog
Allow: /homepages/

# 禁止索引管理页面
Disallow: /api/
Disallow: /admin/
Disallow: /my-account/
Disallow: /cart/
Disallow: /checkout/
Disallow: /_next/
Disallow: /favicon.ico

# 网站地图位置
Sitemap: https://www.veebipop.com/sitemap.xml

# 爬取延迟（可选，对大型网站友好）
Crawl-delay: 1

# 特殊指令
# 主机信息
Host: www.veebipop.com`;

  return new NextResponse(robotsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 缓存1天
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
  });
}