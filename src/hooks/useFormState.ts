'use client'

import { useState, useCallback, useEffect } from 'react'

// 表单状态类型
export interface FormState<T = any> {
  data: T
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isDirty: boolean
  isValid: boolean
  submitCount: number
  lastSubmitTime: Date | null
}

// 表单状态管理Hook
export function useFormState<T = any>(initialData: T) {
  const [state, setState] = useState<FormState<T>>({
    data: initialData,
    errors: {},
    touched: {},
    isSubmitting: false,
    isDirty: false,
    isValid: false,
    submitCount: 0,
    lastSubmitTime: null
  })

  // 设置字段错误
  const setFieldError = useCallback((field: string, error: string) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: error
      },
      touched: {
        ...prev.touched,
        [field]: true
      }
    }))
  }, [])

  // 清除字段错误
  const clearFieldError = useCallback((field: string) => {
    setState(prev => {
      const newErrors = { ...prev.errors }
      const newTouched = { ...prev.touched }
      
      delete newErrors[field]
      delete newTouched[field]
      
      return {
        ...prev,
        errors: newErrors,
        touched: newTouched
      }
    })
  }, [])

  // 清除所有错误
  const clearAllErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: {},
      touched: {}
    }))
  }, [])

  // 设置提交状态
  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setState(prev => ({
      ...prev,
      isSubmitting
    }))
  }, [])

  // 设置数据
  const setData = useCallback((data: Partial<T>) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, ...data },
      isDirty: true
    }))
  }, [])

  // 更新字段数据
  const updateField = useCallback((field: string, value: any) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value
      },
      touched: {
        ...prev.touched,
        [field]: true
      },
      isDirty: true
    }))
  }, [])

  // 重置表单
  const resetForm = useCallback((newData?: T) => {
    setState({
      data: newData || initialData,
      errors: {},
      touched: {},
      isSubmitting: false,
      isDirty: false,
      isValid: false,
      submitCount: 0,
      lastSubmitTime: null
    })
  }, [])

  // 验证表单
  const validateForm = useCallback((validator: (data: T) => Record<string, string>) => {
    setState(prev => {
      const errors = validator(prev.data)
      const isValid = Object.keys(errors).length === 0
      
      return {
        ...prev,
        errors,
        isValid
      }
    })
  }, [])

  // 记录提交
  const recordSubmit = useCallback(() => {
    setState(prev => ({
      ...prev,
      submitCount: prev.submitCount + 1,
      lastSubmitTime: new Date()
    }))
  }, [])

  // 获取表单状态摘要
  const getFormSummary = useCallback(() => {
    const { data, errors, touched, isSubmitting, isDirty, isValid, submitCount, lastSubmitTime } = state
    
    const touchedCount = Object.values(touched).filter(Boolean).length
    const errorCount = Object.keys(errors).length
    
    return {
      data,
      errors,
      touchedCount,
      errorCount,
      isSubmitting,
      isDirty,
      isValid,
      submitCount,
      lastSubmitTime,
      hasErrors: errorCount > 0,
      hasTouched: touchedCount > 0,
      completionRate: touchedCount > 0 ? (touchedCount - errorCount) / touchedCount : 0
    }
  }, [state])

  return {
    ...state,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    setSubmitting,
    setData,
    updateField,
    resetForm,
    validateForm,
    recordSubmit,
    getFormSummary
  }
}

// 表单加载状态Hook
export function useFormLoading(initialLoading = false, delay = 300) {
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [loadingMessage, setLoadingMessage] = useState('')

  const startLoading = useCallback((message?: string) => {
    setIsLoading(true)
    setLoadingMessage(message || '加载中...')
  }, [])

  const stopLoading = useCallback(() => {
    setTimeout(() => {
      setIsLoading(false)
      setLoadingMessage('')
    }, delay)
  }, [delay])

  return {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading
  }
}

