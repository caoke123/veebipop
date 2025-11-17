export async function timedFetch(url: string, init?: RequestInit) {
  const start = typeof performance !== 'undefined' ? performance.now() : Date.now()
  const res = await fetch(url, init)
  try {
    const dur = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start
    const body = JSON.stringify({ name: 'API', value: dur, meta: { url } })
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      navigator.sendBeacon('/api/analytics', body)
    } else {
      fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
    }
  } catch {}
  return res
}