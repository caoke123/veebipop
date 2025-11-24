// 表单无障碍功能工具函数

// ARIA属性生成器
export const ariaAttributes = {
  // 通用ARIA属性
  getLabel: (id: string, required: boolean = false, error?: string) => ({
    id,
    htmlFor: id,
    className: `block text-sm font-medium text-gray-700 ${error ? 'text-red-600' : ''}`,
    'aria-required': required,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${id}-error` : undefined
  }),

  // 输入字段ARIA属性
  getInput: (id: string, type: string, placeholder?: string, required: boolean = false, error?: string, disabled: boolean = false) => ({
    id,
    type,
    placeholder,
    required,
    disabled,
    'aria-required': required,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${id}-error` : undefined,
    'aria-label': placeholder
  }),

  // 选择框ARIA属性
  getSelect: (id: string, required: boolean = false, error?: string, disabled: boolean = false) => ({
    id,
    'aria-required': required,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${id}-error` : undefined,
    'aria-label': '选择选项',
    role: 'combobox',
    'aria-expanded': false
  }),

  // 复选框ARIA属性
  getCheckbox: (id: string, label: string, required: boolean = false, error?: string, disabled: boolean = false) => ({
    id,
    type: 'checkbox',
    required,
    disabled,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${id}-error` : undefined,
    'aria-label': label,
    role: 'checkbox',
    'aria-checked': false
  }),

  // 表单ARIA属性
  getForm: (title: string, description?: string) => ({
    role: 'form',
    'aria-labelledby': 'form-title',
    'aria-describedby': description ? 'form-description' : undefined,
    'noValidate': false
  }),

  // 错误消息ARIA属性
  getError: (id: string, message: string) => ({
    id: `${id}-error`,
    role: 'alert',
    'aria-live': 'polite',
    'aria-atomic': true
  }),

  // 加载状态ARIA属性
  getLoading: (message: string) => ({
    'aria-label': message,
    'aria-busy': true,
    'aria-live': 'polite'
  }),

  // 成功状态ARIA属性
  getSuccess: (message: string) => ({
    'aria-label': message,
    'role': 'status',
    'aria-live': 'polite'
  })
}

// 键盘导航支持
export const keyboardNavigation = {
  // 焦点管理
  focusNextField: (currentFieldId: string, nextFieldId: string) => {
    const currentElement = document.getElementById(currentFieldId)
    const nextElement = document.getElementById(nextFieldId)
    
    if (currentElement && nextElement) {
      currentElement.setAttribute('tabindex', '-1')
      nextElement.setAttribute('tabindex', '0')
      nextElement.focus()
    }
  },

  // Enter键提交
  submitOnEnter: (formId: string, submitCallback: () => void) => {
    const form = document.getElementById(formId)
    if (!form) return

    form.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && event.target instanceof HTMLElement) {
        event.preventDefault()
        submitCallback()
      }
    })
  },

  // Tab键导航
  setupTabNavigation: (containerSelector: string) => {
    const container = document.querySelector(containerSelector)
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
    )

    const handleTabKey = (event: KeyboardEvent) => {
      const focusables = Array.from(focusableElements) as HTMLElement[]
      const currentIndex = focusables.findIndex(el => el === document.activeElement)
      
      if (event.key === 'Tab') {
        event.preventDefault()
        
        const nextIndex = event.shiftKey 
          ? (currentIndex - 1 + focusables.length) % focusables.length
          : (currentIndex + 1) % focusables.length
        
        const nextElement = focusables[nextIndex]
        if (nextElement) {
          nextElement.focus()
        }
      } else if (event.key === 'Tab' && event.shiftKey) {
        event.preventDefault()
        
        const prevIndex = (currentIndex - 1 + focusables.length) % focusables.length
        
        const prevElement = focusables[prevIndex]
        if (prevElement) {
          prevElement.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
  },

  // 方向键导航
  setupArrowNavigation: (containerSelector: string) => {
    const container = document.querySelector(containerSelector)
    if (!container) return

    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(
        'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
      )
    )

    const handleArrowKey = (event: KeyboardEvent) => {
      const currentIndex = focusableElements.findIndex(el => el === document.activeElement)
      
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        const nextIndex = (currentIndex + 1) % focusableElements.length
        const nextElement = focusableElements[nextIndex]
        if (nextElement) {
          nextElement.focus()
        }
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        const prevIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length
        const prevElement = focusableElements[prevIndex]
        if (prevElement) {
          prevElement.focus()
        }
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        const currentRow = Math.floor(currentIndex / getColumns())
        const nextRow = currentRow + 1
        const nextIndex = nextRow * getColumns()
        const nextElement = focusableElements[nextIndex]
        if (nextElement) {
          nextElement.focus()
        }
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        const currentRow = Math.floor(currentIndex / getColumns())
        const prevRow = currentRow - 1
        const nextIndex = prevRow * getColumns()
        const prevElement = focusableElements[nextIndex]
        if (prevElement) {
          prevElement.focus()
        }
      }
    }

    const getColumns = () => {
      const containerWidth = container?.clientWidth || 800
      const elementWidth = 200 // 估算元素宽度
      return Math.floor(containerWidth / elementWidth)
    }

    container.addEventListener('keydown', handleArrowKey)
  }
}