// 表单自动保存Hook
export function useFormAutoSave<T = any>(
  key: string,
  initialData: T,
  saveDelay = 1000
) {
  const [savedData, setSavedData] = useState<T | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null)

  // 自动保存数据
  const autoSave = useCallback((data: T) => {
    setSavedData(data)
    setLastSaveTime(new Date())
    setIsSaving(true)
    
    // 模拟保存到localStorage
    try {
      localStorage.setItem(key, JSON.stringify(data))
      setTimeout(() => {
        setIsSaving(false)
      }, 500)
    } catch (error) {
      console.error('Auto save failed:', error)
      setIsSaving(false)
    }
  }, [key])

  // 恢复保存的数据
  const restoreSavedData = useCallback(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved) {
        const data = JSON.parse(saved) as T
        setSavedData(data)
        return data
      }
    } catch (error) {
      console.error('Restore saved data failed:', error)
      return null
    }
  }, [key])

  // 清除保存的数据
  const clearSavedData = useCallback(() => {
    localStorage.removeItem(key)
    setSavedData(null)
    setLastSaveTime(null)
  }, [key])

  // 检查是否有保存的数据
  const hasSavedData = useCallback(() => {
    return !!savedData
  }, [savedData])

  return {
    savedData,
    isSaving,
    lastSaveTime,
    autoSave,
    restoreSavedData,
    clearSavedData,
    hasSavedData
  }
}

// 表单防抖Hook
export function useFormDebounce<T = any>(delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState<T | null>(null)
  const [isDebouncing, setIsDebouncing] = useState(false)

  const debouncedSetValue = useCallback((value: T) => {
    setIsDebouncing(true)
    setDebouncedValue(value)
    
    setTimeout(() => {
      setDebouncedValue(value)
      setIsDebouncing(false)
    }, delay)
  }, [delay])

  return {
    debouncedValue,
    isDebouncing,
    setDebouncedValue
  }
}

// 表单字段焦点管理
export function useFormFocus() {
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const setFieldFocus = useCallback((field: string) => {
    setFocusedField(field)
  }, [])

  const clearFieldFocus = useCallback(() => {
    setFocusedField(null)
  }, [])

  const isFieldFocused = useCallback((field: string) => {
    return focusedField === field
  }, [focusedField])

  return {
    focusedField,
    setFieldFocus,
    clearFieldFocus,
    isFieldFocused
  }
}

// 表单进度Hook
export function useFormProgress(totalSteps: number) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, totalSteps])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step)
  }, [])

  const completeStep = useCallback((step: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev)
      next.add(step)
      return next
    })
  }, [])

  const isStepCompleted = useCallback((step: number) => {
    return completedSteps.has(step)
  }, [completedSteps])

  const getProgress = useCallback(() => {
    return {
      currentStep,
      totalSteps,
      completedSteps: Array.from(completedSteps),
      completedCount: completedSteps.size,
      progressPercentage: (completedSteps.size / totalSteps) * 100,
      isComplete: completedSteps.size === totalSteps
    }
  }, [currentStep, totalSteps, completedSteps])

  return {
    currentStep,
    totalSteps,
    completedSteps: Array.from(completedSteps),
    nextStep,
    prevStep,
    goToStep,
    completeStep,
    isStepCompleted,
    getProgress
  }
}

// 表单多步骤管理
export function useMultiStepForm<T = any>(steps: Array<{ name: string; component: React.ComponentType<any> }>) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [stepData, setStepData] = useState<Record<number, Partial<T>>>({})

  const currentStep = steps[currentStepIndex]
  const CurrentComponent = currentStep?.component

  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    }
  }, [currentStepIndex, steps.length])

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }, [currentStepIndex])

  const goToStep = useCallback((stepIndex: number) => {
    setCurrentStepIndex(stepIndex)
  }, [])

  const updateStepData = useCallback((data: Partial<T>) => {
    setStepData(prev => ({
      ...prev,
      [currentStepIndex]: {
        ...prev[currentStepIndex],
        ...data
      }
    }))
  }, [currentStepIndex])

  const getStepData = useCallback((stepIndex?: number) => {
    return stepIndex !== undefined ? stepData[stepIndex] : stepData[currentStepIndex]
  }, [stepData, currentStepIndex])

  const getAllStepData = useCallback(() => {
    return stepData
  }, [stepData])

  const isStepValid = useCallback((stepIndex?: number) => {
    const data = stepIndex !== undefined ? stepData[stepIndex] : stepData[currentStepIndex]
    // 这里可以添加验证逻辑
    return Object.keys(data).length > 0
  }, [stepData, currentStepIndex])

  const canProceedToNext = useCallback(() => {
    return isStepValid(currentStepIndex) && currentStepIndex < steps.length - 1
  }, [isStepValid, currentStepIndex, steps.length])

  return {
    currentStepIndex,
    currentStep,
    CurrentComponent,
    nextStep,
    prevStep,
    goToStep,
    updateStepData,
    getStepData,
    getAllStepData,
    isStepValid,
    canProceedToNext
  }
}
