'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { type ContactFormData } from '@/lib/validations/contact'
import { Input, TextArea, Button, Select } from './ui'
import { cn } from '@/lib/form'

interface ContactFormProps {
  onSubmit?: (data: any) => Promise<void>
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
  type?: 'contact' | 'inquiry' | 'support'
  productId?: string
  productName?: string
  showFileUpload?: boolean
  inquiryTypes?: string[]
}

const subjectOptions = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'product', label: 'Product Inquiry' },
  { value: 'order', label: 'Order Issue' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'complaint', label: 'Complaint/Suggestion' },
  { value: 'cooperation', label: 'Business Cooperation' }
]

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
]

export default function ContactForm({ 
  onSuccess, 
  onError, 
  className,
  type = 'contact',
  productId,
  productName
}: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    clearErrors,
    setValue,
    watch,
    reset
  } = useForm<ContactFormData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      subject: type === 'inquiry' && productName ? `Product Inquiry: ${productName}` : '',
      message: '',
      phone: '',
      company: ''
    }
  })

  const selectedSubject = watch('subject')

  // Auto-fill for product inquiry
  React.useEffect(() => {
    if (type === 'inquiry' && productName) {
      setValue('subject', `Product Inquiry: ${productName}`)
      setValue('message', `I am interested in the product "${productName}". Please provide more information.`)
    }
  }, [type, productName, setValue])

  const onSubmit = async (data: ContactFormData) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    clearErrors()

    try {
      const response = await fetch('/api/contact-forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          message: data.message,
          page_url: window.location.href
        })
      })

      if (!response.ok) {
        throw new Error('Sorry, something went wrong. Please try again later.')
      }

      setSubmitStatus('success')
      onSuccess?.()
      reset()
    } catch (error: any) {
      setSubmitStatus('error')
      onError?.(error?.message || 'Sorry, something went wrong. Please try again later.')
      alert('Sorry, something went wrong. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSubmitStatus('idle')
    clearErrors()
    reset()
  }

  if (submitStatus === 'success') {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="mb-4">
          <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Thank you! Your message has been sent successfully.</h3>
        <p className="text-sm text-gray-600 mb-6">
          We will get back to you within 24 hours.
        </p>
        <Button onClick={resetForm} variant="secondary">
          Send Message
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...register('name', { required: 'This field is required' })}
          label="Name"
          type="text"
          placeholder="Your name"
          disabled={isSubmitting}
          autoComplete="name"
          error={errors.name?.message}
          required
        />

        <Input
          {...register('email', { required: 'This field is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' } })}
          label="Email"
          type="email"
          placeholder="name@example.com"
          disabled={isSubmitting}
          autoComplete="email"
          error={errors.email?.message}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...register('phone')}
          label="Phone (optional)"
          type="tel"
          placeholder="Your phone number"
          disabled={isSubmitting}
          autoComplete="tel"
          error={errors.phone?.message}
          helperText="Optional, helps us contact you"
        />

        <Input
          {...register('company')}
          label="Company (optional)"
          type="text"
          placeholder="Your company"
          disabled={isSubmitting}
          autoComplete="organization"
          error={errors.company?.message}
          helperText="Optional"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Subject
        </label>
        <select
          {...register('subject')}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          disabled={isSubmitting || (type === 'inquiry' && !!productName)}
        >
          <option value="">Select subject</option>
          {subjectOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.subject?.message && (
          <p className="mt-1 text-sm text-red-600">
            {errors.subject.message}
          </p>
        )}
      </div>

      {type === 'support' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            {...register('priority' as any)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            disabled={isSubmitting}
          >
            <option value="">Select priority</option>
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {(errors as any).priority?.message && (
            <p className="mt-1 text-sm text-red-600">
              {(errors as any).priority.message}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            We will prioritize urgent issues.
          </p>
        </div>
      )}

      <TextArea
        {...register('message', { required: 'This field is required' })}
        label="Message"
        placeholder="Please describe your question or requirements in detail..."
        rows={6}
        maxLength={2000}
        disabled={isSubmitting}
        error={errors.message?.message}
        required
        helperText={`Please describe your request in detail. ${type === 'inquiry' && productName ? `You are inquiring about: ${productName}` : ''}`}
      />

      {/* 附件上传（可选功能） */}
      {type === 'support' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Related screenshots or files
          </label>
          <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Upload files</span>
                  <input type="file" className="sr-only" multiple accept="image/*,.pdf,.doc,.docx" />
                </label>
                <p className="pl-1">or drag and drop files here</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF, PDF, DOC, DOCX (Max 10MB)
              </p>
            </div>
          </div>
        </div>
      )}

      <Button
        type="submit"
        loading={isSubmitting}
        disabled={!isValid}
        fullWidth
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>

      {/* Privacy */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Privacy</h4>
        <p className="text-xs text-gray-600">
          We protect your personal information. Collected data is used only to respond to your inquiry and is not shared without your consent.
        </p>
      </div>

      {/* FAQ links */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Check our
          <a href="/faq" className="text-blue-600 hover:text-blue-500 font-medium ml-1">
            FAQs
          </a>
          {' '}or
          <a href="/help" className="text-blue-600 hover:text-blue-500 font-medium ml-1">
            Help Center
          </a>
        </p>
      </div>
    </form>
  )
}
