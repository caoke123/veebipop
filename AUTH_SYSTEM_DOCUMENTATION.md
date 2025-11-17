# WooCommerce JWT认证系统 - 实施文档

## 概述

本文档描述了在Anvogue电商网站中实施的基于WooCommerce REST API和WordPress JWT插件的认证系统。

## 技术架构

### 核心技术栈
- **前端框架**: Next.js 14 (App Router)
- **认证机制**: WordPress JWT Authentication
- **用户管理**: WooCommerce REST API
- **状态管理**: React Context API
- **存储**: localStorage (客户端)

### 认证流程
1. **用户注册**: 通过WordPress REST API创建用户，自动创建WooCommerce客户
2. **用户登录**: 使用JWT令牌验证，服务器返回用户信息和令牌
3. **令牌验证**: 定期验证JWT令牌有效性
4. **会话管理**: 使用localStorage持久化用户状态

## 文件结构

### 核心文件

#### 认证上下文 (`src/contexts/AuthContext.tsx`)
- 管理全局用户认证状态
- 提供认证相关的hooks和函数
- 处理JWT令牌的存储和验证

#### API路由
- `src/app/api/auth/login/route.ts` - 处理用户登录
- `src/app/api/auth/register/route.ts` - 处理用户注册
- `src/app/api/auth/verify/route.ts` - 验证JWT令牌

#### 页面组件
- `src/app/register/page.tsx` - 用户注册页面
- `src/app/login/page.tsx` - 用户登录页面
- `src/app/my-account/page.tsx` - 用户账户页面

#### 导航组件
- `src/components/Header/Menu/MenuEleven.tsx` - 导航菜单，显示认证状态

### 配置

#### 环境变量 (`.env.local`)
```bash
NEXT_PUBLIC_SITE_URL=http://your-wordpress-site.com
WP_ADMIN_JWT_TOKEN=your-admin-jwt-token
WOOCOMMERCE_CONSUMER_KEY=your-wc-consumer-key
WOOCOMMERCE_CONSUMER_SECRET=your-wc-consumer-secret
```

## 认证功能

### 1. 用户注册
- 支持邮箱/用户名注册
- 密码确认验证
- 服务条款同意
- 自动创建WooCommerce客户记录
- 注册成功后自动登录

### 2. 用户登录
- 邮箱/密码验证
- JWT令牌验证
- 持久化登录状态
- 自动跳转到个人账户页面

### 3. 会话管理
- JWT令牌自动验证
- 令牌过期自动登出
- 跨页面会话保持

### 4. 导航状态
- 未登录: 显示"登录/注册"链接
- 已登录: 显示用户名、"我的账户"链接和登出按钮

## API接口

### POST /api/auth/register
**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe"
}
```

**响应**:
```json
{
  "success": true,
  "user": {
    "id": 123,
    "email": "user@example.com",
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe"
  },
  "token": "jwt-token-here"
}
```

### POST /api/auth/login
**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "success": true,
  "user": {
    "id": 123,
    "email": "user@example.com",
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe"
  },
  "token": "jwt-token-here"
}
```

### POST /api/auth/verify
**请求头**:
```
Authorization: Bearer jwt-token-here
```

**响应**:
```json
{
  "success": true,
  "valid": true
}
```

## 使用指南

### 1. 在组件中使用认证状态
```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, login, register, logout } = useAuth()
  
  if (!isAuthenticated) {
    return <div>请登录</div>
  }
  
  return <div>欢迎, {user.name}</div>
}
```

### 2. 保护页面
```tsx
import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])
  
  if (isLoading) {
    return <div>加载中...</div>
  }
  
  return <div>受保护的内容</div>
}
```

### 3. 表单处理
```tsx
function LoginForm() {
  const { login, isLoading } = useAuth()
  const router = useRouter()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const success = await login(email, password)
    if (success) {
      router.push('/my-account')
    } else {
      alert('登录失败')
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* 表单字段 */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? '登录中...' : '登录'}
      </button>
    </form>
  )
}
```

## 安全考虑

### 1. 令牌管理
- JWT令牌存储在localStorage中
- 定期验证令牌有效性
- 令牌过期自动清除

### 2. 错误处理
- 网络错误捕获
- 认证失败处理
- 用户友好的错误信息

### 3. 输入验证
- 客户端表单验证
- 服务端API验证
- 密码强度检查

## 测试

### 1. 单元测试
- AuthContext功能测试
- API路由测试
- 表单验证测试

### 2. 集成测试
- 注册流程测试
- 登录流程测试
- 路由保护测试

### 3. 手动测试
- 浏览器兼容性测试
- 移动端响应式测试

## 部署注意事项

### 1. WordPress要求
- 安装并配置JWT Authentication插件
- 确保REST API正确启用
- 配置CORS设置

### 2. WooCommerce配置
- 确保WooCommerce REST API可用
- 配置API密钥和权限
- 测试API连接

### 3. 环境配置
- 设置正确的环境变量
- 确保HTTPS在生产环境
- 配置CDN和缓存策略

## 故障排除

### 常见问题

1. **"useAuth must be used within an AuthProvider"错误**
   - 确保应用程序根目录被AuthProvider包裹
   - 检查GlobalProvider配置

2. **JWT令牌验证失败**
   - 检查WordPress JWT配置
   - 验证环境变量设置
   - 确认令牌格式正确

3. **WooCommerce API错误**
   - 验证API密钥权限
   - 检查网络连接
   - 确认API端点URL

### 调试工具
- 浏览器开发者工具 (Console/Network)
- Next.js开发服务器日志
- WordPress调试日志

## 未来改进

### 计划中的功能
- [ ] 第三方OAuth登录 (Google, Facebook)
- [ ] 邮箱验证流程
- [ ] 密码重置功能
- [ ] 双因素认证
- [ ] 用户头像上传
- [ ] 社交媒体链接

### 性能优化
- [ ] 令牌缓存策略
- [ ] API响应缓存
- [ ] 懒加载优化

---

**创建日期**: 2025-11-12  
**最后更新**: 2025-11-12  
**版本**: 1.0  
**作者**: AI Assistant