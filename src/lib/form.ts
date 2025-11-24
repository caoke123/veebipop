import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// 合并Tailwind CSS类名的工具函数
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 表单字段通用样式
export const formFieldStyles = {
  base: 'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
  error: 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500',
  disabled: 'bg-gray-50 text-gray-500 cursor-not-allowed',
  label: 'block text-sm font-medium text-gray-700 mb-1',
  errorText: 'mt-1 text-sm text-red-600',
  helperText: 'mt-1 text-sm text-gray-500'
}

// 按钮样式
export const buttonStyles = {
  primary: 'inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  secondary: 'inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  danger: 'inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  loading: 'inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm opacity-75 cursor-not-allowed'
}

// 格式化电话号码
export function formatPhoneNumber(value: string): string {
  const phoneNumber = value.replace(/[^\d]/g, '')
  
  if (phoneNumber.length <= 3) {
    return phoneNumber
  } else if (phoneNumber.length <= 7) {
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`
  } else {
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7, 11)}`
  }
}

// 格式化邮政编码
export function formatPostalCode(value: string, country: string = 'CN'): string {
  const cleanValue = value.replace(/[^\dA-Za-z]/g, '').toUpperCase()
  
  switch (country) {
    case 'CN':
      return cleanValue.slice(0, 6)
    case 'US':
      if (cleanValue.length <= 5) return cleanValue
      return `${cleanValue.slice(0, 5)}-${cleanValue.slice(5, 9)}`
    case 'UK':
      return cleanValue.slice(0, 8)
    default:
      return cleanValue
  }
}

// 验证邮箱格式
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证电话号码格式
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[\d\s\-\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/[^\d]/g, '').length >= 10
}

// 验证密码强度
export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
  score: number
} {
  const errors: string[] = []
  let score = 0

  if (password.length < 6) {
    errors.push('密码至少需要6个字符')
  } else {
    score += 1
  }

  if (!/[a-z]/.test(password)) {
    errors.push('密码需要包含小写字母')
  } else {
    score += 1
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('密码需要包含大写字母')
  } else {
    score += 1
  }

  if (!/\d/.test(password)) {
    errors.push('密码需要包含数字')
  } else {
    score += 1
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('建议包含特殊字符以提高安全性')
  } else {
    score += 1
  }

  return {
    isValid: errors.length === 0,
    errors,
    score
  }
}

// 生成随机字符串（用于验证码等）
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 深拷贝对象
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

// 移除对象中的空值
export function removeEmptyValues<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Partial<T> = {}
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key]
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'object' && !Array.isArray(value)) {
          const nested = removeEmptyValues(value)
          if (Object.keys(nested).length > 0) {
            result[key] = nested as T[Extract<keyof T, string>]
          }
        } else {
          result[key] = value
        }
      }
    }
  }
  
  return result
}

// 格式化货币
export function formatCurrency(amount: number | string, currency: string = 'CNY'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(num)) return '0.00'
  
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

// 格式化日期
export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(d.getTime())) return ''
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`
    default:
      return d.toLocaleDateString('zh-CN')
  }
}

// 获取表单字段的错误信息
export function getErrorMessage(error: any, fieldName: string): string {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  if (error?.[fieldName]) return error[fieldName]
  if (Array.isArray(error)) {
    const fieldError = error.find((e: any) => e.path?.includes(fieldName))
    return fieldError?.message || '字段验证失败'
  }
  return '字段验证失败'
}

// 表单提交处理
export async function handleFormSubmit<T>(
  data: T,
  submitFn: (data: T) => Promise<any>,
  options: {
    onSuccess?: (result: any) => void
    onError?: (error: any) => void
    onComplete?: () => void
  } = {}
): Promise<{ success: boolean; error?: any; data?: any }> {
  try {
    const result = await submitFn(data)
    options.onSuccess?.(result)
    return { success: true, data: result }
  } catch (error) {
    options.onError?.(error)
    return { success: false, error }
  } finally {
    options.onComplete?.()
  }
}