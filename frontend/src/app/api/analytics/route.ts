export async function GET() {
  return new Response(JSON.stringify({ message: 'Analytics endpoint' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function POST() {
  return new Response(JSON.stringify({ message: 'Analytics data received' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}