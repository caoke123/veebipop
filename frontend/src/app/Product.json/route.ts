import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'Product.json')
    const json = await fs.promises.readFile(filePath, 'utf-8')
    return new Response(json, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to load products' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}