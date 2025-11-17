import { redirect } from 'next/navigation'

export default function BreadCrumb1({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const qs = new URLSearchParams()
  const params = searchParams ?? {}
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v != null) qs.append(key, v)
      }
    } else if (typeof value === 'string') {
      qs.set(key, value)
    }
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  redirect(`/shop${suffix}`)
}