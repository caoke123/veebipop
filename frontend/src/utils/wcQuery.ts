export type ProductQueryOpts = {
  page?: number
  per_page?: number | string
  category?: string | null
  on_sale?: boolean
  price_min?: number | string | null
  price_max?: number | string | null
  orderby?: string | null
  order?: 'asc' | 'desc' | string | null
  merge?: boolean
  no304?: boolean
  slug?: string | null
  require_images?: boolean
}

export function buildProductParams(opts: ProductQueryOpts) {
  const params = new URLSearchParams()
  const page = opts.page ?? 1
  const perPage = String(opts.per_page ?? '9')
  const merge = opts.merge ?? false
  const no304 = opts.no304 ?? true

  params.set('merge', merge ? 'true' : 'false')
  params.set('page', String(page))
  params.set('per_page', perPage)
  if (opts.category) params.set('category', String(opts.category))
  if (opts.on_sale) params.set('on_sale', 'true')
  if (opts.price_min != null) params.set('price_min', String(opts.price_min))
  if (opts.price_max != null) params.set('price_max', String(opts.price_max))
  if (opts.orderby) params.set('orderby', String(opts.orderby))
  if (opts.order) params.set('order', String(opts.order))
  if (opts.slug) params.set('slug', String(opts.slug))
  if (no304) params.set('no304', 'true')
  if (opts.require_images) params.set('require_images', 'true')
  return params
}