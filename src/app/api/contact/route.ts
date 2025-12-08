import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { contactSchema } from '@/lib/validations/contact'
import { json } from '@/utils/apiResponse'
import { sendEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'

// ... existing code ...生成给管理员的HTML邮件模板
function generateAdminEmailTemplate(data: any, type: string): string {
  const titleMap: Record<string, string> = {
    general: '一般咨询',
    product: '产品咨询',
    order: '订单问题',
    technical: '技术支持',
    complaint: '投诉建议',
    cooperation: '商务合作',
    support: '技术支持'
  }
  const title = titleMap[type] || '一般咨询'

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333; margin-bottom: 20px;">[VeebiPoP] 新咨询通知: ${title}</h2>
        <div style="background: white; padding: 15px; border-radius: 6px;">
          <p><strong>姓名:</strong> ${data.name}</p>
          <p><strong>邮箱:</strong> ${data.email}</p>
          ${data.phone ? `<p><strong>电话:</strong> ${data.phone}</p>` : ''}
          ${data.company ? `<p><strong>公司:</strong> ${data.company}</p>` : ''}
          <p><strong>咨询类型:</strong> ${title}</p>
          <p><strong>留言内容:</strong></p>
          <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; white-space: pre-wrap; font-family: monospace;">${data.message}</div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">来自 VeebiPoP 官网表单</p>
        </div>
      </div>
    </div>
  `
}

// 生成给客户的自动回复HTML邮件模板
function generateCustomerReplyTemplate(data: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
        <h2 style="color: #000; margin: 0;">VeebiPoP</h2>
      </div>
      <p>尊敬的 ${data.name}：</p>
      <p>感谢您联系 VeebiPoP！</p>
      <p>我们已收到您的留言，客服团队将尽快查看并给您回复。通常我们会在 24 小时内处理。</p>
      <p><strong>您的留言副本：</strong></p>
      <blockquote style="background: #f9f9f9; padding: 15px; border-left: 4px solid #ccc; margin: 10px 0;">
        ${data.message}
      </blockquote>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
        <p>此致，<br>VeebiPoP 团队</p>
        <p><a href="https://www.veebipop.com" style="color: #000; text-decoration: none;">www.veebipop.com</a></p>
      </div>
    </div>
  `
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
    
    // 1. Rate Limiting Check (5 requests per minute)
    if (!rateLimit(ip)) {
      return json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    
    // 2. Honeypot Check (Hidden field should be empty)
    if (body.website_hp) {
      // Return success to bot to fool it, but don't process
      return json({ success: true, message: 'Message sent successfully' })
    }

    // 验证请求数据
    const validatedData = contactSchema.parse(body)
    const type = (validatedData as any).type || 'general'
    
    // 3. Async Background Processing
    // We do NOT await these promises to return response quickly to the user
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

      // 1. 发送通知给管理员
      sendWithRetry(() => sendEmail({
        to: process.env.MAIL_TO_ADMIN || 'info@veebipop.com',
        subject: `[新咨询] ${(validatedData as any).subject || type} - 来自 ${validatedData.name}`,
        html: generateAdminEmailTemplate(validatedData, type)
      })).catch(err => console.error('Admin email background error:', err))

      // 2. 发送自动回复给客户
      if (validatedData.email) {
        sendWithRetry(() => sendEmail({
          to: validatedData.email,
          subject: '感谢联系 VeebiPoP - 我们已收到您的消息',
          html: generateCustomerReplyTemplate(validatedData)
        })).catch(err => console.error('Auto-reply background error:', err))
      }
    }

    // Trigger background tasks without awaiting
    backgroundTasks().catch(err => console.error('Background task error:', err))
    
    // 返回成功响应 (Immediately)
    return json(
      { 
        success: true, 
        message: '我们已收到您的留言，会尽快回复您',
        data: {
          id: Date.now().toString(),
          ...validatedData
        }
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, proxy-revalidate, private, max-age=0'
        }
      }
    )
    
  } catch (error: any) {
    console.error('Contact form submission error:', error)
    
    if (error instanceof z.ZodError) {
      return json(
        { 
          success: false, 
          message: '表单验证失败',
          errors: (error as any).errors?.reduce((acc: any, err: any) => {
            const field = err.path?.[0]
            return {
              ...acc,
              [field]: err.message
            }
          }, {})
        },
        { status: 400 }
      )
    }
    
    return json(
      { 
        success: false, 
        message: '服务器错误，请稍后重试' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return json(
    { 
      message: '联系表单API端点已就绪',
      methods: ['POST'],
      endpoints: {
        post: '/api/contact - 提交联系表单'
      }
    },
    { status: 200 }
  )
}

// 处理OPTIONS请求（用于CORS）
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}