'use client'

import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'
import { useAuth } from '@/contexts/AuthContext'
import { Input, Button, Checkbox, SimpleFormField } from './ui'
import { cn } from '@/lib/form'

interface RegisterFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
  redirectTo?: string
}

export default function RegisterForm({ 
  onSuccess, 
  onError, 
  className,
  redirectTo 
}: RegisterFormProps) {
  const { register: registerUser } = useAuth()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setError,
    clearErrors
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      username: '',
      agreeToTerms: false,
      subscribeNewsletter: false
    }
  })

  const password = watch('password')
  const agreeToTerms = watch('agreeToTerms')

  const onSubmit = async (data: RegisterFormData) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    clearErrors()

    try {
      const success = await registerUser({
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        username: data.username
      })

      if (success) {
        onSuccess?.()
      } else {
        onError?.('注册失败，请重试')
      }
    } catch (error: any) {
      const errorMessage = error?.message || '注册失败，请重试'
      
      // 处理特定错误
      if (errorMessage.includes('already exists')) {
        setError('email', { message: '该邮箱已被注册' })
      } else if (errorMessage.includes('username')) {
        setError('username', { message: '用户名已存在' })
      } else {
        onError?.(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '' }
    
    let strength = 0
    const checks = [
      { regex: /.{8,}/, text: '至少8个字符' },
      { regex: /[a-z]/, text: '包含小写字母' },
      { regex: /[A-Z]/, text: '包含大写字母' },
      { regex: /\d/, text: '包含数字' },
      { regex: /[!@#$%^&*(),.?":{}|<>]/, text: '包含特殊字符' }
    ]

    checks.forEach(check => {
      if (check.regex.test(password)) strength++
    })

    const strengthTexts = ['', '弱', '一般', '中等', '强', '很强']
    const strengthColors = [
      'bg-gray-200',
      'bg-red-500',
      'bg-yellow-500',
      'bg-blue-500',
      'bg-green-500'
    ]

    return {
      strength,
      text: strengthTexts[strength] || '',
      color: strengthColors[strength] || 'bg-gray-200'
    }
  }

  const passwordStrength = getPasswordStrength(password)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...register('firstName')}
          label="名字"
          type="text"
          placeholder="请输入您的名字"
          disabled={isSubmitting}
          autoComplete="given-name"
          error={errors.firstName?.message}
        />

        <Input
          {...register('lastName')}
          label="姓氏"
          type="text"
          placeholder="请输入您的姓氏"
          disabled={isSubmitting}
          autoComplete="family-name"
          error={errors.lastName?.message}
        />
      </div>

      <Input
        {...register('username')}
        label="用户名"
        type="text"
        placeholder="请输入用户名"
        disabled={isSubmitting}
        autoComplete="username"
        error={errors.username?.message}
        helperText="可选，用于登录和显示"
      />

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
          type="password"
          placeholder="请输入密码"
          disabled={isSubmitting}
          autoComplete="new-password"
          error={errors.password?.message}
        />
        
        {password && (
          <div className="space-y-1">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={cn(
                    'h-1 flex-1 rounded-full',
                    level <= passwordStrength.strength ? passwordStrength.color : 'bg-gray-200'
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500">
              密码强度: {passwordStrength.text}
            </p>
          </div>
        )}
      </div>

      <Input
        {...register('confirmPassword')}
        label="确认密码"
        type="password"
        placeholder="请再次输入密码"
        disabled={isSubmitting}
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
      />

      <Controller
        name="agreeToTerms"
        control={control}
        render={({ field }) => (
          <SimpleFormField
            error={errors.agreeToTerms?.message}
          >
            <Checkbox
              {...field}
              label="我已阅读并同意服务条款和隐私政策"
              disabled={isSubmitting}
              checked={field.value}
              value="agree"
            />
            <div className="mt-2 text-sm text-gray-600">
              请阅读我们的
              <a
                href="/terms"
                className="text-blue-600 hover:text-blue-500 ml-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                服务条款
              </a>
              {' '}
              和
              <a
                href="/privacy"
                className="text-blue-600 hover:text-blue-500 ml-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                隐私政策
              </a>
            </div>
          </SimpleFormField>
        )}
      />

      <Controller
        name="subscribeNewsletter"
        control={control}
        render={({ field }) => (
          <SimpleFormField>
            <Checkbox
              {...field}
              label="订阅我们的新闻邮件，获取最新产品信息和优惠活动"
              disabled={isSubmitting}
              checked={field.value}
              value="newsletter"
            />
          </SimpleFormField>
        )}
      />

      <Button
        type="submit"
        loading={isSubmitting}
        disabled={!isValid || !agreeToTerms}
        fullWidth
      >
        {isSubmitting ? '注册中...' : '注册账户'}
      </Button>

      {onError && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            已有账户？
            <button
              type="button"
              onClick={() => {/* 跳转到登录页面 */}}
              className="text-blue-600 hover:text-blue-500 font-medium ml-1"
            >
              立即登录
            </button>
          </p>
        </div>
      )}
    </form>
  )
}