// 强制动态渲染，避免 Vercel DYNAMIC_SERVER_USAGE 错误
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { getCache, setCache, deleteCache } from '@/lib/cache'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')
  
  if (!key) {
    return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 })
  }
  
  try {
    const data = await getCache(key)
    return NextResponse.json({ key, data, found: data !== null })
  } catch (error) {
    console.error('获取缓存失败:', error)
    return NextResponse.json({ error: 'Failed to get cache' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { key, data, ttl } = await req.json()
  
  if (!key || data === undefined || !ttl) {
    return NextResponse.json({ error: 'Missing required parameters: key, data, ttl' }, { status: 400 })
  }
  
  try {
    await setCache(key, data, ttl)
    return NextResponse.json({ success: true, key, ttl })
  } catch (error) {
    console.error('设置缓存失败:', error)
    return NextResponse.json({ error: 'Failed to set cache' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { key } = await req.json()
  
  if (!key) {
    return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 })
  }
  
  try {
    await deleteCache(key)
    return NextResponse.json({ success: true, key })
  } catch (error) {
    console.error('删除缓存失败:', error)
    return NextResponse.json({ error: 'Failed to delete cache' }, { status: 500 })
  }
}