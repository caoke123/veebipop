'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { usePathname } from 'next/navigation';
import Product from '@/components/Product/Product';
import useLoginPopup from '@/store/useLoginPopup';
import useShopDepartmentPopup from '@/store/useShopDepartmentPopup';
import useMenuMobile from '@/store/useMenuMobile';
import { useModalCartContext } from '@/context/ModalCartContext';
import { useModalWishlistContext } from '@/context/ModalWishlistContext';
import { useCart } from '@/context/CartContext';
// Removed rsuite Nav in favor of simple Tailwind-based navigation
import { navigationData } from '@/data/navigation'
import MobileMenu from './MobileMenu'

const MenuEleven = () => {
    const pathname = usePathname()
    const { openLoginPopup, handleLoginPopup } = useLoginPopup()
    const { openShopDepartmentPopup, handleShopDepartmentPopup } = useShopDepartmentPopup()
    const { openMenuMobile, handleMenuMobile } = useMenuMobile()
    const { openModalCart } = useModalCartContext()
    const { cartState } = useCart()
    const { openModalWishlist } = useModalWishlistContext()

    const [searchKeyword, setSearchKeyword] = useState('');
    const router = useRouter()

    const handleSearch = (value: string) => {
        router.push(`/search-result?query=${value}`)
        setSearchKeyword('')
    }

    // Removed mobile sub-nav toggles; mobile now uses semantic details/summary

    const [fixedHeader, setFixedHeader] = useState(false)
    const [lastScrollPosition, setLastScrollPosition] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setFixedHeader(scrollPosition > 0 && scrollPosition < lastScrollPosition);
            setLastScrollPosition(scrollPosition);
        };

        // Gắn sự kiện cuộn khi component được mount
        window.addEventListener('scroll', handleScroll);

        // Hủy sự kiện khi component bị unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollPosition]);

    // Removed legacy filter navigation handlers in favor of semantic <Link> usage

    // Simple, robust active state derived from pathname
    const isActiveHref = (href?: string) => {
        if (!href) return false
        const p = pathname || '/'
        return p === href || p.startsWith(href + '/')
    }

    const isActiveItem = (item: { href?: string; children?: { href: string }[] }) => {
        if (isActiveHref(item.href)) return true
        if (item.children && item.children.length > 0) {
            return item.children.some((c) => isActiveHref(c.href))
        }
        return false
    }

    return (
        <div>
            <div className={`${fixedHeader ? ' fixed' : 'relative'} header-menu bg-white w-full top-0 z-10 duration-500`}>
                <div className={`header-menu style-eigh bg-white w-full md:h-[74px] h-[56px]`}>
                    <div className="container mx-auto h-full">
                        <div className="header-main flex items-center justify-between h-full">
                            <div className="menu-mobile-icon lg:hidden flex items-center" onClick={handleMenuMobile}>
                                <i className="icon-category text-2xl"></i>
                            </div>
                            <Link href={'/'} className='flex items-center'>
                                <div className="heading4">Anvogue</div>
                            </Link>
                            <div className="form-search w-2/3 pl-8 flex items-center h-[44px] max-lg:hidden">
                                {/* Primary navigation: Tailwind group-hover dropdown, no JS */}
                                <nav className="h-full" aria-label="Primary navigation">
                                    <ul className="flex items-center gap-8">
                                        {navigationData.map((item) => (
                                            item.children && item.children.length > 0 ? (
                                                <li key={item.key} className="group relative">
                                                    <Link
                                                        href={item.children[0].href}
                                                        className={`relative inline-flex items-center py-2.5 text-lg uppercase tracking-wide ${
                                                            isActiveItem(item)
                                                                ? 'text-black font-normal after:content-[""] after:absolute after:left-0 after:w-full after:h-[2px] after:bg-black after:-bottom-0.5'
                                                                : 'text-black font-normal after:content-[""] after:absolute after:left-0 after:w-0 after:h-[2px] after:bg-black after:-bottom-0.5'
                                                        }`}
                                                    >
                                                        {item.label}
                                                        <Icon.CaretDown size={14} className="ml-1" />
                                                    </Link>
                                                    <div className="absolute top-full left-0 w-48 rounded-lg border border-line bg-white shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto hover:opacity-100 hover:pointer-events-auto z-50">
                                                        <ul className="py-2">
                                                            {item.children.map((child) => (
                                                                <li key={`${item.key}-${child.key}`}>
                                                                    <Link
                                                                        href={child.href}
                                                                        className={`block px-4 py-2 text-sm hover:bg-surface ${
                                                                            isActiveHref(child.href) ? 'text-black font-semibold' : 'text-secondary'
                                                                        }`}
                                                                    >
                                                                        {child.label}
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </li>
                                            ) : (
                                                <li key={item.key}>
                                                    <Link
                                                        href={item.href || '#'}
                                                        className={`relative inline-flex items-center py-2.5 text-lg uppercase tracking-wide ${
                                                            isActiveItem(item)
                                                                ? 'text-black font-normal after:content-[""] after:absolute after:left-0 after:w-full after:h-[2px] after:bg-black after:-bottom-0.5'
                                                                : 'text-black font-normal after:content-[""] after:absolute after:left-0 after:w-0 after:h-[2px] after:bg-black after:-bottom-0.5'
                                                        }`}
                                                    >
                                                        {item.label}
                                                    </Link>
                                                </li>
                                            )
                                        ))}
                                    </ul>
                                </nav>
                            </div>
                            <div className="right flex gap-12">
                                <div className="list-action flex items-center gap-4">
                                    <div className="user-icon flex items-center justify-center cursor-pointer">
                                        <Icon.User size={24} color='black' onClick={handleLoginPopup} />
                                        <div
                                            className={`login-popup absolute top-[74px] w-[320px] p-7 rounded-xl bg-white box-shadow-sm 
                                                ${openLoginPopup ? 'open' : ''}`}
                                        >
                                            <Link href={'/login'} className="button-main w-full text-center">Login</Link>
                                            <div className="text-secondary text-center mt-3 pb-4">Don’t have an account?
                                                <Link href={'/register'} className='text-black pl-1 hover:underline'>Register</Link>
                                            </div>
                                            <Link href={'/my-account'} className="button-main bg-white text-black border border-black w-full text-center">Dashboard</Link>
                                            <div className="bottom mt-4 pt-4 border-t border-line"></div>
                                            <Link href={'#!'} className='body1 hover:underline'>Support</Link>
                                        </div>
                                    </div>
                                    <div className="max-md:hidden wishlist-icon flex items-center cursor-pointer" onClick={openModalWishlist}>
                                        <Icon.Heart size={24} color='black' />
                                    </div>
                                    <div className="cart-icon flex items-center relative cursor-pointer" onClick={openModalCart}>
                                        <Icon.Handbag size={24} color='black' />
                                        <span className="quantity cart-quantity absolute -right-1.5 -top-1.5 text-xs text-white bg-black w-4 h-4 flex items-center justify-center rounded-full">{cartState.cartArray.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full h-px bg-line mt-2" aria-hidden="true"></div>

            </div>

            <MobileMenu open={openMenuMobile} onClose={handleMenuMobile} pathname={pathname || '/'} />
        </div>
    )
}

export default MenuEleven