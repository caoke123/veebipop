import { z } from 'zod'

// 联系表单验证规则
export const contactSchema = z.object({
  name: z
    .string()
    .min(1, '姓名不能为空')
    .max(100, '姓名不能超过100个字符'),
  email: z
    .string()
    .min(1, '邮箱地址不能为空')
    .email('请输入有效的邮箱地址'),
  subject: z
    .string()
    .min(1, '主题不能为空')
    .max(200, '主题不能超过200个字符'),
  message: z
    .string()
    .min(10, '消息内容至少需要10个字符')
    .max(2000, '消息内容不能超过2000个字符'),
  phone: z
    .string()
    .regex(/^[+]?[\d\s\-\(\)]+$/, '请输入有效的电话号码')
    .optional()
    .or(z.literal('')),
  company: z
    .string()
    .max(100, '公司名称不能超过100个字符')
    .optional()
    .or(z.literal(''))
})

// 咨询表单验证规则（针对产品咨询）
export const inquirySchema = z.object({
  productId: z
    .string()
    .min(1, '请选择要咨询的产品'),
  name: z
    .string()
    .min(1, '姓名不能为空')
    .max(100, '姓名不能超过100个字符'),
  email: z
    .string()
    .min(1, '邮箱地址不能为空')
    .email('请输入有效的邮箱地址'),
  phone: z
    .string()
    .regex(/^[+]?[\d\s\-\(\)]+$/, '请输入有效的电话号码')
    .optional()
    .or(z.literal('')),
  company: z
    .string()
    .max(100, '公司名称不能超过100个字符')
    .optional()
    .or(z.literal('')),
  quantity: z
    .string()
    .regex(/^\d+$/, '请输入有效的数量')
    .optional()
    .or(z.literal('')),
  message: z
    .string()
    .min(10, '咨询内容至少需要10个字符')
    .max(2000, '咨询内容不能超过2000个字符'),
  urgent: z.boolean().optional()
})

// 邮件订阅验证规则
export const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, '邮箱地址不能为空')
    .email('请输入有效的邮箱地址'),
  firstName: z
    .string()
    .max(50, '名字不能超过50个字符')
    .optional()
    .or(z.literal('')),
  preferences: z.array(z.string()).optional()
})

// 反馈表单验证规则
export const feedbackSchema = z.object({
  type: z
    .enum(['bug', 'feature', 'improvement', 'other'], {
      message: '请选择反馈类型'
    }),
  title: z
    .string()
    .min(1, '标题不能为空')
    .max(200, '标题不能超过200个字符'),
  description: z
    .string()
    .min(10, '描述内容至少需要10个字符')
    .max(2000, '描述内容不能超过2000个字符'),
  email: z
    .string()
    .email('请输入有效的邮箱地址')
    .optional()
    .or(z.literal('')),
  attachments: z.array(z.string()).optional()
})

// 类型导出
export type ContactFormData = z.infer<typeof contactSchema>
export type InquiryFormData = z.infer<typeof inquirySchema>
export type NewsletterFormData = z.infer<typeof newsletterSchema>
export type FeedbackFormData = z.infer<typeof feedbackSchema>