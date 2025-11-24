'use client'

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addressSchema, type AddressFormData, countries, chinaStates } from '@/lib/validations/address'
import { useUserDetails } from '@/hooks/useUserDetails'
import { Input, Select, Button, Checkbox } from './ui'
import { cn } from '@/lib/form'

interface AddressFormProps {
  onSave?: (address: AddressFormData) => void
  onSuccess?: (address: AddressFormData) => void
  onError?: (error: string) => void
  className?: string
  initialData?: Partial<AddressFormData>
  mode?: 'create' | 'edit'
  addressType?: 'billing' | 'shipping'
  showSaveAsDefault?: boolean
  type?: string
}

export default function AddressForm({ 
  onSuccess, 
  onError, 
  className,
  initialData,
  mode = 'create',
  addressType = 'billing'
}: AddressFormProps) {
  const { updateUser } = useUserDetails()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setError,
    clearErrors,
    setValue,
    watch,
    reset
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      company: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postcode: '',
      country: 'CN',
      phone: '',
      email: '',
      ...initialData
    }
  })

  const selectedCountry = watch('country')
  const selectedState = watch('state')

  // 加载用户数据（如果是编辑模式且有用户信息）
  useEffect(() => {
    if (mode === 'edit' && !initialData) {
      setIsLoading(true)
      // 这里可以从用户详情中获取地址信息
      setIsLoading(false)
    }
  }, [mode, initialData])

  // 根据国家更新州/省选项
  const getStateOptions = () => {
    if (selectedCountry === 'CN') {
      return chinaStates
    }
    // 可以添加其他国家的州/省选项
    return []
  }

  const onSubmit = async (data: AddressFormData) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    clearErrors()

    try {
      // 构建提交数据
      const submitData = {
        ...data,
        addressType,
        mode
      }

      // 发送到后端API
      const response = await fetch('/api/woocommerce/address', {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        throw new Error('保存地址失败，请重试')
      }

      const result = await response.json()

      if (result.success) {
        onSuccess?.(data)
        
        // 如果是编辑用户信息，同时更新用户详情
        if (addressType === 'billing') {
          await updateUser({
            billing: {
              first_name: data.firstName,
              last_name: data.lastName,
              company: data.company,
              address_1: data.address1,
              address_2: data.address2,
              city: data.city,
              state: data.state,
              postcode: data.postcode,
              country: data.country,
              email: data.email,
              phone: data.phone
            }
          })
        }
      } else {
        throw new Error(result.message || '保存地址失败，请重试')
      }
    } catch (error: any) {
      const errorMessage = error?.message || '保存地址失败，请重试'
      
      // 处理特定错误
      if (errorMessage.includes('validation') || errorMessage.includes('验证失败')) {
        setError('address1', { message: '地址格式不正确' })
      } else if (errorMessage.includes('postal') || errorMessage.includes('邮编')) {
        setError('postcode', { message: '邮政编码格式不正确' })
      } else if (errorMessage.includes('phone') || errorMessage.includes('电话')) {
        setError('phone', { message: '电话号码格式不正确' })
      } else {
        onError?.(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPhoneNumber = (value: string) => {
    // 简单的电话号码格式化
    const cleaned = value.replace(/[^\d+\-\s\(\)]/g, '')
    return cleaned
  }

  const formatPostalCode = (value: string) => {
    // 根据国家格式化邮政编码
    if (selectedCountry === 'CN') {
      return value.replace(/[^\d]/g, '').slice(0, 6)
    } else if (selectedCountry === 'US') {
      return value.replace(/[^\d\-\s]/g, '').slice(0, 10)
    }
    return value
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">加载中...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...register('firstName')}
          label="名字"
          type="text"
          placeholder="请输入名字"
          disabled={isSubmitting}
          autoComplete="given-name"
          error={errors.firstName?.message}
          required
        />

        <Input
          {...register('lastName')}
          label="姓氏"
          type="text"
          placeholder="请输入姓氏"
          disabled={isSubmitting}
          autoComplete="family-name"
          error={errors.lastName?.message}
          required
        />
      </div>

      <Input
        {...register('company')}
        label="公司名称"
        type="text"
        placeholder="请输入公司名称（可选）"
        disabled={isSubmitting}
        autoComplete="organization"
        error={errors.company?.message}
        helperText="可选，用于企业订单"
      />

      <Input
        {...register('address1')}
        label="详细地址"
        type="text"
        placeholder="请输入详细地址"
        disabled={isSubmitting}
        autoComplete="address-line1"
        error={errors.address1?.message}
        required
        helperText="请输入街道地址、门牌号等详细信息"
      />

      <Input
        {...register('address2')}
        label="地址补充"
        type="text"
        placeholder="公寓号、楼层、公司名称等（可选）"
        disabled={isSubmitting}
        autoComplete="address-line2"
        error={errors.address2?.message}
        helperText="可选，用于更精确的定位"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          {...register('city')}
          label="城市"
          type="text"
          placeholder="请输入城市"
          disabled={isSubmitting}
          autoComplete="address-level2"
          error={errors.city?.message}
          required
        />

        <Select
          {...register('state')}
          label="省/州"
          options={getStateOptions()}
          disabled={isSubmitting || getStateOptions().length === 0}
          error={errors.state?.message}
          required
          helperText={getStateOptions().length === 0 ? '请先选择国家' : ''}
        />

        <Input
          {...register('postcode')}
          label="邮政编码"
          type="text"
          placeholder="请输入邮政编码"
          disabled={isSubmitting}
          autoComplete="postal-code"
          error={errors.postcode?.message}
          required
          {...register('postcode', {
            onChange: (e) => {
              const formatted = formatPostalCode(e.target.value)
              setValue('postcode', formatted)
            }
          })}
        />
      </div>

      <Select
        {...register('country')}
        label="国家/地区"
        options={countries}
        disabled={isSubmitting}
        error={errors.country?.message}
        required
        helperText="选择您所在的国家或地区"
      />

      <Input
        {...register('phone')}
        label="电话号码"
        type="tel"
        placeholder="请输入电话号码"
        disabled={isSubmitting}
        autoComplete="tel"
        error={errors.phone?.message}
        {...register('phone', {
          onChange: (e) => {
            const formatted = formatPhoneNumber(e.target.value)
            setValue('phone', formatted)
          }
        })}
        helperText="用于配送联系和订单确认"
      />

      {addressType === 'billing' && (
        <Input
          {...register('email')}
          label="邮箱地址"
          type="email"
          placeholder="请输入邮箱地址"
          disabled={isSubmitting}
          autoComplete="email"
          error={errors.email?.message}
          helperText="用于订单确认和电子发票"
        />
      )}

      <div className="flex space-x-4">
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={!isValid || !isDirty}
          className="flex-1"
        >
          {isSubmitting ? '保存中...' : mode === 'create' ? '添加地址' : '更新地址'}
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={() => reset()}
          disabled={isSubmitting}
        >
          重置
        </Button>
      </div>

      {/* 地址验证提示 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">地址验证提示</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• 请确保地址信息准确无误，以免影响配送</li>
          <li>• 详细地址请包含街道名称和门牌号</li>
          <li>• 如有特殊配送要求，请在订单备注中说明</li>
          <li>• 企业用户请填写完整的公司信息</li>
        </ul>
      </div>

      {/* 配送范围说明 */}
      {selectedCountry === 'CN' && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-900 mb-2">配送范围</h4>
          <p className="text-xs text-yellow-700">
            目前我们支持中国大陆地区的配送，港澳台地区请联系客服咨询具体配送方式和费用。
          </p>
        </div>
      )}
    </form>
  )
}