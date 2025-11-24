import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { contactSchema } from '@/lib/validations/contact'
import { json } from '@/utils/apiResponse'

// 邮件发送配置
const emailConfig = {
  from: process.env.EMAIL_FROM || 'noreply@veebipop.com',
  to: process.env.EMAIL_TO || 'support@veebipop.com',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@veebipop.com',
  subject: (type: string, subject?: string) => {
    const prefixes = {
      general: '[VeebiPop] 一般咨询',
      product: '[VeebiPop] 产品咨询',
      order: '[VeebiPop] 订单问题',
      technical: '[VeebiPop] 技术支持',
      complaint: '[VeebiPop] 投诉建议',
      cooperation: '[VeebiPop] 商务合作',
      support: '[VeebiPop] 技术支持'
    }
    
    if (subject && prefixes[type as keyof typeof prefixes]) {
      return prefixes[type as keyof typeof prefixes] + ' - ' + subject
    }
    
    return prefixes.general
  }
}

// 发送邮件函数
async function sendEmail(data: any, type: string, subject?: string) {
  try {
    const emailContent = {
      to: emailConfig.to,
      from: emailConfig.from,
      replyTo: emailConfig.replyTo,
      subject: emailConfig.subject(type, subject),
      html: generateEmailTemplate(data, type),
      text: generateTextEmail(data, type)
    }

    // 这里应该使用真实的邮件服务，如SendGrid、Nodemailer等
    // 为了演示，我们只是记录到控制台
    console.log('Email would be sent:', emailContent)
    
    // 模拟邮件发送成功
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    throw new Error('邮件发送失败，请稍后重试')
  }
}

// 生成HTML邮件模板
function generateEmailTemplate(data: any, type: string): string {
  const templates = {
    general: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin-bottom: 20px;">一般咨询</h2>
          <div style="background: white; padding: 15px; border-radius: 6px;">
            <p><strong>姓名:</strong> ${data.name}</p>
            <p><strong>邮箱:</strong> ${data.email}</p>
            ${data.phone ? `<p><strong>电话:</strong> ${data.phone}</p>` : ''}
            ${data.company ? `<p><strong>公司:</strong> ${data.company}</p>` : ''}
            <p><strong>咨询类型:</strong> ${data.subject}</p>
            <p><strong>留言内容:</strong></p>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; white-space: pre-wrap; font-family: monospace;">${data.message}</div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">此邮件由系统自动发送，请勿直接回复。</p>
          </div>
        </div>
      </div>
    `,
    
    product: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin-bottom: 20px;">产品咨询</h2>
          <div style="background: white; padding: 15px; border-radius: 6px;">
            <p><strong>姓名:</strong> ${data.name}</p>
            <p><strong>邮箱:</strong> ${data.email}</p>
            ${data.phone ? `<p><strong>电话:</strong> ${data.phone}</p>` : ''}
            ${data.company ? `<p><strong>公司:</strong> ${data.company}</p>` : ''}
            <p><strong>咨询产品:</strong> ${data.productName || '未指定'}</p>
            <p><strong>留言内容:</strong></p>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; white-space: pre-wrap; font-family: monospace;">${data.message}</div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">此邮件由系统自动发送，请勿直接回复。</p>
          </div>
        </div>
      </div>
    `,
    
    order: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin-bottom: 20px;">订单问题</h2>
          <div style="background: white; padding: 15px; border-radius: 6px;">
            <p><strong>姓名:</strong> ${data.name}</p>
            <p><strong>邮箱:</strong> ${data.email}</p>
            ${data.phone ? `<p><strong>电话:</strong> ${data.phone}</p>` : ''}
            ${data.company ? `<p><strong>公司:</strong> ${data.company}</p>` : ''}
            <p><strong>咨询类型:</strong> ${data.subject}</p>
            <p><strong>留言内容:</strong></p>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; white-space: pre-wrap; font-family: monospace;">${data.message}</div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">此邮件由系统自动发送，请勿直接回复。</p>
          </div>
        </div>
      </div>
    `
  }

  return templates[type as keyof typeof templates] || templates.general
}

// 生成纯文本邮件模板
function generateTextEmail(data: any, type: string): string {
  return `
姓名: ${data.name}
邮箱: ${data.email}
${data.phone ? `电话: ${data.phone}` : ''}
${data.company ? `公司: ${data.company}` : ''}
咨询类型: ${data.subject}
留言内容:
${data.message}

---
此邮件由系统自动发送，请勿直接回复。
  `
}

// 保存联系记录到数据库/文件
async function saveContactRecord(data: any) {
  try {
    // 这里可以保存到数据库或文件
    const record = {
      ...data,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    }
    
    // 为了演示，我们只是记录到控制台
    console.log('Contact record saved:', record)
    
    return true
  } catch (error) {
    console.error('Failed to save contact record:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求数据
    const validatedData = contactSchema.parse(body)
    
    // 保存联系记录
    await saveContactRecord(validatedData)
    
    // 发送邮件通知
    const emailSent = await sendEmail(validatedData, (validatedData as any).type || 'general', (validatedData as any).subject)
    
    if (!emailSent) {
      return json(
        { success: false, message: '邮件发送失败，请稍后重试' },
        { status: 500 }
      )
    }
    
    // 返回成功响应
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