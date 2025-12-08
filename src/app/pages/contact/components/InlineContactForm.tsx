'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { PaperPlaneTilt } from '@phosphor-icons/react/dist/ssr'
import toast from 'react-hot-toast'

type FormData = {
  name: string
  company?: string
  email: string
  message: string
  website_hp?: string
}

export default function InlineContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ mode: 'onChange' })

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    
    // Loading toast
    const loadingToast = toast.loading('Sending your message...')
    
    try {
      const res = await fetch('/api/contact-forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
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
    <form className="space-y-6 relative z-10" onSubmit={handleSubmit(onSubmit)}>
      {/* Honeypot field - hidden from users but visible to bots */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website-hp">Website</label>
        <input
          type="text"
          id="website-hp"
          tabIndex={-1}
          autoComplete="off"
          {...register('website_hp')}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-black ml-1">Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            className={`w-full px-5 py-4 rounded-xl bg-surface border-2 focus:bg-white focus:outline-none transition-all font-medium placeholder:text-secondary2 ${
              errors.name ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:border-black'
            }`}
            placeholder="Your name"
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && <p className="text-red-500 text-xs ml-1">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-black ml-1">Company</label>
          <input
            type="text"
            className="w-full px-5 py-4 rounded-xl bg-surface border-2 border-transparent focus:bg-white focus:border-black focus:outline-none transition-all font-medium placeholder:text-secondary2"
            placeholder="Your company"
            {...register('company')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-black ml-1">Email <span className="text-red-500">*</span></label>
        <input
          type="email"
          className={`w-full px-5 py-4 rounded-xl bg-surface border-2 focus:bg-white focus:outline-none transition-all font-medium placeholder:text-secondary2 ${
            errors.email ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:border-black'
          }`}
          placeholder="name@example.com"
          {...register('email', { 
            required: 'Email is required', 
            pattern: { 
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
              message: 'Please enter a valid email address' 
            } 
          })}
        />
        {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-black ml-1">Project Details <span className="text-red-500">*</span></label>
        <textarea
          rows={5}
          className={`w-full px-5 py-4 rounded-xl bg-surface border-2 focus:bg-white focus:outline-none transition-all font-medium placeholder:text-secondary2 resize-none ${
            errors.message ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:border-black'
          }`}
          placeholder="Tell us about your product type, estimated quantity, and timeline..."
          {...register('message', { required: 'Message is required' })}
        />
        {errors.message && <p className="text-red-500 text-xs ml-1">{errors.message.message}</p>}
      </div>

      <button type="submit" className="w-full py-4 bg-black text-white font-bold text-lg rounded-xl hover:bg-green hover:text-black transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-black/10">
        {isSubmitting ? 'Sending...' : 'Send Message'}
        <PaperPlaneTilt className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>

      <p className="text-center text-xs text-secondary2 mt-4">
        By sending this message, you agree to our privacy policy. We respect your inbox.
      </p>
    </form>
  )
}
