'use client'

import { useState } from 'react'
import { 
  LoginForm, 
  RegisterForm, 
  ContactForm, 
  AddressForm, 
  CheckoutForm 
} from '@/components/forms'
import { toast } from 'react-hot-toast'

export default function FormsDemoPage() {
  const [activeTab, setActiveTab] = useState('login')

  const handleLoginSuccess = (user: any) => {
    toast.success(`登录成功！欢迎 ${user.email}`)
    console.log('登录成功:', user)
  }

  const handleRegisterSuccess = () => {
    toast.success('注册成功！')
  }

  const handleContactSubmit = async (data: any) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('联系表单提交成功！我们会尽快回复您。')
      console.log('联系表单提交:', data)
    } catch (error) {
      toast.error('提交失败，请稍后重试。')
    }
  }

  const handleAddressSave = (address: any) => {
    toast.success('地址保存成功！')
    console.log('地址保存:', address)
  }

  const handleCheckout = async (data: any) => {
    try {
      // 模拟结算处理
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('订单提交成功！正在跳转到支付页面...')
      console.log('结算数据:', data)
    } catch (error) {
      toast.error('结算失败，请稍后重试。')
    }
  }

  // 模拟购物车数据
  const mockCartItems = [
    {
      id: 1,
      name: '精美珠宝项链',
      price: 299.99,
      quantity: 1,
      image: '/images/product/1000x1000.png'
    },
    {
      id: 2,
      name: '有机护肤品套装',
      price: 199.99,
      quantity: 2,
      image: '/images/product/1000x1000.png'
    }
  ]

  const mockTotal = 699.97

  const tabs = [
    { id: 'login', label: '登录表单', icon: '🔐' },
    { id: 'register', label: '注册表单', icon: '📝' },
    { id: 'contact', label: '联系表单', icon: '💬' },
    { id: 'address', label: '地址表单', icon: '📍' },
    { id: 'checkout', label: '结算表单', icon: '🛒' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            表单组件演示
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            这里展示了 VeebiPop 项目中所有表单组件的使用示例。
            所有表单都基于 React Hook Form + Zod + TypeScript 构建，
            提供完整的类型安全和验证功能。
          </p>
        </div>

        {/* 标签导航 */}
        <div className="flex flex-wrap justify-center mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 m-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="mr-2 text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* 表单内容区域 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* 登录表单 */}
          {activeTab === 'login' && (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">用户登录</h2>
                <p className="text-gray-600">
                  使用您的邮箱地址登录账户
                </p>
              </div>
              <LoginForm 
                onSuccess={handleLoginSuccess}
                showForgotPasswordLink={true}
                showSocialLogin={true}
              />
            </div>
          )}

          {/* 注册表单 */}
          {activeTab === 'register' && (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">创建账户</h2>
                <p className="text-gray-600">
                  注册新账户，享受更多会员权益
                </p>
              </div>
              <RegisterForm 
                onSuccess={handleRegisterSuccess}
              />
            </div>
          )}

          {/* 联系表单 */}
          {activeTab === 'contact' && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">联系我们</h2>
                <p className="text-gray-600">
                  有任何问题或建议？请随时联系我们
                </p>
              </div>
              <ContactForm 
                onSubmit={handleContactSubmit}
                showFileUpload={true}
                inquiryTypes={['general', 'product', 'order', 'technical', 'complaint', 'cooperation']}
              />
            </div>
          )}

          {/* 地址表单 */}
          {activeTab === 'address' && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">地址管理</h2>
                <p className="text-gray-600">
                  添加或编辑您的收货地址
                </p>
              </div>
              <AddressForm 
                onSave={handleAddressSave}
                type="billing"
                showSaveAsDefault={true}
              />
            </div>
          )}

          {/* 结算表单 */}
          {activeTab === 'checkout' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">订单结算</h2>
                <p className="text-gray-600">
                  请填写结算信息完成订单
                </p>
              </div>
              <CheckoutForm 
                onSubmit={handleCheckout}
                cartItems={mockCartItems}
                total={mockTotal}
                showCreateAccount={true}
              />
            </div>
          )}
        </div>

        {/* 功能特性说明 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-2xl mb-3">✅</div>
            <h3 className="font-semibold text-lg mb-2">完整的表单验证</h3>
            <p className="text-gray-600 text-sm">
              基于 Zod 的类型安全验证，支持实时验证和错误提示
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-green-600 text-2xl mb-3">🎨</div>
            <h3 className="font-semibold text-lg mb-2">响应式设计</h3>
            <p className="text-gray-600 text-sm">
              基于 Tailwind CSS，完美适配移动端和桌面端
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-purple-600 text-2xl mb-3">♿</div>
            <h3 className="font-semibold text-lg mb-2">无障碍支持</h3>
            <p className="text-gray-600 text-sm">
              完整的 ARIA 属性和键盘导航支持
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-orange-600 text-2xl mb-3">🔒</div>
            <h3 className="font-semibold text-lg mb-2">类型安全</h3>
            <p className="text-gray-600 text-sm">
              完整的 TypeScript 支持，提供类型提示和编译时检查
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-red-600 text-2xl mb-3">🚀</div>
            <h3 className="font-semibold text-lg mb-2">高性能</h3>
            <p className="text-gray-600 text-sm">
              基于 React Hook Form，最小化重新渲染，优化性能
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-indigo-600 text-2xl mb-3">🔧</div>
            <h3 className="font-semibold text-lg mb-2">易于定制</h3>
            <p className="text-gray-600 text-sm">
              模块化设计，支持自定义样式和功能扩展
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
