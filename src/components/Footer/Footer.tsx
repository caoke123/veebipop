'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useForm } from 'react-hook-form'

// 安全的图片组件，处理加载错误
const SafeImage = ({ src, alt, ...props }: any) => {
  const [imgSrc, setImgSrc] = React.useState(src);
  const [hasError, setHasError] = React.useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // 使用备用图片或隐藏
      setImgSrc('');
    }
  };

  if (hasError || !imgSrc) {
    return null; // 或者返回一个占位符
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
};

const Footer = () => {
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
            <div id="footer" className='footer'>
                <div className="footer-main bg-surface">
                    <div className="container">
                        <div className="content-footer py-[60px] flex justify-between flex-wrap gap-y-8">
                            <div className="company-infor basis-1/4 max-lg:basis-full pr-7">
                                <Link href={'/'} className="logo">
                                    <div className="heading4">VeebiPop</div>
                                </Link>
                                <div className="text-button mt-2">Tianjin Caoke Information Technology Co., Ltd.</div>
                                <div className='flex gap-3 mt-3'>
                                    <div className="flex flex-col ">
                                       
                                        <span className="text-button">Mail:</span>
                                        <span className="text-button mt-3">Phone:</span>
                                        <span className="text-button mt-3">Address:</span>
                                    </div>
                                    <div className="flex flex-col ">
                                       
                                        <span className=''>sales@veebipop.com</span>
                                        <span className='mt-3'>+86 13821385220</span>
                                        <span className='mt-3 pt-px'>2nd Floor, City Center Building, Xiqing
District, Tianjin City, China</span>
                                    </div>
                                </div>
                            </div>
                            <div className="right-content flex flex-wrap gap-y-8 basis-3/4 max-lg:basis-full">
                                <div className="list-nav flex justify-between basis-2/3 max-md:basis-full gap-4">
                                    <div className="item flex flex-col basis-1/3 ">
                                        <div className="text-button-uppercase pb-3">Infomation</div>
                                        <Link className='caption1 has-line-before duration-300 w-fit' href={'/pages/contact'}>Contact us</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/pages/about'}>About us</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/my-account'}>Login</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/order-tracking'}>Order  & Returns</Link>
                                    </div>
                                    <div className="item flex flex-col basis-1/3 ">
                                        <div className="text-button-uppercase pb-3">Quick Shop</div>
<Link className='caption1 has-line-before duration-300 w-fit' href={'/shop?category=art-toys'}>Art Toys</Link>
<Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/shop?category=charms'}>Charms</Link>
<Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/shop?category=clothing-for-toys'}>Clothing for Toys</Link>
<Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/shop?category=in-car-accessories'}>Accessories</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/blog'}>Blog</Link>
                                    </div>
                                    <div className="item flex flex-col basis-1/3 ">
                                        <div className="text-button-uppercase pb-3">Customer Services</div>
                                        <Link className='caption1 has-line-before duration-300 w-fit' href={'/pages/contact'}>Contact Support</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/order-tracking'}>Order Tracking</Link>
                                    </div>
                                </div>
                                <div className="newsletter basis-1/3 pl-7 max-md:basis-full max-md:pl-0">
                                    <div className="text-button-uppercase">Newsletter</div>
                                    <div className="caption1 mt-3">Join our network of retailers to access our exclusive collection of art toys at wholesale rates. Register your business to get started.</div>
                                    <div className="input-block w-full h-[52px] mt-4">
                                        <form className='w-full h-full relative' action="/api/subscribe" method="POST" onSubmit={handleSubmit(onSubmit)}>
                                            <input type="email" placeholder='Enter your e-mail' className='caption1 w-full h-full pl-4 pr-14 rounded-xl border border-line' required {...register('email', { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })} />
                                            <button type='submit' className='w-[44px] h-[44px] bg-black flex items-center justify-center rounded-xl absolute top-1 right-1'>
                                                <Icon.ArrowRight size={24} color='#fff' />
                                            </button>
                                        </form>
                                    </div>
                                    <div className="list-social flex items-center gap-6 mt-4">
                                        <Link href={'https://www.facebook.com/'} target='_blank'>
                                            <div className="icon-facebook text-2xl text-black"></div>
                                        </Link>
                                        <Link href={'https://www.instagram.com/'} target='_blank'>
                                            <div className="icon-instagram text-2xl text-black"></div>
                                        </Link>
                                        <Link href={'https://www.twitter.com/'} target='_blank'>
                                            <div className="icon-twitter text-2xl text-black"></div>
                                        </Link>
                                        <Link href={'https://www.youtube.com/'} target='_blank'>
                                            <div className="icon-youtube text-2xl text-black"></div>
                                        </Link>
                                        <Link href={'https://www.pinterest.com/'} target='_blank'>
                                            <div className="icon-pinterest text-2xl text-black"></div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="footer-bottom py-3 flex items-center justify-between gap-5 max-lg:justify-center max-lg:flex-col border-t border-line">
                            <div className="left flex items-center gap-8">
                                <div className="copyright caption1 text-secondary">©2023 Tianjin Caoke Information Technology Co., Ltd. All Rights Reserved.</div>
                                <div className="select-block flex items-center gap-5 max-md:hidden">
                                    <div className="choose-language flex items-center gap-1.5">
                                        <select name="language" id="chooseLanguageFooter" className='caption2 bg-transparent'>
                                            <option value="English">English</option>
                                           
                                        </select>
                                        <Icon.CaretDown size={12} color='#1F1F1F' />
                                    </div>
                                    <div className="choose-currency flex items-center gap-1.5">
                                        <select name="currency" id="chooseCurrencyFooter" className='caption2 bg-transparent'>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                        </select>
                                        <Icon.CaretDown size={12} color='#1F1F1F' />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Footer
