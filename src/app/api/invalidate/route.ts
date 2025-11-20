// src/app/api/invalidate/route.ts
import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export const POST = async (req: Request) => {
  const { key } = await req.json()
  if (key) {
    await redis.del(`cache:${process.env.CACHE_VERSION || '1'}:${key}`)
  }
  return NextResponse.json({ success: true })
}