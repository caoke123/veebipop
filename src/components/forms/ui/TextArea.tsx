'use client'

import React, { forwardRef } from 'react'
import { TextAreaProps } from '@/types/form'
import { cn, formFieldStyles } from '@/lib/form'

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ 
    label, 
    name, 
    placeholder, 
    required = false, 
    disabled = false, 
    error, 
    helperText, 
    className,
    rows = 4,
    maxLength,
    resize = 'vertical',
    ...props 
  }, ref) => {
    const baseClasses = formFieldStyles.base
    const errorClasses = error ? formFieldStyles.error : ''
    const disabledClasses = disabled ? formFieldStyles.disabled : ''
    
    const resizeClasses = {
      none: 'resize-none',
      both: 'resize',
      horizontal: 'resize-x',
      vertical: 'resize-y'
    }[resize]
    
    const inputClasses = cn(
      baseClasses,
      errorClasses,
      disabledClasses,
      resizeClasses,
      className
    )

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={name} 
            className={formFieldStyles.label}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={name}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          maxLength={maxLength}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
          {...props}
        />
        
        {maxLength && (
          <div className="mt-1 text-xs text-gray-500 text-right">
            {typeof (props as any).value === 'string' ? (props as any).value.length : 0} / {maxLength}
          </div>
        )}
        
        {error && (
          <p 
            id={`${name}-error`}
            className={formFieldStyles.errorText}
            role="alert"
          >
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p 
            id={`${name}-helper`}
            className={formFieldStyles.helperText}
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'

export default TextArea