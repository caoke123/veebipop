import { z } from 'zod'
import { FieldErrors } from 'react-hook-form'
import { useState } from 'react'

// 表单验证错误处理工具函数
export class FormValidationError extends Error {
  public readonly field: string
  public readonly code: string
  public readonly details?: any

  constructor(field: string, message: string, code: string = 'VALIDATION_ERROR', details?: any) {
    super(message)
    this.field = field
    this.code = code
    this.details = details
  }
}

// 通用验证规则
export const commonValidations = {
  // 邮箱验证
  email: {
    required: '邮箱地址不能为空',
    invalid: '请输入有效的邮箱地址',
    domain: '邮箱域名不正确'
  },
  
  // 密码验证
  password: {
    required: '密码不能为空',
    minLength: '密码至少需要6个字符',
    weak: '密码强度太弱，请包含大小写字母和数字',
    mismatch: '两次输入的密码不一致'
  },
  
  // 电话验证
  phone: {
    required: '电话号码不能为空',
    invalid: '请输入有效的电话号码',
    length: '电话号码长度不正确'
  },
  
  // 地址验证
  address: {
    required: '地址不能为空',
    incomplete: '请填写完整的地址信息',
    postalCode: '邮政编码格式不正确',
    city: '城市名称不能为空',
    state: '省/州不能为空',
    country: '国家不能为空'
  },
  
  // 通用验证
  general: {
    required: '此字段为必填项',
    invalid: '输入格式不正确',
    maxLength: '输入内容过长',
    minLength: '输入内容过短'
  }
}

// 错误代码枚举
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// 错误消息映射
export const errorMessages: Record<ErrorCode, string> = {
  [ErrorCode.VALIDATION_ERROR]: '表单验证失败',
  [ErrorCode.NETWORK_ERROR]: '网络连接失败，请检查网络设置',
  [ErrorCode.SERVER_ERROR]: '服务器错误，请稍后重试',
  [ErrorCode.AUTHENTICATION_ERROR]: '身份验证失败，请重新登录',
  [ErrorCode.PERMISSION_ERROR]: '权限不足，请联系管理员',
  [ErrorCode.RATE_LIMIT_ERROR]: '操作过于频繁，请稍后再试',
  [ErrorCode.UNKNOWN_ERROR]: '未知错误，请联系客服'
}

// 获取错误消息的工具函数
export function getErrorMessage(error: any): string {
  if (error instanceof FormValidationError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  if (error?.code && errorMessages[error.code as ErrorCode]) {
    return errorMessages[error.code as ErrorCode]
  }
  
  return errorMessages[ErrorCode.UNKNOWN_ERROR]
}

// 获取字段特定的错误消息
export function getFieldErrorMessage(errors: FieldErrors, fieldName: string): string | undefined {
  const fieldError: any = (errors as any)[fieldName]
  if (fieldError) {
    if (Array.isArray(fieldError)) {
      return typeof fieldError[0]?.message === 'string' ? fieldError[0]?.message : undefined
    }
    return typeof fieldError.message === 'string' ? fieldError.message : undefined
  }
  return undefined
}

// 实时验证函数
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 防抖验证
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      inThrottle = true
      func(...args)
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

// 表单验证工具函数
export const validationHelpers = {
  // 验证邮箱格式
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },
  
  // 验证手机号格式（中国手机号）
  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(phone.replace(/[^\d]/g, ''))
  },
  
  // 验证身份证号
  isValidIdCard: (id: string): boolean => {
    const idRegex = /(^\d{15}$)|(^\d{17}$)|(^\d{18}$)/
    return idRegex.test(id.replace(/\s/g, ''))
  },
  
  // 验证邮政编码
  isValidPostalCode: (code: string, country: string = 'CN'): boolean => {
    if (country === 'CN') {
      const chinaPostalRegex = /^\d{6}$/
      return chinaPostalRegex.test(code)
    } else if (country === 'US') {
      const usPostalRegex = /^\d{5}(-\d{4})?$/
      return usPostalRegex.test(code)
    }
    return code.length >= 3 && code.length <= 10
  },
  
  // 验证密码强度
  getPasswordStrength: (password: string): {
    score: number
    level: 'weak' | 'fair' | 'good' | 'strong'
    feedback: string[]
  } => {
    let score = 0
    const feedback: string[] = []
    
    if (password.length >= 8) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
    
    if (score <= 2) {
      return { score, level: 'weak', feedback: ['密码太弱，建议包含大小写字母、数字和特殊字符'] }
    } else if (score <= 3) {
      return { score, level: 'fair', feedback: ['密码强度一般，建议增加特殊字符'] }
    } else if (score <= 4) {
      return { score, level: 'good', feedback: ['密码强度良好'] }
    } else {
      return { score, level: 'strong', feedback: ['密码强度很强'] }
    }
  },
  
  // 实时验证函数
  debounce,
  
  // 防抖验证
  throttle
}

