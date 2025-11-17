import { NextRequest } from 'next/server'

type Metric = { name: string; value: number; meta?: any; ts: number }
const store: Metric[] = (globalThis as any).performanceMetrics || []

function toCSV(rows: Array<Record<string, any>>) {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const escape = (v: any) => {
    const s = String(v ?? '')
    if (s.includes(',') || s.includes('\n') || s.includes('"')) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }
  return [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\n')
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'json'

  const stats: Record<string, any> = {}
  const byName: Record<string, number[]> = {}
  const byApi: Record<string, number[]> = {}
  for (const m of store) {
    const arr = byName[m.name] || (byName[m.name] = [])
    arr.push(m.value)
    if (m.name === 'API' && m.meta && typeof m.meta.url === 'string') {
      const u = String(m.meta.url)
      const a = byApi[u] || (byApi[u] = [])
      a.push(m.value)
    }
  }
  const p = (arr: number[], q: number) => arr.length ? arr.slice().sort((a,b)=>a-b)[Math.min(arr.length-1, Math.max(0, Math.floor(q*arr.length)-1))] : 0
  const toRows = (obj: Record<string, number[]>) => Object.entries(obj).map(([k, arr]) => ({ key: k, count: arr.length, p95: p(arr, 0.95), p99: p(arr, 0.99) }))

  const rowsName = toRows(byName)
  const rowsApi = toRows(byApi)

  if (format === 'csv') {
    const csv1 = toCSV(rowsName)
    const csv2 = toCSV(rowsApi)
    const body = `# stats\n${csv1}\n\n# apiStats\n${csv2}`
    return new Response(body, { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }
  return new Response(JSON.stringify({ stats: rowsName, apiStats: rowsApi, total: store.length }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}