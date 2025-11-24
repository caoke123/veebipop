'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { PaperPlaneTilt } from '@phosphor-icons/react/dist/ssr'

type FormData = {
  firstName: string
  lastName: string
  email: string
  message: string
}

export default function InlineAboutContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, reset } = useForm<FormData>({ mode: 'onChange' })

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return
    setIsSubmitting(true)
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
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-black mb-2">First Name</label>
          <input type="text" className="w-full px-4 py-3 rounded-lg border border-line focus:ring-2 focus:ring-green focus:border-green outline-none transition-all" placeholder="John" {...register('firstName', { required: 'This field is required' })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-2">Last Name</label>
          <input type="text" className="w-full px-4 py-3 rounded-lg border border-line focus:ring-2 focus:ring-green focus:border-green outline-none transition-all" placeholder="Doe" {...register('lastName', { required: 'This field is required' })} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-2">Email Address</label>
        <input type="email" className="w-full px-4 py-3 rounded-lg border border-line focus:ring-2 focus:ring-green focus:border-green outline-none transition-all" placeholder="john@company.com" {...register('email', { required: 'This field is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' } })} />
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-2">Message</label>
        <textarea rows={4} className="w-full px-4 py-3 rounded-lg border border-line focus:ring-2 focus:ring-green focus:border-green outline-none transition-all" placeholder="Tell us about your project requirements, estimated quantity, etc." {...register('message', { required: 'This field is required' })} />
      </div>

      <button type="submit" className="w-full py-4 bg-black hover:bg-green text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2">
        {isSubmitting ? 'Sending...' : 'Send Message'} <PaperPlaneTilt size={18} />
      </button>
    </form>
  )
}
