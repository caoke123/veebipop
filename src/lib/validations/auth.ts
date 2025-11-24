import { z } from 'zod'

// 用户登录验证规则
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '邮箱地址不能为空')
    .email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(1, '密码不能为空')
    .min(6, '密码至少需要6个字符'),
  remember: z.boolean().optional()
})

// 用户注册验证规则
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, '邮箱地址不能为空')
    .email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(6, '密码至少需要6个字符')
    .max(50, '密码不能超过50个字符')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字'),
  confirmPassword: z
    .string()
    .min(1, '请确认密码'),
  firstName: z
    .string()
    .min(1, '名字不能为空')
    .max(50, '名字不能超过50个字符'),
  lastName: z
    .string()
    .min(1, '姓氏不能为空')
    .max(50, '姓氏不能超过50个字符'),
  username: z
    .string()
    .min(3, '用户名至少需要3个字符')
    .max(30, '用户名不能超过30个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线')
    .optional(),
  agreeToTerms: z
    .boolean()
    .refine(val => val === true, '请同意服务条款和隐私政策'),
  subscribeNewsletter: z.boolean().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"]
})

// 密码重置验证规则
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, '邮箱地址不能为空')
    .email('请输入有效的邮箱地址')
})

// 密码重置确认验证规则
export const resetPasswordSchema = z.object({
  token: z.string().min(1, '重置令牌无效'),
  email: z
    .string()
    .min(1, '邮箱地址不能为空')
    .email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(6, '密码至少需要6个字符')
    .max(50, '密码不能超过50个字符')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字'),
  confirmPassword: z
    .string()
    .min(1, '请确认密码')
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"]
})

// 类型导出
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>