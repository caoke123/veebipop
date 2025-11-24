'use client'

import React, { forwardRef } from 'react'
import { InputProps } from '@/types/form'
import { cn, formFieldStyles } from '@/lib/form'

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    name, 
    placeholder, 
    required = false, 
    disabled = false, 
    error, 
    helperText, 
    className,
    type = 'text',
    autoComplete,
    maxLength,
    minLength,
    pattern,
    ...props 
  }, ref) => {
    const baseClasses = formFieldStyles.base
    const errorClasses = error ? formFieldStyles.error : ''
    const disabledClasses = disabled ? formFieldStyles.disabled : ''
    
    const inputClasses = cn(
      baseClasses,
      errorClasses,
      disabledClasses,
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
        
        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
          {...props}
        />
        
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

Input.displayName = 'Input'

export default Input