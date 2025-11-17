import { onCLS, onINP, onLCP, onTTFB } from 'web-vitals'

function send(name: string, value: number, meta: Record<string, any> = {}) {
  const body = JSON.stringify({ name, value, meta })
  
  // Check if we're in a browser environment and not during SSR
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }
  
  try {
    // Only send if page is still active
    if (document.visibilityState === 'hidden') {
      return
    }
    
    // Use sendBeacon with better error handling
    if ('sendBeacon' in navigator && navigator.sendBeacon) {
      const success = navigator.sendBeacon('/api/analytics', body)
      if (!success) {
        console.debug('sendBeacon failed for:', name)
      }
      return
    }
    
    // Fallback to fetch with timeout and better error handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
    
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
      signal: controller.signal
    })
    .then(response => {
      clearTimeout(timeoutId)
      if (!response.ok) {
        console.debug('Analytics request failed:', response.status)
      }
    })
    .catch(error => {
      clearTimeout(timeoutId)
      // Only log if it's not an abort error (which is expected)
      if (error.name !== 'AbortError') {
        console.debug('Analytics request error:', error.message)
      }
    })
    
  } catch (error) {
    // Silently handle all errors to prevent console spam
    console.debug('WebVitals send error:', error)
  }
}

export function initWebVitals() {
  try {
    // Only initialize if we're in the browser
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }
    
    onLCP((m) => {
      if (document.visibilityState === 'visible') {
        send('LCP', m.value, { path: window.location.pathname })
      }
    })
    
    onCLS((m) => {
      if (document.visibilityState === 'visible') {
        send('CLS', m.value, { path: window.location.pathname })
      }
    })
    
    onINP((m) => {
      if (document.visibilityState === 'visible') {
        send('INP', m.value, { path: window.location.pathname })
      }
    })
    
    onTTFB((m) => {
      if (document.visibilityState === 'visible') {
        send('TTFB', m.value, { path: window.location.pathname })
      }
    })
  } catch (error) {
    // Silently handle initialization errors
    console.debug('WebVitals initialization error:', error)
  }
}