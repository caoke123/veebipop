import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
    
    // 1. Rate Limiting Check
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()

    // 2. Honeypot Check
    if (body.website_hp) {
      return NextResponse.json({ success: true, message: 'Message sent successfully' })
    }

    const payload = {
      name: body?.name || '',
      email: body?.email || '',
      phone: body?.phone || '',
      message: body?.message || '',
      page_url: body?.page_url || ''
    }

    // 3. Async Background Processing (Email & Forwarding)
    // We do NOT await these promises to return response quickly to the user
    // This assumes the runtime allows background tasks to complete (Node.js runtime usually does)
    const backgroundTasks = async () => {
      // Send emails with simple retry logic
      const sendWithRetry = async (fn: () => Promise<any>, retries = 3) => {
        try {
          await fn()
        } catch (err) {
          if (retries > 0) {
            console.log(`Email sending failed, retrying... (${retries} left)`)
            await new Promise(r => setTimeout(r, 1000))
            await sendWithRetry(fn, retries - 1)
          } else {
            console.error('Final email sending failure:', err)
          }
        }
      }

      if (payload.email) {
        // Notify Admin
        sendWithRetry(() => sendEmail({
          to: process.env.MAIL_TO_ADMIN || 'info@veebipop.com',
          subject: `[New Submission] ${payload.name || 'Contact'} - ${payload.email}`,
          html: `
            <h3>New Form Submission</h3>
            <p><strong>Name:</strong> ${payload.name}</p>
            <p><strong>Email:</strong> ${payload.email}</p>
            <p><strong>Phone:</strong> ${payload.phone}</p>
            <p><strong>Message:</strong> ${payload.message}</p>
            <p><strong>Page:</strong> ${payload.page_url}</p>
          `
        })).catch(err => console.error('Admin email background error:', err))

        // Auto-reply to Visitor
        sendWithRetry(() => sendEmail({
          to: payload.email,
          subject: 'Thank you for contacting VeebiPoP',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Thank you!</h2>
              <p>We have received your request: "${payload.message || 'Contact Request'}".</p>
              <p>Our team will get back to you shortly.</p>
              <br>
              <p>Best regards,</p>
              <p>VeebiPoP Team</p>
            </div>
          `
        })).catch(err => console.error('Auto-reply background error:', err))
      }

      // Forward to WordPress (Legacy/Backend)
      const target = process.env.CONTACT_ENDPOINT || 'https://veebipop.com/wp-json/custom/v1/contact'
      try {
        const resp = await fetch(target, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!resp.ok) {
          console.warn('WordPress forwarding failed:', resp.status, await resp.text())
        }
      } catch (wpError) {
        console.error('WordPress forwarding network error:', wpError)
      }
    }

    // Trigger background tasks without awaiting
    backgroundTasks().catch(err => console.error('Background task error:', err))

    // 4. Return Success Immediately
    return NextResponse.json({ success: true, message: 'Message sent successfully' }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to reach contact endpoint' },
      { status: 502 }
    )
  }
}