// 屏幕阅读器支持
export const screenReaderSupport = {
  // 检查屏幕阅读器是否可用
  isAvailable: () => {
    return (
      typeof window !== 'undefined' &&
      (
        'speechSynthesis' in window ||
        'webkitSpeechSynthesis' in (window as any)
      )
    )
  },

  // 朗读文本
  speak: (text: string, options: any = {}) => {
    if (!screenReaderSupport.isAvailable()) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onend = () => {
      console.log('Speech synthesis completed')
    }
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event)
    }

    window.speechSynthesis.speak(utterance)
  },

  // 停止朗读
  cancel: () => {
    if (!screenReaderSupport.isAvailable()) return
    window.speechSynthesis.cancel()
  },

  // 朗读表单错误
  speakErrors: (errors: Record<string, string>) => {
    const errorMessages = Object.values(errors).filter(Boolean)
    if (errorMessages.length > 0) {
      const message = `表单有以下错误：${errorMessages.join('，')}`
      screenReaderSupport.speak(message)
    }
  }
}

// 响应式设计工具
export const responsive = {
  // 检测设备类型
  isMobile: () => {
    return typeof window !== 'undefined' && 
           window.innerWidth <= 768
  },

  isTablet: () => {
    return typeof window !== 'undefined' && 
           window.innerWidth > 768 && window.innerWidth <= 1024
  },

  isDesktop: () => {
    return typeof window !== 'undefined' && 
           window.innerWidth > 1024
  },

  // 获取断点
  getBreakpoints: () => ({
    mobile: 768,
    tablet: 1024,
    desktop: 1200,
    largeDesktop: 1440
  }),

  // 响应式类名生成
  getResponsiveClass: (mobileClass: string, tabletClass: string, desktopClass: string) => {
    if (responsive.isMobile()) return mobileClass
    if (responsive.isTablet()) return tabletClass
    if (responsive.isDesktop()) return desktopClass
    return desktopClass
  },

  // 媒体查询
  getMediaQuery: (query: string) => {
    if (typeof window === 'undefined') return null
    return window.matchMedia(query)
  }
}

// 表单动画工具
export const animations = {
  // 淡入动画
  fadeIn: (element: HTMLElement, duration: number = 300) => {
    element.style.opacity = '0'
    element.style.transition = `opacity ${duration}ms ease-in-out`
    
    setTimeout(() => {
      element.style.opacity = '1'
    }, 50)
  },

  // 滑入动画
  slideIn: (element: HTMLElement, direction: 'left' | 'right' | 'up' | 'down' = 'up', duration: number = 300) => {
    const translate = direction === 'left' ? '-100%' : 
                    direction === 'right' ? '100%' : 
                    direction === 'up' ? '-100%' : 
                    direction === 'down' ? '100%' : '0%'
    
    element.style.transform = `translateY(${translate})`
    element.style.transition = `transform ${duration}ms ease-in-out`
    element.style.opacity = '0'
    
    setTimeout(() => {
      element.style.transform = 'translateY(0)'
      element.style.opacity = '1'
    }, 50)
  },

  // 震动效果
  shake: (element: HTMLElement, duration: number = 500) => {
    element.style.animation = `shake ${duration}ms ease-in-out`
    
    setTimeout(() => {
      element.style.animation = ''
    }, duration)
  },

  // 脉冲效果
  pulse: (element: HTMLElement, duration: number = 1000) => {
    element.style.animation = `pulse ${duration}ms ease-in-out infinite`
  }
}

// 表单工具函数
export const formUtils = {
  // 自动调整文本区域高度
  autoResizeTextarea: (textarea: HTMLTextAreaElement) => {
    const resize = () => {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }

    textarea.addEventListener('input', resize)
    textarea.addEventListener('focus', resize)
  },

  // 格式化文件大小
  formatFileSize: (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    
    if (i < 1) return `${bytes} ${sizes[0]}`
    if (i < 2) return `${(bytes / 1024).toFixed(2)} ${sizes[1]}`
    if (i < 3) return `${(bytes / 1024 / 1024).toFixed(2)} ${sizes[2]}`
    
    return `${(bytes / 1024 / 1024).toFixed(2)} ${sizes[3]}`
  },

  // 生成唯一ID
  generateId: (prefix: string) => {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`
  },

  // 防抖函数
  debounce: (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout | null = null
    
    return (...args: any[]) => {
      if (timeoutId) clearTimeout(timeoutId)
      
      timeoutId = setTimeout(() => {
        func(...args)
        timeoutId = null
      }, delay)
    }
  },

  // 节流函数
  throttle: (func: Function, limit: number) => {
    let inThrottle = false
    let lastExecTime = 0
    
    return (...args: any[]) => {
      const now = Date.now()
      
      if (!inThrottle || now - lastExecTime >= limit) {
        func(...args)
        lastExecTime = now
        inThrottle = true
        
        setTimeout(() => {
          inThrottle = false
        }, limit)
      }
    }
  }
}

// 表单验证工具
export const validationUtils = {
  // 实时验证
  validateOnTyping: (value: string, validator: (value: string) => boolean) => {
    return validator(value)
  },

  // 延迟验证
  validateOnBlur: (value: string, validator: (value: string) => boolean) => {
    return validator(value)
  },

  // 密码强度检查
  checkPasswordStrength: (password: string) => {
    const hasLower = /[a-z]/.test(password)
    const hasUpper = /[A-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    let strength = 0
    if (password.length >= 8) strength++
    if (hasLower) strength++
    if (hasUpper) strength++
    if (hasNumber) strength++
    if (hasSpecial) strength++
    
    if (strength <= 2) return { strength, level: 'weak', color: 'red' }
    if (strength <= 3) return { strength, level: 'fair', color: 'yellow' }
    if (strength <= 4) return { strength, level: 'good', color: 'blue' }
    return { strength, level: 'strong', color: 'green' }
  },

  // 邮箱格式验证
  isValidEmail: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // 手机号格式验证
  isValidPhone: (phone: string) => {
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(phone.replace(/[^\d]/g, ''))
  }
}
