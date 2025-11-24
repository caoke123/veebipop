'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { PaperPlaneTilt } from '@phosphor-icons/react/dist/ssr'

type FormData = {
  name: string
  company?: string
  email: string
  message: string
}

export default function InlineContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ mode: 'onChange' })

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/contact-forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: '',
          message: data.message,
          page_url: window.location.href
        })
      })
      if (!res.ok) throw new Error('Sorry, something went wrong. Please try again later.')
      alert('Thank you! Your message has been sent successfully.')
      reset()
    } catch (e: any) {
      alert(e?.message || 'Sorry, something went wrong. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-6 relative z-10" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-black ml-1">Name</label>
          <input
            type="text"
            className="w-full px-5 py-4 rounded-xl bg-surface border-2 border-transparent focus:bg-white focus:border-black focus:outline-none transition-all font-medium placeholder:text-secondary2"
            placeholder="Your name"
            {...register('name', { required: 'This field is required' })}
          />
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
        <label className="text-sm font-bold text-black ml-1">Email</label>
        <input
          type="email"
          className="w-full px-5 py-4 rounded-xl bg-surface border-2 border-transparent focus:bg-white focus:border-black focus:outline-none transition-all font-medium placeholder:text-secondary2"
          placeholder="name@example.com"
          {...register('email', { required: 'This field is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' } })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-black ml-1">Project Details</label>
        <textarea
          rows={5}
          className="w-full px-5 py-4 rounded-xl bg-surface border-2 border-transparent focus:bg-white focus:border-black focus:outline-none transition-all font-medium placeholder:text-secondary2 resize-none"
          placeholder="Tell us about your product type, estimated quantity, and timeline..."
          {...register('message', { required: 'This field is required' })}
        />
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
