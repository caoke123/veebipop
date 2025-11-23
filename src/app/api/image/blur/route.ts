import { NextRequest } from 'next/server'

// Force this route to be dynamic

export const runtime = 'edge'

// 简单的 SVG 模糊占位符，替代 plaiceholder 生成的模糊图
const defaultBlurDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9J2cnIHgxPScwJyB5MT0nMCcgeDI9JzEnIHkyPScxJz48c3RvcCBvZmZzZXQ9JzAnIHN0b3AtY29sb3I9JyNmNWY1ZjUnLz48c3RvcCBvZmZzZXQ9JzEnIHN0b3AtY29sb3I9JyNlZWVlZWUnLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgeD0nMCcgeT0nMCcgcng9JzgnIGZpbGw9J3VybCgjZyknIC8+PC9zdmc+'

export async function GET(request: NextRequest) {
  try {
    // Use searchParams directly instead of creating a new URL
    const url = request.nextUrl.searchParams.get('url')
    if (!url) {
      return new Response(JSON.stringify({ error: 'url is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    // 直接返回默认的模糊占位符，不再使用 plaiceholder
    // Next.js 会自动处理图片的模糊效果
    return new Response(JSON.stringify({ blurDataURL: defaultBlurDataURL }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=86400',
        'X-Cache': 'PLACEHOLDER'
      },
    })
  } catch (e: any) {
    console.error('Blur generation error:', e)
    // Return empty blur data instead of error for graceful degradation
    return new Response(JSON.stringify({ blurDataURL: '' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60',
        'X-Cache': 'ERROR'
      },
    })
  }
}