// 表单提交状态管理
export interface FormSubmitState {
  isSubmitting: boolean
  error: string | null
  success: boolean
  data?: any
}

// 表单提交Hook
export function useFormSubmission<T = any>(
  submitFn: (data: T) => Promise<any>,
  options: {
    onSuccess?: (data: any) => void
    onError?: (error: string) => void
    onSuccessMessage?: string
    onErrorTimeout?: number
  } = {}
) {
  const [state, setState] = useState<FormSubmitState>({
    isSubmitting: false,
    error: null,
    success: false
  })

  const submit = async (data: T): Promise<void> => {
    setState({ isSubmitting: true, error: null, success: false })
    
    try {
      const result = await submitFn(data)
      
      setState({
        isSubmitting: false,
        error: null,
        success: true,
        data: result
      })
      
      options.onSuccess?.(result)
      
      if (options.onSuccessMessage) {
        // 可以在这里显示成功消息
        console.log(options.onSuccessMessage)
      }
    } catch (error: any) {
      const errorMessage = getErrorMessage(error)
      
      setState({
        isSubmitting: false,
        error: errorMessage,
        success: false
      })
      
      options.onError?.(errorMessage)
    }
  }

  const reset = () => {
    setState({
      isSubmitting: false,
      error: null,
      success: false,
      data: undefined
    })
  }

  return {
    ...state,
    submit,
    reset,
    clearError: () => setState(prev => ({ ...prev, error: null }))
  }
}

// 表单字段验证器
export const fieldValidators = {
  // 必填验证
  required: (value: any, fieldName: string = '此字段'): string | null => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName}不能为空`
    }
    return null
  },
  
  // 长度验证
  minLength: (value: string, min: number, fieldName: string = '此字段'): string | null => {
    if (value && value.length < min) {
      return `${fieldName}至少需要${min}个字符`
    }
    return null
  },
  
  maxLength: (value: string, max: number, fieldName: string = '此字段'): string | null => {
    if (value && value.length > max) {
      return `${fieldName}不能超过${max}个字符`
    }
    return null
  },
  
  // 正则验证
  pattern: (value: string, regex: RegExp, errorMessage: string = '格式不正确'): string | null => {
    if (value && !regex.test(value)) {
      return errorMessage
    }
    return null
  },
  
  // 自定义验证
  custom: (value: any, validator: (value: any) => string | null, errorMessage: string = '验证失败'): string | null => {
    if (value && !validator(value)) {
      return errorMessage
    }
    return null
  }
}

// 表单数据清理工具
export const formatters = {
  // 清理数字输入
  number: (value: string): string => {
    return value.replace(/[^\d.-]/g, '')
  },
  
  // 清理电话号码
  phone: (value: string): string => {
    return value.replace(/[^\d+\-\s\(\)]/g, '')
  },
  
  // 清理邮箱
  email: (value: string): string => {
    return value.toLowerCase().trim()
  },
  
  // 清理空格
  whitespace: (value: string): string => {
    return value.replace(/\s+/g, ' ').trim()
  },
  
  // 格式化货币
  currency: (amount: number | string, currency: string = 'CNY'): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    
    if (isNaN(num)) return '0.00'
    
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(num)
  },
  
  // 格式化日期
  date: (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    
    if (isNaN(d.getTime())) return ''
    
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    
    switch (format) {
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`
      default:
        return d.toLocaleDateString('zh-CN')
    }
  }
}

// 表单错误边界处理
export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: any
}

export function useFormErrorBoundary() {
  const [state, setState] = useState<ErrorBoundaryState>({
    hasError: false,
    error: null,
    errorInfo: null
  })

  const resetError = () => {
    setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  const captureError = (error: Error, errorInfo: any) => {
    console.error('Form Error:', error, errorInfo)
    setState({
      hasError: true,
      error,
      errorInfo
    })
  }

  return {
    ...state,
    resetError,
    captureError
  }
}
