import { z } from 'zod'

// 地址表单验证规则
export const addressSchema = z.object({
  firstName: z
    .string()
    .min(1, '名字不能为空')
    .max(50, '名字不能超过50个字符'),
  lastName: z
    .string()
    .min(1, '姓氏不能为空')
    .max(50, '姓氏不能超过50个字符'),
  company: z
    .string()
    .max(100, '公司名称不能超过100个字符')
    .optional()
    .or(z.literal('')),
  address1: z
    .string()
    .min(1, '详细地址不能为空')
    .max(200, '详细地址不能超过200个字符'),
  address2: z
    .string()
    .max(200, '地址补充信息不能超过200个字符')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .min(1, '城市不能为空')
    .max(100, '城市名称不能超过100个字符'),
  state: z
    .string()
    .min(1, '省/州不能为空')
    .max(100, '省/州名称不能超过100个字符'),
  postcode: z
    .string()
    .min(1, '邮政编码不能为空')
    .regex(/^[A-Za-z0-9\s\-]+$/, '请输入有效的邮政编码'),
  country: z
    .string()
    .min(1, '国家不能为空')
    .max(100, '国家名称不能超过100个字符'),
  phone: z
    .string()
    .regex(/^[+]?[\d\s\-\(\)]+$/, '请输入有效的电话号码')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('请输入有效的邮箱地址')
    .optional()
    .or(z.literal(''))
})

// 账单地址验证规则（继承地址验证规则）
export const billingAddressSchema = addressSchema.extend({
  paymentMethod: z
    .string()
    .min(1, '请选择支付方式'),
  createAccount: z.boolean().optional(),
  orderNotes: z
    .string()
    .max(500, '订单备注不能超过500个字符')
    .optional()
    .or(z.literal(''))
})

// 配送地址验证规则
export const shippingAddressSchema = z.object({
  sameAsBilling: z.boolean(),
  firstName: z
    .string()
    .min(1, '名字不能为空')
    .max(50, '名字不能超过50个字符')
    .optional(),
  lastName: z
    .string()
    .min(1, '姓氏不能为空')
    .max(50, '姓氏不能超过50个字符')
    .optional(),
  company: z
    .string()
    .max(100, '公司名称不能超过100个字符')
    .optional()
    .or(z.literal('')),
  address1: z
    .string()
    .min(1, '详细地址不能为空')
    .max(200, '详细地址不能超过200个字符')
    .optional(),
  address2: z
    .string()
    .max(200, '地址补充信息不能超过200个字符')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .min(1, '城市不能为空')
    .max(100, '城市名称不能超过100个字符')
    .optional(),
  state: z
    .string()
    .min(1, '省/州不能为空')
    .max(100, '省/州名称不能超过100个字符')
    .optional(),
  postcode: z
    .string()
    .min(1, '邮政编码不能为空')
    .regex(/^[A-Za-z0-9\s\-]+$/, '请输入有效的邮政编码')
    .optional(),
  country: z
    .string()
    .min(1, '国家不能为空')
    .max(100, '国家名称不能超过100个字符')
    .optional(),
  phone: z
    .string()
    .regex(/^[+]?[\d\s\-\(\)]+$/, '请输入有效的电话号码')
    .optional()
    .or(z.literal(''))
}).refine((data) => {
  // 如果选择与账单地址不同，则必填字段必须填写
  if (!data.sameAsBilling) {
    return !!(data.firstName && data.lastName && data.address1 && data.city && data.state && data.postcode && data.country)
  }
  return true
}, {
  message: "请填写完整的配送地址信息",
  path: ["firstName"]
})

// 结算表单验证规则
export const checkoutSchema = z.object({
  billing: billingAddressSchema,
  shipping: shippingAddressSchema,
  paymentMethod: z
    .string()
    .min(1, '请选择支付方式'),
  shippingMethod: z
    .string()
    .min(1, '请选择配送方式')
    .optional(),
  orderNotes: z
    .string()
    .max(500, '订单备注不能超过500个字符')
    .optional()
    .or(z.literal('')),
  createAccount: z.boolean().optional(),
  agreeToTerms: z
    .boolean()
    .refine(val => val === true, '请同意服务条款和隐私政策')
}).refine((data) => {
  // 如果选择与账单地址不同，则配送地址必须完整
  if (!data.shipping.sameAsBilling) {
    return !!(data.shipping.firstName && data.shipping.lastName && 
              data.shipping.address1 && data.shipping.city && 
              data.shipping.state && data.shipping.postcode && 
              data.shipping.country)
  }
  return true
}, {
  message: "请填写完整的配送地址信息",
  path: ["shipping"]
})

// 国家/地区列表
export const countries = [
  { value: 'CN', label: '中国' },
  { value: 'US', label: '美国' },
  { value: 'UK', label: '英国' },
  { value: 'JP', label: '日本' },
  { value: 'KR', label: '韩国' },
  { value: 'SG', label: '新加坡' },
  { value: 'AU', label: '澳大利亚' },
  { value: 'CA', label: '加拿大' },
  { value: 'DE', label: '德国' },
  { value: 'FR', label: '法国' }
]

// 中国省份列表
export const chinaStates = [
  { value: 'BJ', label: '北京' },
  { value: 'SH', label: '上海' },
  { value: 'GD', label: '广东' },
  { value: 'ZJ', label: '浙江' },
  { value: 'JS', label: '江苏' },
  { value: 'SC', label: '四川' },
  { value: 'HB', label: '湖北' },
  { value: 'HN', label: '湖南' },
  { value: 'FJ', label: '福建' },
  { value: 'SD', label: '山东' }
]

// 支付方式列表
export const paymentMethods = [
  { value: 'alipay', label: '支付宝' },
  { value: 'wechat', label: '微信支付' },
  { value: 'stripe', label: '信用卡支付' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'bank_transfer', label: '银行转账' }
]

// 配送方式列表
export const shippingMethods = [
  { value: 'standard', label: '标准配送 (5-7个工作日)', price: 0 },
  { value: 'express', label: '快速配送 (2-3个工作日)', price: 15 },
  { value: 'overnight', label: '次日达', price: 25 },
  { value: 'pickup', label: '门店自提', price: 0 }
]

// 类型导出
export type AddressFormData = z.infer<typeof addressSchema>
export type BillingAddressFormData = z.infer<typeof billingAddressSchema>
export type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>
export type CheckoutFormData = z.infer<typeof checkoutSchema>