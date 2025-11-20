import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // 修正文件路径，从public目录读取
    const filePath = path.join(process.cwd(), 'public', 'Product.json')
    const json = await fs.promises.readFile(filePath, 'utf-8')
    return new Response(json, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (err: any) {
    console.error('Failed to load Product.json:', err)
    return new Response(JSON.stringify({ error: 'Failed to load products', details: err?.message || 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}