'use client'

import React from 'react'
import { cn } from '@/lib/form'

// 简化版本的FormField，用于直接与React Hook Form的Controller集成
interface SimpleFormFieldProps {
  label?: string
  required?: boolean
  helperText?: string
  error?: string
  className?: string
  children: React.ReactNode
}

export function SimpleFormField({
  label,
  required = false,
  helperText,
  error,
  className,
  children
}: SimpleFormFieldProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className={cn(
          'block text-sm font-medium text-gray-700 mb-1',
          error && 'text-red-700'
        )}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {children}
      
      {error && (
        <p 
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  )
}

export default SimpleFormField