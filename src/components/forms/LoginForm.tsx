'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { useAuth } from '@/contexts/AuthContext'
import { Input, Button, Checkbox } from './ui'
import { cn } from '@/lib/form'

interface LoginFormProps {
  onSuccess?: (user?: any) => void
  onError?: (error: string) => void
  className?: string
  redirectTo?: string
  showRegisterLink?: boolean
  showForgotPasswordLink?: boolean
  showSocialLogin?: boolean
}

export default function LoginForm({ 
  onSuccess, 
  onError, 
  className,
  redirectTo,
  showRegisterLink = true,
  showForgotPasswordLink = true
}: LoginFormProps) {
  const { login } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    clearErrors
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      remember: false
    }
  })

  const onSubmit = async (data: LoginFormData) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    clearErrors()

    try {
      const success = await login(data.email, data.password)

      if (success) {
        onSuccess?.()
      } else {
        onError?.('登录失败，请检查您的凭据')
      }
    } catch (error: any) {
      const errorMessage = error?.message || '登录失败，请重试'
      
      // 处理特定错误
      if (errorMessage.includes('Invalid credentials') || errorMessage.includes('用户名或密码错误')) {
        setError('password', { message: '邮箱或密码错误' })
      } else if (errorMessage.includes('not found') || errorMessage.includes('用户不存在')) {
        setError('email', { message: '该邮箱未注册' })
      } else if (errorMessage.includes('account locked') || errorMessage.includes('账户被锁定')) {
        setError('email', { message: '账户已被锁定，请联系客服' })
      } else {
        onError?.(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = () => {
    // 跳转到忘记密码页面
    window.location.href = '/forgot-password'
  }

  const handleRegister = () => {
    // 跳转到注册页面
    window.location.href = '/register'
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
      <Input
        {...register('email')}
        label="邮箱地址"
        type="email"
        placeholder="请输入邮箱地址"
        disabled={isSubmitting}
        autoComplete="email"
        error={errors.email?.message}
      />

      <div className="space-y-2">
        <Input
          {...register('password')}
          label="密码"
          type={showPassword ? 'text' : 'password'}
          placeholder="请输入密码"
          disabled={isSubmitting}
          autoComplete="current-password"
          error={errors.password?.message}
        />
        
        <div className="flex items-center justify-between">
          <Checkbox
            {...register('remember')}
            label="记住我"
            disabled={isSubmitting}
          />
          
          {showForgotPasswordLink && (
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              disabled={isSubmitting}
            >
              忘记密码？
            </button>
          )}
        </div>
      </div>

      <Button
        type="submit"
        loading={isSubmitting}
        disabled={!isValid}
        fullWidth
      >
        {isSubmitting ? '登录中...' : '登录'}
      </Button>

      {showRegisterLink && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            还没有账户？
            <button
              type="button"
              onClick={handleRegister}
              className="text-blue-600 hover:text-blue-500 font-medium ml-1"
              disabled={isSubmitting}
            >
              立即注册
            </button>
          </p>
        </div>
      )}

      {/* 社交登录选项 */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">或使用以下方式登录</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.24 10.285V14.4h6.806c-.272 1.739-1.62 3.199-3.814 3.199-2.223 0-3.825-1.602-3.825-3.814 0-2.212 1.602-3.814 3.825-3.814 1.635 0 2.637.714 3.317 1.739l2.844 2.212c1.443-1.218 2.382-3.063 2.382-5.147 0-4.682-3.814-8.486-8.486-8.486s-8.486 3.804-8.486 8.486c0 4.682 3.804 8.486 8.486 8.486 2.023 0 3.864-.714 5.318-1.896l-2.844-2.212c-.714.602-1.635.965-2.474.965-2.223 0-3.814-1.602-3.814-3.814z"/>
            </svg>
            <span className="ml-2">Google</span>
          </button>

          <button
            type="button"
            className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.214-5.255-4.642 5.255H6.618l6.635-7.582L4.5 2.25h3.066l5.896 6.734L18.244 2.25zm-1.273 16.326l-1.521-1.815L8.727 18.576H6.618l3.903-4.485 1.521 1.815L16.971 8.576h1.521l-3.903 4.485z"/>
            </svg>
            <span className="ml-2">微信</span>
          </button>
        </div>
      </div>

      {/* 安全提示 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">安全提示</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• 请确保在安全的网络环境下登录</li>
          <li>• 不要在公共设备上保存密码</li>
          <li>• 如发现异常登录，请及时修改密码</li>
        </ul>
      </div>
    </form>
  )
}