import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '../LoginForm'

// Mock hooks
const mockUseAuth = () => ({
  login: jest.fn().mockResolvedValue(true),
  user: {
    id: 1,
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User'
  }
})

describe('LoginForm', () => {
  beforeEach(() => {
    // 清除所有mock
    jest.clearAllMocks()
  })

  it('renders login form correctly', () => {
    render(<LoginForm />)
    
    expect(screen.getByLabelText('邮箱地址')).toBeInTheDocument()
    expect(screen.getByLabelText('密码')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /记住我/i })).toBeInTheDocument()
  })

  it('shows validation errors for invalid input', async () => {
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText('邮箱地址')
    const passwordInput = screen.getByLabelText('密码')
    const submitButton = screen.getByRole('button', { name: /登录/i })

    // 测试空表单提交
    fireEvent.click(submitButton)
    
    await screen.findByText('邮箱地址不能为空')
    expect(emailInput).toHaveAttribute('aria-invalid', 'true')
    expect(passwordInput).toHaveAttribute('aria-invalid', 'true')
  })

  it('validates email format', async () => {
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText('邮箱地址')
    const submitButton = screen.getByRole('button', { name: /登录/i })

    // 输入无效邮箱格式
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(submitButton)
    
    await screen.findByText('请输入有效的邮箱地址')
    expect(emailInput).toHaveAttribute('aria-invalid', 'true')
  })

  it('handles successful login', async () => {
    const { login } = mockUseAuth()
    
    render(<LoginForm onSuccess={jest.fn()} />)
    
    const emailInput = screen.getByLabelText('邮箱地址')
    const passwordInput = screen.getByLabelText('密码')
    const submitButton = screen.getByRole('button', { name: /登录/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('handles remember me functionality', () => {
    render(<LoginForm />)
    
    const rememberCheckbox = screen.getByRole('checkbox', { name: /记住我/i })
    expect(rememberCheckbox).toBeInTheDocument()
    
    fireEvent.click(rememberCheckbox)
    expect(rememberCheckbox).toBeChecked()
  })

  it('shows forgot password link', () => {
    render(<LoginForm showForgotPasswordLink={true} />)
    
    const forgotPasswordLink = screen.getByRole('link', { name: /忘记密码？/i })
    expect(forgotPasswordLink).toBeInTheDocument()
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password')
  })

  it('is accessible', () => {
    const { container } = render(<LoginForm />)
    
    // 检查ARIA属性
    expect(container.getByLabelText('邮箱地址')).toHaveAttribute('aria-required', 'true')
    expect(container.getByLabelText('密码')).toHaveAttribute('aria-required', 'true')
    
    // 检查表单角色
    expect(container.getByRole('form')).toBeInTheDocument()
    expect(container.getByRole('form')).toHaveAttribute('noValidate')
  })

  it('handles keyboard navigation', () => {
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText('邮箱地址')
    const passwordInput = screen.getByLabelText('密码')
    const submitButton = screen.getByRole('button', { name: /登录/i })

    // 测试Tab键导航
    emailInput.focus()
    fireEvent.keyDown(emailInput, { key: 'Tab' })
    
    expect(passwordInput).toHaveFocus()
    
    // 测试Enter键提交
    fireEvent.keyDown(passwordInput, { key: 'Enter' })
    
    await waitFor(() => {
      expect(mockUseAuth().login).toHaveBeenCalled()
    }, { timeout: 1000 })
  })

  it('shows loading state during submission', async () => {
    const { login } = mockUseAuth()
    login.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 1000)))
    
    render(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /登录/i })
    fireEvent.click(submitButton)
    
    expect(screen.getByText('登录中...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
    
    await waitFor(() => {
      expect(screen.getByText('登录')).toBeInTheDocument()
      expect(submitButton).not.toBeDisabled()
    }, { timeout: 2000 })
  })
})