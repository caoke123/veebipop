import { redis } from './redis'
import { cookies } from 'next/headers'

const getSessionId = () => {
  const cookieStore = cookies()
  let sid = cookieStore.get('cart_session')?.value
  if (!sid) {
    sid = crypto.randomUUID()
    cookieStore.set('cart_session', sid, { maxAge: 60 * 60 * 24 * 30 })
  }
  return sid
}

export async function getCart() {
  const items = await redis.hgetall(`cart:${getSessionId()}`)
  return items || {}
}

export async function addToCart(productId: string, qty: number = 1) {
  await redis.hincrby(`cart:${getSessionId()}`, productId, qty)
  await redis.expire(`cart:${getSessionId()}`, 60 * 60 * 24 * 30)
}

export async function removeFromCart(productId: string) {
  await redis.hdel(`cart:${getSessionId()}`, productId)
}

export async function clearCart() {
  await redis.del(`cart:${getSessionId()}`)
}