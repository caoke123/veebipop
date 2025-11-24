// 表单组件导出文件

// 基础UI组件
export { default as Input } from './ui/Input'
export { default as TextArea } from './ui/TextArea'
export { default as Select } from './ui/Select'
export { default as Checkbox } from './ui/Checkbox'
export { default as Button } from './ui/Button'
export { default as FormField, SimpleFormField } from './ui/FormField'

// 表单组件
export { default as LoginForm } from './LoginForm'
export { default as RegisterForm } from './RegisterForm'
export { default as ContactForm } from './ContactForm'
export { default as AddressForm } from './AddressForm'
export { default as CheckoutForm } from './CheckoutForm'

// 重新导出类型
export type {
  LoginFormData,
  RegisterFormData
} from '@/lib/validations/auth'

export type {
  ContactFormData as ContactFormDataType,
  InquiryFormData
} from '@/lib/validations/contact'

export type {
  AddressFormData,
  BillingAddressFormData,
  ShippingAddressFormData
} from '@/lib/validations/address'

export type {
  CheckoutFormData as CheckoutFormDataType
} from '@/lib/validations/address'

// 表单特定Hook导出
export { useFormWithValidation, useSimpleForm, useFormField, useFormValidation } from '@/hooks/useForm'