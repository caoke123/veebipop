
// Simple in-memory rate limiter
interface RateLimitRecord {
  count: number
  lastReset: number
}

const store = new Map<string, RateLimitRecord>()

interface RateLimitConfig {
  limit: number
  windowMs: number
}

// Clean up old records periodically (every 1 hour)
setInterval(() => {
  const now = Date.now()
  store.forEach((record, key) => {
    if (now - record.lastReset > 3600000) { // 1 hour
      store.delete(key)
    }
  })
}, 3600000)

export function rateLimit(ip: string, config: RateLimitConfig = { limit: 5, windowMs: 60000 }): boolean {
  const now = Date.now()
  const record = store.get(ip)

  if (!record) {
    store.set(ip, { count: 1, lastReset: now })
    return true
  }

  if (now - record.lastReset > config.windowMs) {
    // Reset window
    store.set(ip, { count: 1, lastReset: now })
    return true
  }

  if (record.count >= config.limit) {
    return false
  }

  record.count += 1
  return true
}
