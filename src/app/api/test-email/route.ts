import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const to = searchParams.get('to') || 'ava33689@gmail.com'

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // Force false for port 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      debug: true,
      logger: true
    })

    console.log(`Attempting to send test email to: ${to}`)
    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      passLength: process.env.SMTP_PASS?.length
    })

    // Verify connection config
    await new Promise((resolve, reject) => {
      transporter.verify(function (error, success) {
        if (error) {
          console.log('SMTP Connection Error:', error)
          reject(error)
        } else {
          console.log('SMTP Connection Success')
          resolve(success)
        }
      })
    })

    const result = await sendEmail({
      to,
      subject: 'VeebiPoP SMTP Test',
      text: 'This is a test email from VeebiPoP to verify SMTP configuration.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">SMTP Configuration Test</h2>
          <p>This email confirms that your Brevo SMTP settings are working correctly.</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">VeebiPoP System</p>
        </div>
      `,
    })

    if (result.success) {
      return NextResponse.json({ message: 'Email sent successfully', details: result })
    } else {
      return NextResponse.json({ error: 'Failed to send email', details: result }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
