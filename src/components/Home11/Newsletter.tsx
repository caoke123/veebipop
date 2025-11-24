'use client'

import React from 'react'
import { useForm } from 'react-hook-form'

const Newsletter = () => {
    const { register, handleSubmit, reset } = useForm<{ email: string }>({ mode: 'onChange' })

    const onSubmit = async (data: { email: string }) => {
        try {
            const res = await fetch('/api/contact-forward', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Newsletter',
                    email: data.email,
                    phone: '',
                    message: 'Newsletter subscription request',
                    page_url: typeof window !== 'undefined' ? window.location.href : ''
                })
            })
            if (!res.ok) throw new Error('Sorry, something went wrong. Please try again later.')
            alert('Thank you! Your message has been sent successfully.')
            reset()
        } catch (e: any) {
            alert(e?.message || 'Sorry, something went wrong. Please try again later.')
        }
    }

    return (
        <>
            <div className={`newsletter-block bg-green py-7 md:mt-20 mt-10`}>
                <div className="container flex max-lg:flex-col items-center lg:justify-between justify-center gap-8 gap-y-4">
                    <div className="text-content">
                        <div className="heading3 max-lg:text-center">Source Factory · Real Wholesale Price</div>
                        <div className='mt-2 max-lg:text-center'>Get Wholesale Price Now</div>
                    </div>
                    <div className="input-block xl:w-5/12 md:w-1/2 sm:w-3/5 w-full h-[52px]">
                        <form className='w-full h-full relative' action="/api/subscribe" method="POST" onSubmit={handleSubmit(onSubmit)}>
                            <input type="email" placeholder='Enter your e-mail' className='caption1 w-full h-full pl-4 pr-14 rounded-xl border border-line' required {...register('email', { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })} />
                            <button type='submit' className='button-main bg-green text-black absolute top-1 bottom-1 right-1 flex items-center justify-center'>Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Newsletter
