'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuEleven from '@/components/Header/Menu/MenuEleven'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import { useAuth } from '@/contexts/AuthContext'
import * as Icon from "@phosphor-icons/react/dist/ssr";

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        username: ''
    })
    const [agreeTerms, setAgreeTerms] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    
    const { register } = useAuth()
    const router = useRouter()

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        setSuccess('')

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            setIsLoading(false)
            return
        }

        if (!agreeTerms) {
            setError('You must agree to the Terms of Service')
            setIsLoading(false)
            return
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long')
            setIsLoading(false)
            return
        }

        if (!formData.email) {
            setError('Email is required')
            setIsLoading(false)
            return
        }

        try {
            const success = await register({
                email: formData.email,
                password: formData.password,
                first_name: formData.first_name,
                last_name: formData.last_name,
                username: formData.username || formData.email.split('@')[0]
            })
            
            if (success) {
                setSuccess('Account created successfully! You will be redirected to your dashboard.')
                setTimeout(() => {
                    router.push('/my-account')
                }, 2000)
            } else {
                setError('Registration failed. Please try again.')
            }
        } catch (err: any) {
            console.error('Registration error:', err)
            setError(err.message || 'An error occurred during registration. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuEleven />
                <Breadcrumb heading='Create An Account' subHeading='Create An Account' />
            </div>
            <div className="register-block md:py-20 py-10">
                <div className="container">
                    <div className="content-main flex gap-y-8 max-md:flex-col">
                        <div className="left md:w-1/2 w-full lg:pr-[60px] md:pr-[40px] md:border-r border-line">
                            <div className="heading4">Register</div>
                            <form className="md:mt-7 mt-4" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="first-name">
                                        <input 
                                            className="border-line px-4 pt-3 pb-3 w-full rounded-lg" 
                                            name="first_name"
                                            type="text" 
                                            placeholder="First Name" 
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="last-name">
                                        <input 
                                            className="border-line px-4 pt-3 pb-3 w-full rounded-lg" 
                                            name="last_name"
                                            type="text" 
                                            placeholder="Last Name" 
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="email mt-5">
                                    <input 
                                        className="border-line px-4 pt-3 pb-3 w-full rounded-lg" 
                                        name="email"
                                        type="email" 
                                        placeholder="Email address *" 
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required 
                                    />
                                </div>
                                <div className="username mt-5">
                                    <input 
                                        className="border-line px-4 pt-3 pb-3 w-full rounded-lg" 
                                        name="username"
                                        type="text" 
                                        placeholder="Username (optional)" 
                                        value={formData.username}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="pass mt-5">
                                    <input 
                                        className="border-line px-4 pt-3 pb-3 w-full rounded-lg" 
                                        name="password"
                                        type="password" 
                                        placeholder="Password *" 
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required 
                                    />
                                </div>
                                <div className="confirm-pass mt-5">
                                    <input 
                                        className="border-line px-4 pt-3 pb-3 w-full rounded-lg" 
                                        name="confirmPassword"
                                        type="password" 
                                        placeholder="Confirm Password *" 
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        required 
                                    />
                                </div>
                                
                                {error && (
                                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-600 text-sm">{error}</p>
                                    </div>
                                )}
                                
                                {success && (
                                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-600 text-sm">{success}</p>
                                    </div>
                                )}
                                
                                <div className='flex items-center mt-5'>
                                    <div className="block-input">
                                        <input
                                            type="checkbox"
                                            name='agreeTerms'
                                            id='agreeTerms'
                                            checked={agreeTerms}
                                            onChange={(e) => setAgreeTerms(e.target.checked)}
                                        />
                                        <Icon.CheckSquare size={20} weight='fill' className='icon-checkbox' />
                                    </div>
                                    <label htmlFor='agreeTerms' className="pl-2 cursor-pointer text-secondary2">I agree to the
                                        <Link href={'#!'} className='text-black hover:underline pl-1'>Terms of User</Link>
                                    </label>
                                </div>
                                <div className="block-button md:mt-7 mt-4">
                                    <button 
                                        type="submit" 
                                        className="button-main w-full"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Creating Account...' : 'Register'}
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="right md:w-1/2 w-full lg:pl-[60px] md:pl-[40px] flex items-center">
                            <div className="text-content">
                                <div className="heading4">Already have an account?</div>
                                <div className="mt-2 text-secondary">Welcome back. Sign in to access your personalized experience, saved preferences, and more. We're thrilled to have you with us again!</div>
                                <div className="block-button md:mt-7 mt-4">
                                    <Link href={'/login'} className="button-main">Login</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default Register