export type SearchParams = { [key: string]: string | string[] | undefined }

type Mutations = {
  set?: Record<string, string>
  remove?: string[]
  reset?: Record<string, string>
}

export function buildHref(
  basePath: string,
  searchParams?: SearchParams,
  mutations?: Mutations
) {
  const params = new URLSearchParams()

  // Preserve existing params, except those modified/removed/reset
  Object.entries(searchParams || {}).forEach(([key, val]) => {
    const v = Array.isArray(val) ? val[0] : val
    if (!v) return
    if (mutations?.remove && mutations.remove.includes(key)) return
    if (mutations?.set && Object.prototype.hasOwnProperty.call(mutations.set, key)) return
    if (mutations?.reset && Object.prototype.hasOwnProperty.call(mutations.reset, key)) return
    params.set(key, v)
  })

  // Apply updates
  Object.entries(mutations?.set || {}).forEach(([key, v]) => {
    params.set(key, v)
  })
  Object.entries(mutations?.reset || {}).forEach(([key, v]) => {
    params.set(key, v)
  })

  const qs = params.toString()
  return qs ? `${basePath}?${qs}` : basePath
}