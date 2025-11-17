const defaultBlur =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9J2cnIHgxPScwJyB5MT0nMCcgeDI9JzEnIHkyPScxJz48c3RvcCBvZmZzZXQ9JzAnIHN0b3AtY29sb3I9JyNmNWY1ZjUnLz48c3RvcCBvZmZzZXQ9JzEnIHN0b3AtY29sb3I9JyNlZWVlZWUnLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgeD0nMCcgeT0nMCcgcng9JzgnIGZpbGw9J3VybCgjZyknIC8+PC9zdmc+'

const map: Record<string, string> = {}

export function getBlurDataURL(url?: string): string {
  if (!url) return defaultBlur
  return map[url] || defaultBlur
}