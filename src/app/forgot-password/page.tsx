'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuEleven from '@/components/Header/Menu/MenuEleven'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import * as Icon from "@phosphor-icons/react/dist/ssr";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setIsError(false);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setIsError(false);
            } else {
                setMessage(data.message || '发送重置邮件时出错');
                setIsError(true);
            }
        } catch (error) {
            setMessage('网络错误，请稍后再试');
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
    <MenuEleven />
                <Breadcrumb heading='Forget your password' subHeading='Forget your password' />
            </div>
            <div className="forgot-pass md:py-20 py-10">
                <div className="container">
                    <div className="content-main flex gap-y-8 max-md:flex-col">
                        <div className="left md:w-1/2 w-full lg:pr-[60px] md:pr-[40px] md:border-r border-line">
                            <div className="heading4">Reset your password</div>
                            <div className="body1 mt-2">We will send you an email to reset your password</div>
                            
                            {message && (
                                <div className={`mt-4 p-3 rounded-lg ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {message}
                                </div>
                            )}
                            
                            <form className="md:mt-7 mt-4" onSubmit={handleSubmit}>
                                <div className="email ">
                                    <input 
                                        className="border-line px-4 pt-3 pb-3 w-full rounded-lg" 
                                        id="username" 
                                        type="email" 
                                        placeholder="Username or email address *" 
                                        required 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="block-button md:mt-7 mt-4">
                                    <button 
                                        type="submit" 
                                        className="button-main"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Processing...' : 'Submit'}
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="right md:w-1/2 w-full lg:pl-[60px] md:pl-[40px] flex items-center">
                            <div className="text-content">
                                <div className="heading4">New Customer</div>
                                <div className="mt-2 text-secondary">Be part of our growing family of new customers! Join us today and unlock a world of exclusive benefits, offers, and personalized experiences.</div>
                                <div className="block-button md:mt-7 mt-4">
                                    <Link href={'/register'} className="button-main">Register</Link>
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

export default ForgotPassword