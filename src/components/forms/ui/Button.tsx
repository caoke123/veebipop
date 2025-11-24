'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/form'
import { buttonStyles } from '@/lib/form'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'loading'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    fullWidth = false,
    disabled,
    className,
    children,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
      {
        'px-3 py-1.5 text-sm': size === 'sm',
        'px-4 py-2 text-sm': size === 'md',
        'px-6 py-3 text-base': size === 'lg',
        'w-full': fullWidth,
        'opacity-75 cursor-not-allowed': loading || disabled
      },
      className
    )

    const variantClasses = {
      primary: 'border border-transparent bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-blue-500',
      danger: 'border border-transparent bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-500',
      loading: 'border border-transparent bg-blue-600 text-white shadow-sm cursor-not-allowed'
    }

    const buttonClasses = cn(
      baseClasses,
      variantClasses[loading ? 'loading' : variant]
    )

    const LoadingSpinner = () => (
      <svg 
        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    )

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={buttonClasses}
        {...props}
      >
        {loading && <LoadingSpinner />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button