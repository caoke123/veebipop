'use client'

import React, { forwardRef, useState } from 'react'
import { SelectProps, SelectOption } from '@/types/form'
import { cn, formFieldStyles } from '@/lib/form'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    label, 
    name, 
    placeholder, 
    required = false, 
    disabled = false, 
    error, 
    helperText, 
    className,
    options,
    multiple = false,
    searchable = false,
    clearable = false,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    
    const baseClasses = cn(
      'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
      'appearance-none bg-white',
      disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : '',
      error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : '',
      className
    )

    const displayValue = () => {
      const value = (props as any).value
      
      if (multiple && Array.isArray(value)) {
        const selectedOptions = options.filter(option =>
          value.includes(option.value)
        )
        return selectedOptions.map(opt => opt.label).join(', ')
      }
      
      if (value) {
        const selectedOption = options.find(option => option.value === value)
        return selectedOption?.label || value
      }
      
      return placeholder || '请选择...'
    }

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
        
        <div className="relative">
          <select
            ref={ref}
            id={name}
            name={name}
            disabled={disabled}
            required={required}
            multiple={multiple}
            className={cn(baseClasses, 'pr-10')}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
            {...props}
          >
            {!multiple && !required && (
              <option value="">{placeholder || '请选择...'}</option>
            )}
            
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
            <ChevronDownIcon 
              className={cn(
                'h-5 w-5 text-gray-400 transition-transform',
                isFocused && 'rotate-180'
              )} 
            />
          </div>
        </div>
        
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

Select.displayName = 'Select'

export default Select