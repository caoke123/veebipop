export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'private, max-age=60')
  return new Response(JSON.stringify(data), { ...init, headers })
}

export function error(status: number, message: string, details?: unknown): Response {
  return json({ error: message, details }, { status })
}

export function notFound(message = 'Not Found'): Response {
  return error(404, message)
}

export function badRequest(message = 'Bad Request', details?: unknown): Response {
  return error(400, message, details)
}