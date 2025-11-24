# 表单组件使用指南

本目录包含了 VeebiPop 项目的完整表单系统，基于 React Hook Form + Zod + TypeScript 构建。

## 📁 目录结构

```
src/components/forms/
├── ui/                    # 基础UI组件
│   ├── Input.tsx         # 输入框组件
│   ├── TextArea.tsx      # 文本域组件
│   ├── Select.tsx        # 下拉选择组件
│   ├── Checkbox.tsx      # 复选框组件
│   ├── Button.tsx        # 按钮组件
│   ├── FormField.tsx     # 表单字段包装器
│   └── index.ts          # 组件导出
├── LoginForm.tsx         # 登录表单
├── RegisterForm.tsx      # 注册表单
├── ContactForm.tsx       # 联系表单
├── AddressForm.tsx       # 地址表单
├── CheckoutForm.tsx      # 结算表单
├── index.ts              # 表单组件导出
└── __tests__/            # 测试文件
    ├── formValidation.test.ts
    └── test-runner.js
```

## 🚀 快速开始

### 1. 导入表单组件

```tsx
import { LoginForm, RegisterForm, ContactForm } from '@/components/forms'
```

### 2. 基本使用

#### 登录表单
```tsx
import { LoginForm } from '@/components/forms'

function LoginPage() {
  const handleLoginSuccess = (user) => {
    console.log('登录成功:', user)
    // 处理登录成功逻辑
  }

  return (
    <LoginForm 
      onSuccess={handleLoginSuccess}
      showForgotPasswordLink={true}
      showSocialLogin={true}
    />
  )
}
```

#### 注册表单
```tsx
import { RegisterForm } from '@/components/forms'

function RegisterPage() {
  const handleRegisterSuccess = (user) => {
    console.log('注册成功:', user)
    // 处理注册成功逻辑
  }

  return (
    <RegisterForm 
      onSuccess={handleRegisterSuccess}
      showTermsCheckbox={true}
      showNewsletterCheckbox={true}
    />
  )
}
```

#### 联系表单
```tsx
import { ContactForm } from '@/components/forms'

function ContactPage() {
  const handleSubmit = async (data) => {
    console.log('表单提交:', data)
    // 处理表单提交逻辑
  }

  return (
    <ContactForm 
      onSubmit={handleSubmit}
      showFileUpload={true}
      inquiryTypes={['general', 'product', 'order', 'technical']}
    />
  )
}
```

#### 地址表单
```tsx
import { AddressForm } from '@/components/forms'

function AddressPage() {
  const handleAddressSave = (address) => {
    console.log('地址保存:', address)
    // 处理地址保存逻辑
  }

  return (
    <AddressForm 
      onSave={handleAddressSave}
      type="billing" // 'billing' | 'shipping'
      showSaveAsDefault={true}
    />
  )
}
```

#### 结算表单
```tsx
import { CheckoutForm } from '@/components/forms'

function CheckoutPage() {
  const handleCheckout = async (data) => {
    console.log('结算数据:', data)
    // 处理结算逻辑
  }

  return (
    <CheckoutForm 
      onSubmit={handleCheckout}
      cartItems={cartItems}
      total={totalAmount}
      showCreateAccount={true}
    />
  )
}
```

## 🎨 自定义样式

表单组件使用 Tailwind CSS，可以通过以下方式自定义样式：

### 1. 使用 className 属性
```tsx
<LoginForm 
  className="custom-login-form"
  inputClassName="custom-input"
  buttonClassName="custom-button"
/>
```

### 2. 覆盖默认样式
```css
/* 在你的全局CSS文件中 */
.custom-login-form {
  /* 自定义样式 */
}

.custom-input {
  /* 自定义输入框样式 */
}
```

## 📝 表单验证

表单使用 Zod 进行验证，验证规则定义在以下文件中：

- `src/lib/validations/auth.ts` - 认证相关验证
- `src/lib/validations/contact.ts` - 联系表单验证
- `src/lib/validations/address.ts` - 地址表单验证

### 自定义验证规则示例
```typescript
import { z } from 'zod'

const customSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少需要6个字符'),
  customField: z.string().refine(
    (value) => value === 'valid',
    '自定义验证失败'
  )
})
```

## 🔧 API 集成

### 1. 认证API
```typescript
// 登录API
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// 注册API
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "张",
  "lastName": "三"
}
```

### 2. 联系表单API
```typescript
// 联系表单提交
POST /api/contact
{
  "name": "张三",
  "email": "user@example.com",
  "inquiryType": "general",
  "message": "咨询内容"
}
```

### 3. 地址管理API
```typescript
// 保存地址
POST /api/woocommerce/address
{
  "type": "billing",
  "firstName": "张",
  "lastName": "三",
  "address1": "北京市朝阳区xxx街道",
  "city": "北京",
  "state": "北京",
  "postcode": "100000",
  "country": "CN",
  "phone": "13800138000"
}
```

## 🧪 测试

运行表单验证测试：

```bash
# 运行测试
node src/components/forms/__tests__/test-runner.js
```

## 🌟 特性

### ✅ 已实现功能
- [x] 用户注册表单
- [x] 用户登录表单
- [x] 联系/咨询表单
- [x] 地址管理表单
- [x] 结算页面表单
- [x] 表单验证和错误处理
- [x] 响应式设计
- [x] 无障碍功能支持
- [x] TypeScript 类型安全
- [x] API 集成

### 🔄 计划功能
- [ ] 文件上传组件
- [ ] 日期选择器
- [ ] 多步骤表单向导
- [ ] 表单数据持久化
- [ ] 更多验证规则
- [ ] 国际化支持

## 📚 相关文档

- [React Hook Form 文档](https://react-hook-form.com/)
- [Zod 验证库文档](https://zod.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [WooCommerce REST API](https://woocommerce.github.io/woocommerce-rest-api-docs/)

## 🤝 贡献

如果你发现 bug 或有改进建议，请提交 issue 或 pull request。

## 📄 许可证

MIT License