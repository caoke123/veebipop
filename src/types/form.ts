// 表单基础类型定义

export interface FormFieldProps {
  label: string
  name: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  helperText?: string
  className?: string
}

export interface InputProps extends FormFieldProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'url'
  autoComplete?: string
  maxLength?: number
  minLength?: number
  pattern?: string
}

export interface TextAreaProps extends FormFieldProps {
  rows?: number
  maxLength?: number
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
}

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectProps extends FormFieldProps {
  options: SelectOption[]
  multiple?: boolean
  searchable?: boolean
  clearable?: boolean
}

export interface CheckboxProps extends Omit<FormFieldProps, 'label'> {
  label: string
  checked?: boolean
  indeterminate?: boolean
  value?: string | number
}

export interface RadioOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface RadioGroupProps extends FormFieldProps {
  options: RadioOption[]
  orientation?: 'horizontal' | 'vertical'
}

// 认证表单类型
export interface LoginFormData {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  username?: string
  agreeToTerms: boolean
  subscribeNewsletter?: boolean
}

// 联系表单类型
export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  phone?: string
  company?: string
}

// 地址表单类型
export interface AddressFormData {
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postcode: string
  country: string
  phone?: string
  email?: string
}

// 结算表单类型
export interface BillingFormData extends AddressFormData {
  paymentMethod: string
  createAccount?: boolean
  orderNotes?: string
}

export interface ShippingFormData {
  sameAsBilling: boolean
  firstName?: string
  lastName?: string
  company?: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  postcode?: string
  country?: string
  phone?: string
}

export interface CheckoutFormData {
  billing: BillingFormData
  shipping: ShippingFormData
  paymentMethod: string
  shippingMethod?: string
  orderNotes?: string
  createAccount?: boolean
}

// 表单状态类型
export interface FormState<T = any> {
  data: T
  errors: Record<keyof T, string>
  touched: Record<keyof T, boolean>
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
}

// 表单验证类型
export interface ValidationRule {
  required?: boolean | string
  minLength?: number | { value: number; message: string }
  maxLength?: number | { value: number; message: string }
  pattern?: RegExp | { value: RegExp; message: string }
  min?: number | { value: number; message: string }
  max?: number | { value: number; message: string }
  email?: boolean | string
  url?: boolean | string
  custom?: (value: any) => boolean | string
}

export type ValidationSchema<T = Record<string, any>> = {
  [K in keyof T]?: ValidationRule | ValidationRule[];
};

// API响应类型
export interface FormApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  errors?: Record<string, string[]>
}

// 表单配置类型
export interface FormConfig {
  validateOnBlur?: boolean
  validateOnChange?: boolean
  reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit'
  shouldUnregister?: boolean
  shouldFocusError?: boolean
  resetOnSubmit?: boolean
}