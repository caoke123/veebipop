'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuEleven from '@/components/Header/Menu/MenuEleven'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { motion } from 'framer-motion'
import { formatPrice } from '@/utils/priceFormat'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useUserOrders } from '@/hooks/useUserOrders'
import { useUserDetails } from '@/hooks/useUserDetails'

const MyAccount = () => {
    const { user, logout } = useAuth()
    const router = useRouter()
    const { orders, isLoading: ordersLoading, error: ordersError } = useUserOrders()
    const { user: userDetails, isLoading: userLoading, updateUser } = useUserDetails()
    
    const [activeTab, setActiveTab] = useState<string | undefined>('dashboard')
    const [activeAddress, setActiveAddress] = useState<string | null>('billing')
    const [activeOrders, setActiveOrders] = useState<string | undefined>('all')
    const [openDetail, setOpenDetail] = useState<boolean | undefined>(false)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false)
    
    // Calculate order statistics
    const [orderStats, setOrderStats] = useState({
        pending: 0,
        delivery: 0,
        completed: 0,
        canceled: 0,
        total: 0
    })

    useEffect(() => {
        if (orders) {
            const stats = {
                pending: 0,
                delivery: 0,
                completed: 0,
                canceled: 0,
                total: orders.length
            }

            orders.forEach(order => {
                switch (order.status) {
                    case 'pending':
                        stats.pending++
                        break
                    case 'processing':
                    case 'on-hold':
                        stats.delivery++
                        break
                    case 'completed':
                        stats.completed++
                        break
                    case 'cancelled':
                    case 'refunded':
                        stats.canceled++
                        break
                }
            })

            setOrderStats(stats)
        }
    }, [orders])

    // Get user display name
    const getDisplayName = () => {
        if (userDetails?.first_name && userDetails?.last_name) {
            return `${userDetails.first_name} ${userDetails.last_name}`
        }
        return user?.username || 'User'
    }

    // Get user email
    const getUserEmail = () => {
        return user?.email || userDetails?.email || ''
    }

    // Redirect to login if not authenticated and not in the process of logging out
    React.useEffect(() => {
        if (!user && !isLoggingOut) {
            router.push('/login')
        }
    }, [user, router, isLoggingOut])

    const handleLogout = () => {
        setIsLoggingOut(true)
        logout()
        // 使用setTimeout确保状态更新后再导航
        setTimeout(() => {
            router.push('/')
        }, 100)
    }

    const handleActiveAddress = (order: string) => {
        setActiveAddress(prevOrder => prevOrder === order ? null : order)
    }

    const handleActiveOrders = (order: string) => {
        setActiveOrders(order)
    }

    const handleViewOrderDetails = (order: any) => {
        setSelectedOrder(order)
        setOpenDetail(true)
    }

    // Show loading if user is being authenticated
    if (!user && !isLoggingOut) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        )
    }
    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
    <MenuEleven />
                <Breadcrumb heading='My Account' subHeading='My Account' />
            </div>
            <div className="profile-block md:py-20 py-10">
                <div className="container">
                    <div className="content-main flex gap-y-8 max-md:flex-col w-full">
                        <div className="left md:w-1/3 w-full xl:pr-[3.125rem] lg:pr-[28px] md:pr-[16px]">
                            <div className="user-infor bg-surface lg:px-7 px-4 lg:py-10 py-5 md:rounded-[20px] rounded-xl">
                                <div className="heading flex flex-col items-center justify-center">
                                    <div className="avatar">
                                        <Image
                                            src={'/images/avatar/1.png'}
                                            width={300}
                                            height={300}
                                            alt='avatar'
                                            className='md:w-[140px] w-[120px] md:h-[140px] h-[120px] rounded-full'
                                        />
                                    </div>
                                    <div className="name heading6 mt-4 text-center">{getDisplayName()}</div>
                                    <div className="mail heading6 font-normal normal-case text-secondary text-center mt-1">{getUserEmail()}</div>
                                </div>
                                <div className="menu-tab w-full max-w-none lg:mt-10 mt-6">
                                    <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                                        <Icon.HouseLine size={20} />
                                        <strong className="heading6">Dashboard</strong>
                                    </Link>
                                    <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                                        <Icon.Package size={20} />
                                        <strong className="heading6">History Orders</strong>
                                    </Link>
                                    <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'address' ? 'active' : ''}`} onClick={() => setActiveTab('address')}>
                                        <Icon.Tag size={20} />
                                        <strong className="heading6">My Address</strong>
                                    </Link>
                                    <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'setting' ? 'active' : ''}`} onClick={() => setActiveTab('setting')}>
                                        <Icon.GearSix size={20} />
                                        <strong className="heading6">Setting</strong>
                                    </Link>
                                    <Link href={'#!'} scroll={false} className="item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5" onClick={handleLogout}>
                                        <Icon.SignOut size={20} />
                                        <strong className="heading6">Logout</strong>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="right md:w-2/3 w-full pl-2.5">
                            <div className={`tab text-content w-full ${activeTab === 'dashboard' ? 'block' : 'hidden'}`}>
                                <div className="overview grid sm:grid-cols-3 gap-5">
                                    <div className="item flex items-center justify-between p-5 border border-line rounded-lg box-shadow-xs">
                                        <div className="counter">
                                            <span className="text-secondary">Awaiting Pickup</span>
                                            <h5 className="heading5 mt-1">{orderStats.pending}</h5>
                                        </div>
                                        <Icon.HourglassMedium className='text-4xl' />
                                    </div>
                                    <div className="item flex items-center justify-between p-5 border border-line rounded-lg box-shadow-xs">
                                        <div className="counter">
                                            <span className="text-secondary">Cancelled Orders</span>
                                            <h5 className="heading5 mt-1">{orderStats.canceled}</h5>
                                        </div>
                                        <Icon.ReceiptX className='text-4xl' />
                                    </div>
                                    <div className="item flex items-center justify-between p-5 border border-line rounded-lg box-shadow-xs">
                                        <div className="counter">
                                            <span className="text-secondary">Total Number of Orders</span>
                                            <h5 className="heading5 mt-1">{orderStats.total}</h5>
                                        </div>
                                        <Icon.Package className='text-4xl' />
                                    </div>
                                </div>
                                <div className="recent_order pt-5 px-5 pb-2 mt-7 border border-line rounded-xl">
                                    <h6 className="heading6">Recent Orders</h6>
                                    <div className="list overflow-x-auto w-full mt-5">
                                        <table className="w-full max-[1400px]:w-[700px] max-md:w-[700px]">
                                            <thead className="border-b border-line">
                                                <tr>
                                                    <th scope="col" className="pb-3 text-left text-sm font-bold uppercase text-secondary whitespace-nowrap">Order</th>
                                                    <th scope="col" className="pb-3 text-left text-sm font-bold uppercase text-secondary whitespace-nowrap">Products</th>
                                                    <th scope="col" className="pb-3 text-left text-sm font-bold uppercase text-secondary whitespace-nowrap">Pricing</th>
                                                    <th scope="col" className="pb-3 text-right text-sm font-bold uppercase text-secondary whitespace-nowrap">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders && orders.slice(0, 5).map((order: any, index: number) => (
                                                    <tr key={index} className="item duration-300 border-b border-line">
                                                        <th scope="row" className="py-3 text-left">
                                                            <strong className="text-title">#{order.id}</strong>
                                                        </th>
                                                        <td className="py-3">
                                                            {order.line_items && order.line_items.length > 0 && (
                                                                <Link href={`/product/${order.line_items[0].slug || 'product'}`} className="product flex items-center gap-3">
                                                                    <Image 
                                                                        src={order.line_items[0].image?.src || '/images/product/1000x1000.png'} 
                                                                        width={400} 
                                                                        height={400} 
                                                                        alt={order.line_items[0].name || 'Product'} 
                                                                        className="flex-shrink-0 w-12 h-12 rounded" 
                                                                    />
                                                                    <div className="info flex flex-col">
                                                                        <strong className="product_name text-button">{order.line_items[0].name}</strong>
                                                                        <span className="product_tag caption1 text-secondary">
                                                                            {order.line_items.length > 1 ? `${order.line_items.length} items` : '1 item'}
                                                                        </span>
                                                                    </div>
                                                                </Link>
                                                            )}
                                                        </td>
                                                        <td className="py-3 price">{formatPrice(order.total)}</td>
                                                        <td className="py-3 text-right">
                                                            <span className={`tag px-4 py-1.5 rounded-full caption1 font-semibold ${
                                                                order.status === 'pending' ? 'bg-opacity-10 bg-yellow text-yellow' :
                                                                order.status === 'processing' || order.status === 'on-hold' ? 'bg-opacity-10 bg-purple text-purple' :
                                                                order.status === 'completed' ? 'bg-opacity-10 bg-success text-success' :
                                                                order.status === 'cancelled' || order.status === 'refunded' ? 'bg-opacity-10 bg-red text-red' :
                                                                'bg-opacity-10 bg-gray text-gray'
                                                            }`}>
                                                                {order.status === 'pending' ? 'Pending' :
                                                                 order.status === 'processing' || order.status === 'on-hold' ? 'Delivery' :
                                                                 order.status === 'completed' ? 'Completed' :
                                                                 order.status === 'cancelled' || order.status === 'refunded' ? 'Canceled' :
                                                                 order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(!orders || orders.length === 0) && (
                                                    <tr>
                                                        <td colSpan={4} className="py-8 text-center text-secondary">
                                                            No orders found
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className={`tab text-content overflow-hidden w-full p-7 border border-line rounded-xl ${activeTab === 'orders' ? 'block' : 'hidden'}`}>
                                <h6 className="heading6">Your Orders</h6>
                                <div className="w-full overflow-x-auto">
                                    <div className="menu-tab grid grid-cols-5 max-lg:w-[500px] border-b border-line mt-3">
                                        {['all', 'pending', 'delivery', 'completed', 'canceled'].map((item, index) => (
                                            <button
                                                key={index}
                                                className={`item relative px-3 py-2.5 text-secondary text-center duration-300 hover:text-black border-b-2 ${activeOrders === item ? 'active border-black' : 'border-transparent'}`}
                                                onClick={() => handleActiveOrders(item)}
                                            >
                                                <span className='relative text-button z-[1]'>
                                                    {item}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="list_order">
                                    {orders && orders.filter((order: any) => {
                                        if (activeOrders === 'all') return true
                                        if (activeOrders === 'pending') return order.status === 'pending'
                                        if (activeOrders === 'delivery') return order.status === 'processing' || order.status === 'on-hold'
                                        if (activeOrders === 'completed') return order.status === 'completed'
                                        if (activeOrders === 'canceled') return order.status === 'cancelled' || order.status === 'refunded'
                                        return true
                                    }).map((order: any, index: number) => (
                                        <div key={index} className="order_item mt-5 border border-line rounded-lg box-shadow-xs">
                                            <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-line">
                                                <div className="flex items-center gap-2">
                                                    <strong className="text-title">Order Number:</strong>
                                                    <strong className="order_number text-button uppercase">#{order.id}</strong>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <strong className="text-title">Order status:</strong>
                                                    <span className={`tag px-4 py-1.5 rounded-full caption1 font-semibold ${
                                                        order.status === 'pending' ? 'bg-opacity-10 bg-yellow text-yellow' :
                                                        order.status === 'processing' || order.status === 'on-hold' ? 'bg-opacity-10 bg-purple text-purple' :
                                                        order.status === 'completed' ? 'bg-opacity-10 bg-success text-success' :
                                                        order.status === 'cancelled' || order.status === 'refunded' ? 'bg-opacity-10 bg-red text-red' :
                                                        'bg-opacity-10 bg-gray text-gray'
                                                    }`}>
                                                        {order.status === 'pending' ? 'Pending' :
                                                         order.status === 'processing' || order.status === 'on-hold' ? 'Delivery' :
                                                         order.status === 'completed' ? 'Completed' :
                                                         order.status === 'cancelled' || order.status === 'refunded' ? 'Canceled' :
                                                         order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="list_prd px-5">
                                                {order.line_items && order.line_items.map((item: any, itemIndex: number) => (
                                                    <div key={itemIndex} className="prd_item flex flex-wrap items-center justify-between gap-3 py-5 border-b border-line">
                                                        <Link href={`/product/${item.slug || 'product'}`} className="flex items-center gap-5">
                                                            <div className="bg-img flex-shrink-0 md:w-[100px] w-20 aspect-square rounded-lg overflow-hidden">
                                                                <Image
                                                                    src={item.image?.src || '/images/product/1000x1000.png'}
                                                                    width={1000}
                                                                    height={1000}
                                                                    alt={item.name || 'Product'}
                                                                    className='w-full h-full object-cover'
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="prd_name text-title">{item.name}</div>
                                                                <div className="caption1 text-secondary mt-2">
                                                                    {item.meta_data && item.meta_data.find((meta: any) => meta.key === 'Size') && (
                                                                        <span className="prd_size uppercase">
                                                                            {item.meta_data.find((meta: any) => meta.key === 'Size').value}
                                                                        </span>
                                                                    )}
                                                                    {item.meta_data && item.meta_data.find((meta: any) => meta.key === 'Color') && (
                                                                        <>
                                                                            <span>/</span>
                                                                            <span className="prd_color capitalize">
                                                                                {item.meta_data.find((meta: any) => meta.key === 'Color').value}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </Link>
                                                        <div className='text-title'>
                                                            <span className="prd_quantity">{item.quantity}</span>
                                                            <span> X </span>
                                                            <span className="prd_price">{formatPrice(item.price)}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex flex-wrap gap-4 p-5">
                                                <button className="button-main" onClick={() => handleViewOrderDetails(order)}>Order Details</button>
                                                {order.status === 'pending' && (
                                                    <button className="button-main bg-surface border border-line hover:bg-black text-black hover:text-white">Cancel Order</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {(!orders || orders.filter((order: any) => {
                                        if (activeOrders === 'all') return true
                                        if (activeOrders === 'pending') return order.status === 'pending'
                                        if (activeOrders === 'delivery') return order.status === 'processing' || order.status === 'on-hold'
                                        if (activeOrders === 'completed') return order.status === 'completed'
                                        if (activeOrders === 'canceled') return order.status === 'cancelled' || order.status === 'refunded'
                                        return true
                                    }).length === 0) && (
                                        <div className="mt-10 text-center text-secondary">
                                            No {activeOrders === 'all' ? '' : activeOrders} orders found
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={`tab_address text-content w-full p-7 border border-line rounded-xl ${activeTab === 'address' ? 'block' : 'hidden'}`}>
                                <form>
                                    <button
                                        type='button'
                                        className={`tab_btn flex items-center justify-between w-full pb-1.5 border-b border-line ${activeAddress === 'billing' ? 'active' : ''}`}
                                        onClick={() => handleActiveAddress('billing')}
                                    >
                                        <strong className="heading6">Billing address</strong>
                                        <Icon.CaretDown className='text-2xl ic_down duration-300' />
                                    </button>
                                    <div className={`form_address ${activeAddress === 'billing' ? 'block' : 'hidden'}`}>
                                        <div className='grid sm:grid-cols-2 gap-4 gap-y-5 mt-5'>
                                            <div className="first-name">
                                                <label htmlFor="billingFirstName" className='caption1 capitalize'>First Name <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingFirstName" type="text" 
                                                    defaultValue={userDetails?.billing?.first_name || ''} required />
                                            </div>
                                            <div className="last-name">
                                                <label htmlFor="billingLastName" className='caption1 capitalize'>Last Name <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingLastName" type="text" 
                                                    defaultValue={userDetails?.billing?.last_name || ''} required />
                                            </div>
                                            <div className="company">
                                                <label htmlFor="billingCompany" className='caption1 capitalize'>Company name (optional)</label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingCompany" type="text" 
                                                    defaultValue={userDetails?.billing?.company || ''} required />
                                            </div>
                                            <div className="country">
                                                <label htmlFor="billingCountry" className='caption1 capitalize'>Country / Region <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingCountry" type="text" 
                                                    defaultValue={userDetails?.billing?.country || ''} required />
                                            </div>
                                            <div className="street">
                                                <label htmlFor="billingStreet" className='caption1 capitalize'>street address <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingStreet" type="text" 
                                                    defaultValue={userDetails?.billing?.address_1 || ''} required />
                                            </div>
                                            <div className="city">
                                                <label htmlFor="billingCity" className='caption1 capitalize'>Town / city <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingCity" type="text" 
                                                    defaultValue={userDetails?.billing?.city || ''} required />
                                            </div>
                                            <div className="state">
                                                <label htmlFor="billingState" className='caption1 capitalize'>state <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingState" type="text" 
                                                    defaultValue={userDetails?.billing?.state || ''} required />
                                            </div>
                                            <div className="zip">
                                                <label htmlFor="billingZip" className='caption1 capitalize'>ZIP <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingZip" type="text" 
                                                    defaultValue={userDetails?.billing?.postcode || ''} required />
                                            </div>
                                            <div className="phone">
                                                <label htmlFor="billingPhone" className='caption1 capitalize'>Phone <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingPhone" type="text" 
                                                    defaultValue={userDetails?.billing?.phone || ''} required />
                                            </div>
                                            <div className="email">
                                                <label htmlFor="billingEmail" className='caption1 capitalize'>Email <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingEmail" type="email" 
                                                    defaultValue={userDetails?.billing?.email || getUserEmail()} required />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type='button'
                                        className={`tab_btn flex items-center justify-between w-full mt-10 pb-1.5 border-b border-line ${activeAddress === 'shipping' ? 'active' : ''}`}
                                        onClick={() => handleActiveAddress('shipping')}
                                    >
                                        <strong className="heading6">Shipping address</strong>
                                        <Icon.CaretDown className='text-2xl ic_down duration-300' />
                                    </button>
                                    <div className={`form_address ${activeAddress === 'shipping' ? 'block' : 'hidden'}`}>
                                        <div className='grid sm:grid-cols-2 gap-4 gap-y-5 mt-5'>
                                            <div className="first-name">
                                                <label htmlFor="shippingFirstName" className='caption1 capitalize'>First Name <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingFirstName" type="text" 
                                                    defaultValue={userDetails?.shipping?.first_name || ''} required />
                                            </div>
                                            <div className="last-name">
                                                <label htmlFor="shippingLastName" className='caption1 capitalize'>Last Name <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingLastName" type="text" 
                                                    defaultValue={userDetails?.shipping?.last_name || ''} required />
                                            </div>
                                            <div className="company">
                                                <label htmlFor="shippingCompany" className='caption1 capitalize'>Company name (optional)</label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingCompany" type="text" 
                                                    defaultValue={userDetails?.shipping?.company || ''} required />
                                            </div>
                                            <div className="country">
                                                <label htmlFor="shippingCountry" className='caption1 capitalize'>Country / Region <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingCountry" type="text" 
                                                    defaultValue={userDetails?.shipping?.country || ''} required />
                                            </div>
                                            <div className="street">
                                                <label htmlFor="shippingStreet" className='caption1 capitalize'>street address <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingStreet" type="text" 
                                                    defaultValue={userDetails?.shipping?.address_1 || ''} required />
                                            </div>
                                            <div className="city">
                                                <label htmlFor="shippingCity" className='caption1 capitalize'>Town / city <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingCity" type="text" 
                                                    defaultValue={userDetails?.shipping?.city || ''} required />
                                            </div>
                                            <div className="state">
                                                <label htmlFor="shippingState" className='caption1 capitalize'>state <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingState" type="text" 
                                                    defaultValue={userDetails?.shipping?.state || ''} required />
                                            </div>
                                            <div className="zip">
                                                <label htmlFor="shippingZip" className='caption1 capitalize'>ZIP <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingZip" type="text" 
                                                    defaultValue={userDetails?.shipping?.postcode || ''} required />
                                            </div>
                                            <div className="phone">
                                                <label htmlFor="shippingPhone" className='caption1 capitalize'>Phone <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingPhone" type="text" 
                                                    defaultValue={(userDetails as any)?.shipping?.phone || ''} required />
                                            </div>
                                            <div className="email">
                                                <label htmlFor="shippingEmail" className='caption1 capitalize'>Email <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingEmail" type="email" 
                                                    defaultValue={(userDetails as any)?.shipping?.email || getUserEmail()} required />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="block-button lg:mt-10 mt-6">
                                        <button className="button-main">Update Address</button>
                                    </div>
                                </form>
                            </div>
                            <div className={`tab text-content w-full p-7 border border-line rounded-xl ${activeTab === 'setting' ? 'block' : 'hidden'}`}>
                                <form>
                                    <div className="heading5 pb-4">Information</div>
                                    <div className="upload_image col-span-full">
                                        <label htmlFor="uploadImage">Upload Avatar: <span className="text-red">*</span></label>
                                        <div className="flex flex-wrap items-center gap-5 mt-3">
                                            <div className="bg_img flex-shrink-0 relative w-[7.5rem] h-[7.5rem] rounded-lg overflow-hidden bg-surface">
                                                <span className="ph ph-image text-5xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-secondary"></span>
                                                <Image
                                                    src={'/images/avatar/1.png'}
                                                    width={300}
                                                    height={300}
                                                    alt='avatar'
                                                    className="upload_img relative z-[1] w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <strong className="text-button">Upload File:</strong>
                                                <p className="caption1 text-secondary mt-1">JPG 120x120px</p>
                                                <div className="upload_file flex items-center gap-3 w-[220px] mt-3 px-3 py-2 border border-line rounded">
                                                    <label htmlFor="uploadImage" className="caption2 py-1 px-3 rounded bg-line whitespace-nowrap cursor-pointer">Choose File</label>
                                                    <input type="file" name="uploadImage" id="uploadImage" accept="image/*" className="caption2 cursor-pointer" required />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='grid sm:grid-cols-2 gap-4 gap-y-5 mt-5'>
                                        <div className="first-name">
                                            <label htmlFor="firstName" className='caption1 capitalize'>First Name <span className='text-red'>*</span></label>
                                            <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="firstName" type="text" 
                                                defaultValue={userDetails?.first_name || ''} placeholder='First name' required />
                                        </div>
                                        <div className="last-name">
                                            <label htmlFor="lastName" className='caption1 capitalize'>Last Name <span className='text-red'>*</span></label>
                                            <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="lastName" type="text" 
                                                defaultValue={userDetails?.last_name || ''} placeholder='Last name' required />
                                        </div>
                                        <div className="phone-number">
                                            <label htmlFor="phoneNumber" className='caption1 capitalize'>Phone Number <span className='text-red'>*</span></label>
                                            <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="phoneNumber" type="text" 
                                                defaultValue={(userDetails as any)?.billing?.phone || (userDetails as any)?.shipping?.phone || ''} placeholder="Phone number" required />
                                        </div>
                                        <div className="email">
                                            <label htmlFor="email" className='caption1 capitalize'>Email Address <span className='text-red'>*</span></label>
                                            <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="email" type="email" 
                                                defaultValue={getUserEmail()} placeholder="Email address" required />
                                        </div>
                                        <div className="gender">
                                            <label htmlFor="gender" className='caption1 capitalize'>Gender <span className='text-red'>*</span></label>
                                            <div className="select-block mt-2">
                                                <select className="border border-line px-4 py-3 w-full rounded-lg" id="gender" name="gender" defaultValue={(userDetails as any)?.meta_data?.find((meta: any) => meta.key === 'gender')?.value || 'default'}>
                                                    <option value="default" disabled>Choose Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                <Icon.CaretDown className='arrow-down text-lg' />
                                            </div>
                                        </div>
                                        <div className="birth">
                                            <label htmlFor="birth" className='caption1'>Day of Birth <span className='text-red'>*</span></label>
                                            <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="birth" type="date" 
                                                defaultValue={(userDetails as any)?.meta_data?.find((meta: any) => meta.key === 'date_of_birth')?.value || ''} placeholder="Day of Birth" required />
                                        </div>
                                    </div>
                                    <div className="heading5 pb-4 lg:mt-10 mt-6">Change Password</div>
                                    <div className="pass">
                                        <label htmlFor="password" className='caption1'>Current password <span className='text-red'>*</span></label>
                                        <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="password" type="password" placeholder="Password *" required />
                                    </div>
                                    <div className="new-pass mt-5">
                                        <label htmlFor="newPassword" className='caption1'>New password <span className='text-red'>*</span></label>
                                        <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="newPassword" type="password" placeholder="New Password *" required />
                                    </div>
                                    <div className="confirm-pass mt-5">
                                        <label htmlFor="confirmPassword" className='caption1'>Confirm new password <span className='text-red'>*</span></label>
                                        <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="confirmPassword" type="password" placeholder="Confirm Password *" required />
                                    </div>
                                    <div className="block-button lg:mt-10 mt-6">
                                        <button className="button-main">Save Change</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            <div className={`modal-order-detail-block flex items-center justify-center ${openDetail ? 'open' : ''}`} onClick={() => setOpenDetail(false)}>
                <div className={`modal-order-detail-main grid grid-cols-2 w-[1160px] bg-white rounded-2xl ${openDetail ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                    <div className="info p-10 border-r border-line">
                        <h5 className="heading5">Order Details</h5>
                        <div className="list_info grid grid-cols-2 gap-10 gap-y-8 mt-5">
                            <div className="info_item">
                                <strong className="text-button-uppercase text-secondary">Contact Information</strong>
                                <h6 className="heading6 order_name mt-2">{selectedOrder?.billing?.first_name} {selectedOrder?.billing?.last_name}</h6>
                                <h6 className="heading6 order_phone mt-2">{selectedOrder?.billing?.phone}</h6>
                                <h6 className="heading6 normal-case order_email mt-2">{selectedOrder?.billing?.email}</h6>
                            </div>
                            <div className="info_item">
                                <strong className="text-button-uppercase text-secondary">Payment method</strong>
                                <h6 className="heading6 order_payment mt-2">{selectedOrder?.payment_method_title || 'Cash on Delivery'}</h6>
                            </div>
                            <div className="info_item">
                                <strong className="text-button-uppercase text-secondary">Shipping address</strong>
                                <h6 className="heading6 order_shipping_address mt-2">
                                    {selectedOrder?.shipping?.address_1 && `${selectedOrder.shipping.address_1}, `}
                                    {selectedOrder?.shipping?.city && `${selectedOrder.shipping.city}, `}
                                    {selectedOrder?.shipping?.state && `${selectedOrder.shipping.state}, `}
                                    {selectedOrder?.shipping?.country}
                                </h6>
                            </div>
                            <div className="info_item">
                                <strong className="text-button-uppercase text-secondary">Billing address</strong>
                                <h6 className="heading6 order_billing_address mt-2">
                                    {selectedOrder?.billing?.address_1 && `${selectedOrder.billing.address_1}, `}
                                    {selectedOrder?.billing?.city && `${selectedOrder.billing.city}, `}
                                    {selectedOrder?.billing?.state && `${selectedOrder.billing.state}, `}
                                    {selectedOrder?.billing?.country}
                                </h6>
                            </div>
                            <div className="info_item">
                                <strong className="text-button-uppercase text-secondary">Company</strong>
                                <h6 className="heading6 order_company mt-2">{selectedOrder?.billing?.company || 'N/A'}</h6>
                            </div>
                        </div>
                    </div>
                    <div className="list p-10">
                        <h5 className="heading5">Items</h5>
                        <div className="list_prd">
                            {selectedOrder?.line_items && selectedOrder.line_items.map((item: any, index: number) => (
                                <div key={index} className="prd_item flex flex-wrap items-center justify-between gap-3 py-5 border-b border-line">
                                    <Link href={`/product/${item.slug || 'product'}`} className="flex items-center gap-5">
                                        <div className="bg-img flex-shrink-0 md:w-[100px] w-20 aspect-square rounded-lg overflow-hidden">
                                            <Image
                                                src={item.image?.src || '/images/product/1000x1000.png'}
                                                width={1000}
                                                height={1000}
                                                alt={item.name || 'Product'}
                                                className='w-full h-full object-cover'
                                            />
                                        </div>
                                        <div>
                                            <div className="prd_name text-title">{item.name}</div>
                                            <div className="caption1 text-secondary mt-2">
                                                {item.meta_data && item.meta_data.find((meta: any) => meta.key === 'Size') && (
                                                    <span className="prd_size uppercase">
                                                        {item.meta_data.find((meta: any) => meta.key === 'Size').value}
                                                    </span>
                                                )}
                                                {item.meta_data && item.meta_data.find((meta: any) => meta.key === 'Color') && (
                                                    <>
                                                        <span>/</span>
                                                        <span className="prd_color capitalize">
                                                            {item.meta_data.find((meta: any) => meta.key === 'Color').value}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                    <div className='text-title'>
                                        <span className="prd_quantity">{item.quantity}</span>
                                        <span> X </span>
                                        <span className="prd_price">{formatPrice(item.price)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between mt-5">
                            <strong className="text-title">Shipping</strong>
                            <strong className="order_ship text-title">{selectedOrder?.shipping_total > 0 ? formatPrice(selectedOrder.shipping_total) : 'Free'}</strong>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <strong className="text-title">Discounts</strong>
                            <strong className="order_discounts text-title">-{selectedOrder?.discount_total > 0 ? formatPrice(selectedOrder.discount_total) : formatPrice(0)}</strong>
                        </div>
                        <div className="flex items-center justify-between mt-5 pt-5 border-t border-line">
                            <h5 className="heading5">Subtotal</h5>
                            <h5 className="order_total heading5">{formatPrice(selectedOrder?.total || 0)}</h5>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default MyAccount
