import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payload = {
      name: body?.name || '',
      email: body?.email || '',
      phone: body?.phone || '',
      message: body?.message || '',
      page_url: body?.page_url || ''
    }

    const target = process.env.CONTACT_ENDPOINT || 'https://veebipop.com/wp-json/custom/v1/contact'

    const resp = await fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    })

    const text = await resp.text()

    if (!resp.ok) {
      return NextResponse.json(
        { success: false, message: 'Forwarding failed', detail: text },
        { status: resp.status || 502 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to reach contact endpoint' },
      { status: 502 }
    )
  }
}
