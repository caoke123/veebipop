'use client'

import React, { forwardRef } from 'react'
import { CheckboxProps } from '@/types/form'
import { cn } from '@/lib/form'

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    label, 
    name, 
    required = false, 
    disabled = false, 
    error, 
    helperText, 
    className,
    checked,
    indeterminate = false,
    value,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      'h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500',
      disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      error ? 'border-red-300 focus:ring-red-500' : '',
      className
    )

    const containerClasses = cn(
      'flex items-start',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    )

    const labelClasses = cn(
      'ml-2 text-sm text-gray-700',
      disabled ? 'text-gray-500 cursor-not-allowed' : 'cursor-pointer'
    )

    return (
      <div className="w-full">
        <div className={containerClasses}>
          <input
            ref={ref}
            id={name}
            name={name}
            type="checkbox"
            disabled={disabled}
            required={required}
            checked={checked}
            value={value}
            className={baseClasses}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
            {...(indeterminate && { 'aria-checked': 'mixed' })}
            {...props}
          />
          
          {label && (
            <label 
              htmlFor={name} 
              className={labelClasses}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
        </div>
        
        {error && (
          <p 
            id={`${name}-error`}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p 
            id={`${name}-helper`}
            className="mt-1 text-sm text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export default Checkbox