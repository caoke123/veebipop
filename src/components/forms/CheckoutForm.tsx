'use client'

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkoutSchema, type CheckoutFormData, paymentMethods, shippingMethods } from '@/lib/validations/address'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/context/CartContext'
import { Input, Select, Button, Checkbox, TextArea } from './ui'
import { cn, formatCurrency } from '@/lib/form'

interface CheckoutFormProps {
  onSubmit?: (data: any) => Promise<void>
  onSuccess?: (orderId: string) => void
  onError?: (error: string) => void
  className?: string
  cartItems?: any[]
  total?: number
  showCreateAccount?: boolean
}

export default function CheckoutForm({ 
  onSuccess, 
  onError, 
  className
}: CheckoutFormProps) {
  const { user, isAuthenticated } = useAuth()
  const { cartState } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSummary, setOrderSummary] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setError,
    clearErrors,
    setValue,
    watch,
    control
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onBlur',
    defaultValues: {
      billing: {
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        company: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        postcode: '',
        country: 'CN',
        phone: (user as any)?.phone || '',
        email: user?.email || '',
        paymentMethod: '',
        orderNotes: '',
        createAccount: false
      },
      shipping: {
        sameAsBilling: true,
        firstName: '',
        lastName: '',
        company: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        postcode: '',
        country: 'CN',
        phone: ''
      },
      paymentMethod: '',
      shippingMethod: 'standard',
      orderNotes: '',
      createAccount: false,
      agreeToTerms: false
    }
  })

  const sameAsBilling = watch('shipping.sameAsBilling')
  const selectedPaymentMethod = watch('paymentMethod')
  const selectedShippingMethod = watch('shippingMethod')

  // 计算订单总价
  useEffect(() => {
    if (cartState.cartArray.length > 0) {
      const subtotal = cartState.cartArray.reduce((sum: number, item) =>
        sum + (Number(item.price) * item.quantity), 0
      )
      
      const shippingCost = selectedShippingMethod ? 
        shippingMethods.find(m => m.value === selectedShippingMethod)?.price || 0 : 0
      
      const total = subtotal + shippingCost
      
      setOrderSummary({
        subtotal,
        shippingCost,
        total,
        itemCount: cartState.cartArray.reduce((sum, item) => sum + item.quantity, 0)
      })
    }
  }, [cartState.cartArray, selectedShippingMethod])

  const onSubmit = async (data: CheckoutFormData) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    clearErrors()

    try {
      if (!isAuthenticated) {
        throw new Error('请先登录后再进行结算')
      }

      if (cartState.cartArray.length === 0) {
        throw new Error('购物车为空，请先添加商品')
      }

      // 构建订单数据
      const orderData = {
        billing: {
          first_name: data.billing.firstName,
          last_name: data.billing.lastName,
          company: data.billing.company,
          address_1: data.billing.address1,
          address_2: data.billing.address2,
          city: data.billing.city,
          state: data.billing.state,
          postcode: data.billing.postcode,
          country: data.billing.country,
          email: data.billing.email,
          phone: data.billing.phone
        },
        shipping: data.shipping.sameAsBilling ? undefined : {
          first_name: data.shipping.firstName,
          last_name: data.shipping.lastName,
          company: data.shipping.company,
          address_1: data.shipping.address1,
          address_2: data.shipping.address2,
          city: data.shipping.city,
          state: data.shipping.state,
          postcode: data.shipping.postcode,
          country: data.shipping.country,
          phone: data.shipping.phone
        },
        payment_method: data.paymentMethod,
        shipping_method: data.shippingMethod,
        order_notes: data.orderNotes,
        line_items: cartState.cartArray.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          variation_id: (item as any)?.variation || undefined,
          meta_data: [
            { key: 'selected_size', value: item.selectedSize || '' },
            { key: 'selected_color', value: item.selectedColor || '' }
          ]
        }))
      }

      // 发送到后端API
      const response = await fetch('/api/woocommerce/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        throw new Error('订单创建失败，请重试')
      }

      const result = await response.json()

      if (result.success) {
        onSuccess?.(result.order_id)
      } else {
        throw new Error(result.message || '订单创建失败，请重试')
      }
    } catch (error: any) {
      const errorMessage = error?.message || '订单创建失败，请重试'
      
      // 处理特定错误
      if (errorMessage.includes('stock') || errorMessage.includes('库存')) {
        setError('billing.address1', { message: '商品库存不足，请调整数量' })
      } else if (errorMessage.includes('payment') || errorMessage.includes('支付')) {
        setError('paymentMethod', { message: '支付方式处理失败，请重试' })
      } else if (errorMessage.includes('address') || errorMessage.includes('地址')) {
        setError('billing.address1', { message: '地址信息不正确，请检查' })
      } else {
        onError?.(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // 当"与账单地址相同"状态改变时，自动填充配送地址
  useEffect(() => {
    if (sameAsBilling) {
      setValue('shipping.firstName', watch('billing.firstName'))
      setValue('shipping.lastName', watch('billing.lastName'))
      setValue('shipping.company', watch('billing.company'))
      setValue('shipping.address1', watch('billing.address1'))
      setValue('shipping.address2', watch('billing.address2'))
      setValue('shipping.city', watch('billing.city'))
      setValue('shipping.state', watch('billing.state'))
      setValue('shipping.postcode', watch('billing.postcode'))
      setValue('shipping.country', watch('billing.country'))
      setValue('shipping.phone', watch('billing.phone'))
    }
  }, [sameAsBilling, setValue, watch])

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <svg className="mx-auto h-16 w-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4a2 2 0 100 4v6a2 2 0 100-4V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">请先登录</h3>
        <p className="text-sm text-gray-600 mb-6">
          您需要先登录才能进行结算。
        </p>
        <Button onClick={() => window.location.href = '/login'}>
          去登录
        </Button>
      </div>
    )
  }

  if (cartState.cartArray.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v7a4 4 0 008 0v7a4 4 0 008 0v7a4 4 0 008 0v7a4 4 0 008 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">购物车为空</h3>
        <p className="text-sm text-gray-600 mb-6">
          您的购物车中还没有商品，请先添加商品后再进行结算。
        </p>
        <Button onClick={() => window.location.href = '/shop'}>
          去购物
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-3 gap-8', className)}>
      {/* 账单地址 */}
      <div className="space-y-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">账单地址</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            {...register('billing.firstName')}
            label="名字"
            type="text"
            placeholder="请输入名字"
            disabled={isSubmitting}
            error={errors.billing?.firstName?.message}
            required
          />

          <Input
            {...register('billing.lastName')}
            label="姓氏"
            type="text"
            placeholder="请输入姓氏"
            disabled={isSubmitting}
            error={errors.billing?.lastName?.message}
            required
          />
        </div>

        <Input
          {...register('billing.company')}
          label="公司名称"
          type="text"
          placeholder="请输入公司名称（可选）"
          disabled={isSubmitting}
          error={errors.billing?.company?.message}
        />

        <Input
          {...register('billing.address1')}
          label="详细地址"
          type="text"
          placeholder="请输入详细地址"
          disabled={isSubmitting}
          error={errors.billing?.address1?.message}
          required
        />

        <Input
          {...register('billing.address2')}
          label="地址补充"
          type="text"
          placeholder="公寓号、楼层等（可选）"
          disabled={isSubmitting}
          error={errors.billing?.address2?.message}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            {...register('billing.city')}
            label="城市"
            type="text"
            placeholder="请输入城市"
            disabled={isSubmitting}
            error={errors.billing?.city?.message}
            required
          />

          <Input
            {...register('billing.state')}
            label="省/州"
            type="text"
            placeholder="请输入省/州"
            disabled={isSubmitting}
            error={errors.billing?.state?.message}
            required
          />

          <Input
            {...register('billing.postcode')}
            label="邮政编码"
            type="text"
            placeholder="请输入邮政编码"
            disabled={isSubmitting}
            error={errors.billing?.postcode?.message}
            required
          />
        </div>

        <Input
          {...register('billing.email')}
          label="邮箱地址"
          type="email"
          placeholder="请输入邮箱地址"
          disabled={isSubmitting}
          error={errors.billing?.email?.message}
          required
        />

        <Input
          {...register('billing.phone')}
          label="电话号码"
          type="tel"
          placeholder="请输入电话号码"
          disabled={isSubmitting}
          error={errors.billing?.phone?.message}
        />
      </div>

      {/* 配送地址 */}
      <div className="space-y-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">配送地址</h2>
        
        <Controller
          name="shipping.sameAsBilling"
          control={control}
          render={({ field }) => (
            <Checkbox
              {...field}
              label="与账单地址相同"
              disabled={isSubmitting}
              checked={field.value}
              value="sameAsBilling"
            />
          )}
        />

        {!sameAsBilling && (
          <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register('shipping.firstName')}
                label="名字"
                type="text"
                placeholder="请输入名字"
                disabled={isSubmitting}
                error={errors.shipping?.firstName?.message}
                required
              />

              <Input
                {...register('shipping.lastName')}
                label="姓氏"
                type="text"
                placeholder="请输入姓氏"
                disabled={isSubmitting}
                error={errors.shipping?.lastName?.message}
                required
              />
            </div>

            <Input
              {...register('shipping.company')}
              label="公司名称"
                type="text"
                placeholder="请输入公司名称（可选）"
                disabled={isSubmitting}
                error={errors.shipping?.company?.message}
              />

            <Input
              {...register('shipping.address1')}
                label="详细地址"
                type="text"
                placeholder="请输入详细地址"
                disabled={isSubmitting}
                error={errors.shipping?.address1?.message}
                required
              />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                {...register('shipping.city')}
                label="城市"
                type="text"
                placeholder="请输入城市"
                disabled={isSubmitting}
                error={errors.shipping?.city?.message}
                required
              />

              <Input
                {...register('shipping.state')}
                label="省/州"
                type="text"
                placeholder="请输入省/州"
                disabled={isSubmitting}
                error={errors.shipping?.state?.message}
                required
              />

              <Input
                {...register('shipping.postcode')}
                label="邮政编码"
                type="text"
                placeholder="请输入邮政编码"
                disabled={isSubmitting}
                error={errors.shipping?.postcode?.message}
                required
              />
            </div>

            <Input
              {...register('shipping.phone')}
                label="电话号码"
                type="tel"
                placeholder="请输入电话号码"
                disabled={isSubmitting}
                error={errors.shipping?.phone?.message}
              />
          </div>
        )}
      </div>

      {/* 支付和订单信息 */}
      <div className="space-y-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">支付与订单</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              支付方式
            </label>
            <select
              {...register('paymentMethod')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              disabled={isSubmitting}
            >
              <option value="">请选择支付方式</option>
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
            {errors.paymentMethod?.message && (
              <p className="mt-1 text-sm text-red-600">
                {errors.paymentMethod.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              配送方式
            </label>
            <select
              {...register('shippingMethod')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              disabled={isSubmitting}
            >
              {shippingMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label} ({method.price > 0 ? `+${formatCurrency(method.price)}` : '免费'})
                </option>
              ))}
            </select>
            {errors.shippingMethod?.message && (
              <p className="mt-1 text-sm text-red-600">
                {errors.shippingMethod.message}
              </p>
            )}
          </div>

          <TextArea
            {...register('orderNotes')}
            label="订单备注"
            placeholder="特殊要求或备注信息..."
            rows={3}
            maxLength={500}
            disabled={isSubmitting}
            error={errors.orderNotes?.message}
            helperText="可选，用于特殊配送要求或订单备注"
          />

          <Controller
            name="createAccount"
            control={control}
            render={({ field }) => (
              <Checkbox
                  {...field}
                  label="创建账户"
                  disabled={isSubmitting}
                  helperText="创建账户后可以查看订单历史和跟踪物流"
                  checked={field.value}
                  value="createAccount"
                />
            )}
          />

          <Controller
            name="agreeToTerms"
            control={control}
            render={({ field }) => (
              <Checkbox
                  {...field}
                  label="我已阅读并同意服务条款和隐私政策"
                  disabled={isSubmitting}
                  required
                  checked={field.value}
                  value="agreeToTerms"
                />
            )}
          />
          {errors.agreeToTerms?.message && (
            <p className="mt-1 text-sm text-red-600">
              {errors.agreeToTerms.message}
            </p>
          )}
        </div>
      </div>

      {/* 订单摘要 */}
      {orderSummary && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">订单摘要</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">商品数量:</span>
              <span className="text-sm font-medium">{orderSummary.itemCount}</span>
            </div>
             
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">小计:</span>
              <span className="text-sm font-medium">{formatCurrency(orderSummary.subtotal)}</span>
            </div>
             
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">配送费:</span>
              <span className="text-sm font-medium">{formatCurrency(orderSummary.shippingCost)}</span>
            </div>
             
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span className="text-base font-medium text-gray-900">总计:</span>
                <span className="text-base font-bold text-blue-600">{formatCurrency(orderSummary.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 提交按钮 */}
      <div className="mt-6">
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={!isValid || !isDirty}
          fullWidth
          size="lg"
        >
          {isSubmitting ? '处理中...' : '提交订单'}
        </Button>
      </div>

      {/* 安全提示 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">安全保障</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• 所有交易均通过加密连接进行</li>
          <li>• 我们支持多种安全的支付方式</li>
          <li>• 您的个人信息将得到严格保护</li>
          <li>• 订单确认后，我们会发送邮件通知</li>
        </ul>
      </div>
    </div>
  )
}
