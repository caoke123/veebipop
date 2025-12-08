'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { PaperPlaneTilt } from '@phosphor-icons/react/dist/ssr'
import toast from 'react-hot-toast'

type FormData = {
  firstName: string
  lastName: string
  email: string
  message: string
  website_hp?: string
}

export default function InlineAboutContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ mode: 'onChange' })

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    
    // Loading toast
    const loadingToast = toast.loading('Sending your message...')

    try {
      const name = `${data.firstName} ${data.lastName}`.trim()
      const res = await fetch('/api/contact-forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: data.email,
          phone: '',
          message: data.message,
          page_url: window.location.href,
          website_hp: data.website_hp // Pass honeypot field
        })
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Sorry, something went wrong. Please try again later.')
      }
      
      // Success toast (duration 4000ms)
      toast.success('Thank you! Your message has been sent successfully.', {
        id: loadingToast,
        duration: 4000
      })
      
      // Do NOT reset form as per requirement
      // reset()
      
    } catch (e: any) {
      toast.error(e?.message || 'Sorry, something went wrong. Please try again later.', {
        id: loadingToast,
        duration: 5000
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {/* Honeypot field - hidden from users but visible to bots */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website-hp-about">Website</label>
        <input
          type="text"
          id="website-hp-about"
          tabIndex={-1}
          autoComplete="off"
          {...register('website_hp')}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-black mb-2">First Name <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green focus:border-green outline-none transition-all ${
              errors.firstName ? 'border-red-500' : 'border-line'
            }`} 
            placeholder="John" 
            {...register('firstName', { required: 'First Name is required' })} 
          />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-2">Last Name <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green focus:border-green outline-none transition-all ${
              errors.lastName ? 'border-red-500' : 'border-line'
            }`} 
            placeholder="Doe" 
            {...register('lastName', { required: 'Last Name is required' })} 
          />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-2">Email Address <span className="text-red-500">*</span></label>
        <input 
          type="email" 
          className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green focus:border-green outline-none transition-all ${
            errors.email ? 'border-red-500' : 'border-line'
          }`} 
          placeholder="john@company.com" 
          {...register('email', { 
            required: 'Email is required', 
            pattern: { 
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
              message: 'Please enter a valid email address' 
            } 
          })} 
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-2">Message <span className="text-red-500">*</span></label>
        <textarea 
          rows={4} 
          className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green focus:border-green outline-none transition-all ${
            errors.message ? 'border-red-500' : 'border-line'
          }`} 
          placeholder="Tell us about your project requirements, estimated quantity, etc." 
          {...register('message', { required: 'Message is required' })} 
        />
        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
      </div>

      <button type="submit" className="w-full py-4 bg-black hover:bg-green text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2">
        {isSubmitting ? 'Sending...' : 'Send Message'} <PaperPlaneTilt size={18} />
      </button>
    </form>
  )
}
