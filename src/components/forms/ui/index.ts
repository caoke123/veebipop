// UI组件导出文件
export { default as Input } from './Input'
export { default as TextArea } from './TextArea'
export { default as Select } from './Select'
export { default as Checkbox } from './Checkbox'
export { default as Button } from './Button'
export { default as FormField, SimpleFormField } from './FormField'

// 重新导出类型
export type {
  InputProps,
  TextAreaProps,
  SelectProps,
  CheckboxProps
} from '@/types/form'

// ButtonProps类型定义
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'loading'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}