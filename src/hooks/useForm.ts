'use client'

import { useForm, UseFormProps, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'

interface UseFormWithValidationProps<T extends z.ZodType> extends Omit<UseFormProps<z.input<T>>, 'resolver'> {
  schema: T
  onSubmit?: (data: z.input<T>) => Promise<void> | void
}

interface UseFormWithValidationReturn<T extends z.ZodType> extends UseFormReturn<z.input<T>> {
  isSubmitting: boolean
  submitError: string | null
  clearSubmitError: () => void
}

export function useFormWithValidation<T extends z.ZodType>({
  schema,
  onSubmit,
  ...formProps
}: UseFormWithValidationProps<T>): UseFormWithValidationReturn<T> {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<z.input<T>>({
    ...formProps,
    resolver: zodResolver(schema) as any,
    mode: 'onBlur',
    reValidateMode: 'onChange'
  })

  const handleSubmit = async (data: z.input<T>) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await onSubmit?.(data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '提交失败，请重试'
      setSubmitError(errorMessage)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearSubmitError = () => {
    setSubmitError(null)
  }

  return {
    ...form,
    isSubmitting,
    submitError,
    clearSubmitError
  }
}

// 简化的表单Hook，用于不需要复杂验证的表单
interface UseSimpleFormProps<T = Record<string, any>> {
  initialValues?: Partial<T>
  onSubmit?: (data: T) => Promise<void> | void
  validation?: (data: T) => string | null
}

interface UseSimpleFormReturn<T = Record<string, any>> {
  data: T
  errors: Record<keyof T, string>
  handleChange: (field: keyof T, value: any) => void
  handleSubmit: () => void
  isSubmitting: boolean
  submitError: string | null
  clearSubmitError: () => void
  reset: () => void
}

export function useSimpleForm<T = Record<string, any>>({
  initialValues = {},
  onSubmit,
  validation
}: UseSimpleFormProps<T>): UseSimpleFormReturn<T> {
  const [data, setData] = useState<T>(initialValues as T)
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleChange = (field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
    
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    // 验证表单
    if (validation) {
      const error = validation(data)
      if (error) {
        setSubmitError(error)
        return
      }
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await onSubmit?.(data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '提交失败，请重试'
      setSubmitError(errorMessage)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearSubmitError = () => {
    setSubmitError(null)
  }

  const reset = () => {
    setData(initialValues as T)
    setErrors({} as Record<keyof T, string>)
    setSubmitError(null)
  }

  return {
    data,
    errors,
    handleChange,
    handleSubmit,
    isSubmitting,
    submitError,
    clearSubmitError,
    reset
  }
}

// 表单字段Hook，用于单个字段的状态管理
interface UseFormFieldProps<T = any> {
  value: T
  onChange: (value: T) => void
  error?: string
  touched?: boolean
  disabled?: boolean
  required?: boolean
}

export function useFormField<T = any>({
  value,
  onChange,
  error,
  touched = false,
  disabled = false,
  required = false
}: UseFormFieldProps<T>) {
  const [isFocused, setIsFocused] = useState(false)

  const handleChange = (newValue: T) => {
    if (!disabled) {
      onChange(newValue)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  const hasError = !!error && touched
  const fieldId = `field-${Math.random().toString(36).substr(2, 9)}`

  return {
    value,
    onChange: handleChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    error,
    hasError,
    isFocused,
    disabled,
    required,
    fieldId,
    ariaInvalid: hasError,
    ariaDescribedBy: error ? `${fieldId}-error` : undefined
  }
}

// 表单验证Hook
export function useFormValidation<T = Record<string, any>>(schema: z.ZodSchema<T>) {
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>)

  const validateField = (field: keyof T, value: any) => {
    try {
      // 简化验证逻辑，避免使用schema.shape
      const fieldSchema = (schema as any)._def?.schema?.[field as string]
      if (fieldSchema) {
        fieldSchema.parse(value)
        setErrors(prev => ({ ...prev, [field]: '' }))
        return true
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = (error as any).issues?.[0]?.message || '字段验证失败'
        setErrors(prev => ({ ...prev, [field]: errorMessage }))
        return false
      }
    }
    return false
  }

  const validateForm = (data: T): boolean => {
    try {
      schema.parse(data)
      setErrors({} as Record<keyof T, string>)
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<keyof T, string> = {} as Record<keyof T, string>
        ;(error as any).issues?.forEach((err: any) => {
          const field = err.path?.[0] as keyof T
          if (field) {
            newErrors[field] = err.message || '字段验证失败'
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const clearErrors = () => {
    setErrors({} as Record<keyof T, string>)
  }

  const clearFieldError = (field: keyof T) => {
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError,
    hasErrors: Object.values(errors).some(error => !!error)
  }
}
