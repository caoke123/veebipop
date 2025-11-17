// Unified cache abstraction: memory fallback, optional Memcached
// Configuration (optional):
// - MEMCACHED_SERVER="host:port"  (e.g., "localhost:11211")
// - or MEMCACHED_HOST/MEMCACHED_PORT (port 0 or missing -> default 11211)

type CacheStore = 'memcached' | 'memory'

export type CacheEntry<T = any> = T

type CacheClient = {
  store: CacheStore
  get: (key: string) => Promise<CacheEntry | undefined>
  set: (key: string, value: CacheEntry, ttlSeconds: number) => Promise<void>
  del: (key: string) => Promise<void>
}

function getMemcachedAddressFromEnv(): string | undefined {
  const server = process.env.MEMCACHED_SERVER
  const hasHost = typeof process.env.MEMCACHED_HOST === 'string'
  const hasPort = typeof process.env.MEMCACHED_PORT === 'string'
  // Only enable Memcached if explicitly configured via env
  if (!server && !hasHost && !hasPort) return undefined
  if (server && server.includes(':')) return server
  const host = process.env.MEMCACHED_HOST || 'localhost'
  const portRaw = process.env.MEMCACHED_PORT || '0'
  let port = parseInt(String(portRaw), 10)
  if (Number.isNaN(port) || port <= 0) port = 11211
  return `${host}:${port}`
}

function createMemcachedClient(): CacheClient | undefined {
  const addr = getMemcachedAddressFromEnv()
  if (!addr) return undefined
  try {
    // Lazy import so that runtime doesn’t fail if not installed in some environments
    const memjs = require('memjs')
    const client = memjs.Client.create(addr)
    const impl: CacheClient = {
      store: 'memcached',
      async get(key: string) {
        try {
          const { value } = await client.get(key)
          if (!value) return undefined
          const text = value.toString('utf-8')
          return JSON.parse(text)
        } catch {
          return undefined
        }
      },
      async set(key: string, value: CacheEntry, ttlSeconds: number) {
        try {
          const buf = Buffer.from(JSON.stringify(value), 'utf-8')
          await client.set(key, buf, { expires: ttlSeconds })
        } catch {
          // swallow
        }
      },
      async del(key: string) {
        try {
          await client.delete(key)
        } catch {
          // swallow
        }
      },
    }
    return impl
  } catch {
    return undefined
  }
}

function createMemoryClient(): CacheClient {
  type Entry = { expires: number; value: CacheEntry }
  const map = new Map<string, Entry>()
  return {
    store: 'memory',
    async get(key: string) {
      const e = map.get(key)
      if (!e) return undefined
      if (Date.now() > e.expires) {
        map.delete(key)
        return undefined
      }
      return e.value
    },
    async set(key: string, value: CacheEntry, ttlSeconds: number) {
      const expires = Date.now() + Math.max(1, ttlSeconds) * 1000
      map.set(key, { expires, value })
    },
    async del(key: string) {
      map.delete(key)
    },
  }
}

let sharedClient: CacheClient | undefined

export function getCacheClient(): CacheClient {
  if (sharedClient) return sharedClient
  const mc = createMemcachedClient()
  if (mc) {
    sharedClient = mc
    return mc
  }
  const mem = createMemoryClient()
  sharedClient = mem
  return mem
}

// -----------------------------
// Namespace version for precise invalidation
// -----------------------------
const memoryVersions = new Map<string, number>()
const versionKeyFor = (ns: string) => `wc:${ns}:version`

// Memcached cannot store immortal entries via our wrapper, so use a long TTL (~30 days)
const LONG_TTL_SECONDS = 30 * 24 * 60 * 60

export async function getNamespaceVersion(ns: string): Promise<number> {
  const client = getCacheClient()
  const key = versionKeyFor(ns)
  if (client.store === 'memcached') {
    const v = await client.get(key)
    if (typeof v === 'number' && Number.isFinite(v) && v > 0) return v
    await client.set(key, 1, LONG_TTL_SECONDS)
    return 1
  }
  // memory store
  const v = memoryVersions.get(ns)
  if (typeof v === 'number' && v > 0) return v
  memoryVersions.set(ns, 1)
  return 1
}

export async function bumpNamespaceVersion(ns: string): Promise<number> {
  const client = getCacheClient()
  const key = versionKeyFor(ns)
  if (client.store === 'memcached') {
    const cur = await client.get(key)
    const next = (typeof cur === 'number' && Number.isFinite(cur) ? cur : 1) + 1
    await client.set(key, next, LONG_TTL_SECONDS)
    return next
  }
  // memory store
  const cur = memoryVersions.get(ns) ?? 1
  const next = cur + 1
  memoryVersions.set(ns, next)
  return next
}