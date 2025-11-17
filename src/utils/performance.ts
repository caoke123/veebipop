import { preloadArtToyHomeProducts } from '@/utils/productServiceArtToy'

/**
 * Preload critical data for better performance
 * This function should be called early in the page load process
 */
export function preloadCriticalData() {
  // Preload Art Toy products for MenFashion component
  preloadArtToyHomeProducts(3)
  
  // Add other critical data preloads here as needed
}

// Export a function to be used in _app.tsx or layout.tsx
export function initializePerformanceOptimizations() {
  // Preload data after initial page load
  if (typeof window !== 'undefined') {
    // Use requestIdleCallback if available to preload during idle time
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        preloadCriticalData()
      })
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(() => {
        preloadCriticalData()
      }, 100)
    }
  }
}