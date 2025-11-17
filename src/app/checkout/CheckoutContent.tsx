"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import * as Icon from '@phosphor-icons/react'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuEleven from '@/components/Header/Menu/MenuEleven'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import { formatPrice } from '@/utils/priceFormat'

interface OrderFormData {
  // Customer info
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  
  // Address info
  region: string
  city: string
  apartment: string
  country: string
  postal: string
  note: string
  
  // Payment
  paymentMethod: string
}

export default function CheckoutContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { cartState, removeFromCart } = useCart();
    const [activePayment, setActivePayment] = useState<string>('credit-card')
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [submitError, setSubmitError] = useState<string>('')
    const [submitSuccess, setSubmitSuccess] = useState<boolean>(false)
    // Buy Now flow state
    const [orderId, setOrderId] = useState<number | null>(null)
    const [order, setOrder] = useState<any | null>(null)
    const [loadingOrder, setLoadingOrder] = useState<boolean>(false)
    const [orderError, setOrderError] = useState<string>('')
    const [creatingOrder, setCreatingOrder] = useState<boolean>(false)

    // Calculate total cart value
    const calculateTotalCart = () => {
        return cartState.cartArray.reduce((total, item) => total + (item.price * item.quantity), 0)
    }
    
    const totalCart = calculateTotalCart()
    const totalDisplay = order?.total ? formatPrice(order.total) : formatPrice(totalCart)

    const handlePayment = (item: string) => {
        setActivePayment(item)
    }

    const getPaymentMethodData = (paymentMethod: string) => {
        switch (paymentMethod) {
            case 'credit-card':
                return {
                    payment_method: 'credit_card',
                    payment_method_title: 'Credit Card'
                }
            case 'cash-delivery':
                return {
                    payment_method: 'cod',
                    payment_method_title: 'Cash on Delivery'
                }
            case 'apple-pay':
                return {
                    payment_method: 'apple_pay',
                    payment_method_title: 'Apple Pay'
                }
            case 'paypal':
                return {
                    payment_method: 'paypal',
                    payment_method_title: 'PayPal'
                }
            default:
                return {
                    payment_method: 'credit_card',
                    payment_method_title: 'Credit Card'
                }
        }
    }

    const collectFormData = (): OrderFormData => {
        const form = document.querySelector('.form-checkout form') as HTMLFormElement
        const formData = new FormData(form)
        
        return {
            firstName: (formData.get('firstName') as string) || '',
            lastName: (formData.get('lastName') as string) || '',
            email: (formData.get('email') as string) || '',
            phoneNumber: (formData.get('phoneNumber') as string) || '',
            region: (formData.get('region') as string) || '',
            city: (formData.get('city') as string) || '',
            apartment: (formData.get('apartment') as string) || '',
            country: (formData.get('country') as string) || '',
            postal: (formData.get('postal') as string) || '',
            note: (formData.get('note') as string) || '',
            paymentMethod: activePayment
        }
    }

    // Create pending order when coming from Buy Now or Cart using query params
    useEffect(() => {
        const urlOrderId = searchParams.get('orderId')
        const productId = searchParams.get('productId')
        const cartItemsParam = searchParams.get('cartItems')
        
        // If we have an orderId from URL, use it directly
        if (urlOrderId) {
            const orderIdNum = parseInt(urlOrderId, 10)
            if (!isNaN(orderIdNum) && orderIdNum > 0) {
                console.log('Using orderId from URL:', orderIdNum)
                setOrderId(orderIdNum)
                // Fetch the order details
                fetch(`/api/woocommerce/orders/${encodeURIComponent(String(orderIdNum))}`, { cache: 'no-store' })
                    .then(async (res) => {
                        if (!res.ok) {
                            const err = await res.json().catch(() => ({}))
                            throw new Error(err?.message || '获取订单信息失败')
                        }
                        return res.json()
                    })
                    .then((data) => {
                        if (data) {
                            setOrder(data)
                            console.log('Order details loaded:', data)
                        }
                    })
                    .catch((err) => {
                        console.error('Failed to fetch order details:', err)
                        setOrderError(err.message || '获取订单信息失败')
                    })
                return
            }
        }
        
        // Exit conditions: no productId, no cartItems, or already have orderId
        if ((!productId && !cartItemsParam) || orderId) return
        
        // Determine the type of order creation
        const isCartOrder = !!cartItemsParam
        
        // Use more stable keys for duplication prevention
        const identifier = isCartOrder 
            ? `cart_${encodeURIComponent(cartItemsParam)}_${searchParams.get('discount') || '0'}_${searchParams.get('ship') || '0'}`
            : `${productId}_${searchParams.get('quantity') || '1'}_${searchParams.get('variationId') || ''}`
        
        const lockKey = `create_order_lock_${identifier}`
        const processedKey = `create_order_processed_${identifier}`
        
        console.log('=== CHECKOUT ORDER CREATION DEBUG ===')
        console.log('isCartOrder:', isCartOrder)
        console.log('productId:', productId)
        console.log('cartItemsParam:', cartItemsParam)
        console.log('identifier:', identifier)
        console.log('lockKey:', lockKey)
        console.log('processedKey:', processedKey)
        console.log('sessionStorage.getItem(processedKey):', typeof window !== 'undefined' ? sessionStorage.getItem(processedKey) : 'undefined')
        console.log('localStorage.getItem(lockKey):', typeof window !== 'undefined' ? localStorage.getItem(lockKey) : 'undefined')
        
        // 检查是否在浏览器环境中
        if (typeof window === 'undefined') {
            console.log('Not in browser environment, skipping order creation')
            return
        }
        
        // Check if already processing this exact request
        if (sessionStorage.getItem(processedKey) || localStorage.getItem(lockKey)) {
            console.log('Order creation already processed for this request')
            return
        }
        
        console.log('Setting locks and creating order...')
        
        // Set processing lock with timestamp
        localStorage.setItem(lockKey, Date.now().toString())
        sessionStorage.setItem(processedKey, 'true')
        
        setCreatingOrder(true)
        setLoadingOrder(true)
        setOrderError('')

        const url = new URL('/api/woocommerce/create-order', window.location.origin)
        
        if (isCartOrder) {
            // Handle cart-based order creation
            console.log('Creating cart order...')
            url.searchParams.set('cartItems', cartItemsParam!)
            const discount = searchParams.get('discount')
            const ship = searchParams.get('ship')
            if (discount) url.searchParams.set('discount', discount)
            if (ship) url.searchParams.set('ship', ship)
        } else {
            // Handle single product (Buy Now) order creation
            console.log('Creating single product order...')
            url.searchParams.set('productId', productId!)
            url.searchParams.set('quantity', searchParams.get('quantity') || '1')
            const variationId = searchParams.get('variationId')
            const size = searchParams.get('size')
            const color = searchParams.get('color')
            if (variationId) url.searchParams.set('variationId', variationId)
            if (size) url.searchParams.set('size', size)
            if (color) url.searchParams.set('color', color)
        }

        console.log('Creating order with URL:', url.toString())

        fetch(url.toString(), { cache: 'no-store' })
            .then(async (res) => {
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}))
                    throw new Error(err?.message || '创建订单失败')
                }
                return res.json()
            })
            .then((data) => {
                const id = Number(data?.order_id || data?.order?.id)
                console.log('Order creation result:', { id, data })
                if (id > 0) {
                    setOrderId(id)
                    setOrder(data?.order || null)
                    console.log('Order created successfully:', id)
                    console.log('Order ID set to state:', id)
                } else {
                    console.error('Invalid order ID:', id)
                }
            })
            .catch((err) => {
                console.error('create-order error:', err)
                setOrderError(err.message || '创建订单失败')
                // Clear locks on error
                if (typeof window !== 'undefined') {
                    localStorage.removeItem(lockKey)
                    sessionStorage.removeItem(processedKey)
                }
            })
            .finally(() => {
                setLoadingOrder(false)
                setCreatingOrder(false)
                // Clear lock after processing completes
                if (typeof window !== 'undefined') {
                    localStorage.removeItem(lockKey)
                }
                console.log('Order creation process completed')
            })
    }, [orderId, searchParams])

    const submitOrder = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        // In Buy Now flow, orderId must exist; otherwise require non-empty cart
        if (!orderId && cartState.cartArray.length === 0) {
            setSubmitError('没有待提交的订单')
            return
        }

        setIsSubmitting(true)
        setSubmitError('')
        setSubmitSuccess(false)

        try {
            const orderFormData = collectFormData()
            
            // Basic validation
            if (!orderFormData.firstName || !orderFormData.lastName || !orderFormData.email || 
                !orderFormData.phoneNumber || !orderFormData.city || !orderFormData.apartment || 
                !orderFormData.postal) {
                setSubmitError('请填写所有必填字段')
                setIsSubmitting(false)
                return
            }

            const paymentData = getPaymentMethodData(orderFormData.paymentMethod)

            if (orderId) {
                // Update existing pending order
                const updateData = {
                    ...paymentData,
                    billing: {
                        first_name: orderFormData.firstName,
                        last_name: orderFormData.lastName,
                        email: orderFormData.email,
                        phone: orderFormData.phoneNumber,
                        address_1: orderFormData.apartment,
                        city: orderFormData.city,
                        state: orderFormData.region,
                        postcode: orderFormData.postal,
                        country: orderFormData.country
                    },
                    shipping: {
                        first_name: orderFormData.firstName,
                        last_name: orderFormData.lastName,
                        address_1: orderFormData.apartment,
                        city: orderFormData.city,
                        state: orderFormData.region,
                        postcode: orderFormData.postal,
                        country: orderFormData.country
                    },
                    set_paid: false,
                    status: 'pending',
                    customer_note: orderFormData.note,
                }
                const response = await fetch(`/api/woocommerce/orders/${encodeURIComponent(String(orderId))}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData)
                })
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}))
                    throw new Error(errorData.message || '订单更新失败')
                }
                const result = await response.json()
                if (result?.success) {
                    setSubmitSuccess(true)
                    router.push(`/order-confirmation?orderId=${orderId}`)
                    return
                }
                throw new Error(result?.message || '订单更新失败')
            } else {
                // Fallback: create order from cart (legacy)
                const orderData = {
                    ...paymentData,
                    billing: {
                        first_name: orderFormData.firstName,
                        last_name: orderFormData.lastName,
                        email: orderFormData.email,
                        phone: orderFormData.phoneNumber,
                        address_1: orderFormData.apartment,
                        city: orderFormData.city,
                        state: orderFormData.region,
                        postcode: orderFormData.postal,
                        country: orderFormData.country
                    },
                    shipping: {
                        first_name: orderFormData.firstName,
                        last_name: orderFormData.lastName,
                        address_1: orderFormData.apartment,
                        city: orderFormData.city,
                        state: orderFormData.region,
                        postcode: orderFormData.postal,
                        country: orderFormData.country
                    },
                    line_items: cartState.cartArray.map(item => ({
                        product_id: item.id,
                        quantity: item.quantity,
                        meta_data: item.selectedSize || item.selectedColor ? [
                            ...(item.selectedSize ? [{ key: 'Size', value: item.selectedSize }] : []),
                            ...(item.selectedColor ? [{ key: 'Color', value: item.selectedColor }] : [])
                        ] : undefined
                    })),
                    customer_note: orderFormData.note,
                    set_paid: orderFormData.paymentMethod === 'cash-delivery' ? false : true
                }
                const response = await fetch('/api/woocommerce/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                })
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}))
                    throw new Error(errorData.message || '订单提交失败')
                }
                const result = await response.json()
                if (result?.success) {
                    setSubmitSuccess(true)
                    // Clear cart on successful order
                    cartState.cartArray.forEach(item => removeFromCart(item.id))
                    router.push(`/order-confirmation?orderId=${result.order.id}`)
                } else {
                    throw new Error(result?.message || '订单提交失败')
                }
            }

        } catch (error: any) {
            console.error('Order submission error:', error)
            setSubmitError(error.message || '订单提交失败，请重试')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuEleven />
                <Breadcrumb heading='Shopping cart' subHeading='Shopping cart' />
            </div>
            <div className="cart-block md:py-20 py-10">
                <div className="container">
                    <div className="content-main flex justify-between">
                        <div className="left w-1/2">
                            <div className="login bg-surface py-3 px-4 flex justify-between rounded-lg">
                                <div className="left flex items-center"><span className="text-on-surface-variant1 pr-4">Already have an account? </span><span className="text-button text-on-surface hover-underline cursor-pointer">Login</span></div>
                                <div className="right"><i className="ph ph-caret-down fs-20 d-block cursor-pointer"></i></div>
                            </div>
                            <div className="form-login-block mt-3">
                                <form className="p-5 border border-line rounded-lg">
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <div className="email ">
                                            <input className="border-line px-4 pt-3 pb-3 w-full rounded-lg" id="username" type="email" placeholder="Username or email" required />
                                        </div>
                                        <div className="pass ">
                                            <input className="border-line px-4 pt-3 pb-3 w-full rounded-lg" id="password" type="password" placeholder="Password" required />
                                        </div>
                                    </div>
                                    <div className="block-button mt-3">
                                        <button className="button-main button-blue-hover">Login</button>
                                    </div>
                                </form>
                            </div>
                            <div className="information mt-5">
                                <div className="heading5">Information</div>
                                <div className="form-checkout mt-5">
                                    <form onSubmit={submitOrder} id="checkout-form">
                                        <div className="grid sm:grid-cols-2 gap-4 gap-y-5 flex-wrap">
                                            <div className="">
                                                <input className="border-line px-4 py-3 w-full rounded-lg" id="firstName" name="firstName" type="text" placeholder="First Name *" required />
                                            </div>
                                            <div className="">
                                                <input className="border-line px-4 py-3 w-full rounded-lg" id="lastName" name="lastName" type="text" placeholder="Last Name *" required />
                                            </div>
                                            <div className="">
                                                <input className="border-line px-4 py-3 w-full rounded-lg" id="email" name="email" type="email" placeholder="Email Address *" required />
                                            </div>
                                            <div className="">
                                                <input className="border-line px-4 py-3 w-full rounded-lg" id="phoneNumber" name="phoneNumber" type="number" placeholder="Phone Numbers *" required />
                                            </div>
                                            <div className="col-span-full select-block">
                                                <select className="border border-line px-4 py-3 w-full rounded-lg" id="region" name="region" defaultValue={'default'} required>
                                                    <option value="default" disabled>Choose Country/Region</option>
                                                    <option value="India">India</option>
                                                    <option value="France">France</option>
                                                    <option value="Singapore">Singapore</option>
                                                </select>
                                                <Icon.CaretDown className='arrow-down' />
                                            </div>
                                            <div className="">
                                                <input className="border-line px-4 py-3 w-full rounded-lg" id="city" name="city" type="text" placeholder="Town/City *" required />
                                            </div>
                                            <div className="">
                                                <input className="border-line px-4 py-3 w-full rounded-lg" id="apartment" name="apartment" type="text" placeholder="Street,..." required />
                                            </div>
                                            <div className="select-block">
                                                <select className="border border-line px-4 py-3 w-full rounded-lg" id="country" name="country" defaultValue={'default'} required>
                                                    <option value="default" disabled>Choose State</option>
                                                    <option value="India">India</option>
                                                    <option value="France">France</option>
                                                    <option value="Singapore">Singapore</option>
                                                </select>
                                                <Icon.CaretDown className='arrow-down' />
                                            </div>
                                            <div className="">
                                                <input className="border-line px-4 py-3 w-full rounded-lg" id="postal" name="postal" type="text" placeholder="Postal Code *" required />
                                            </div>
                                            <div className="col-span-full">
                                                <textarea className="border border-line px-4 py-3 w-full rounded-lg" id="note" name="note" placeholder="Write note..."></textarea>
                                            </div>
                                        </div>
                                        <div className="payment-block md:mt-10 mt-6">
                                            <div className="heading5">Choose payment Option:</div>
                                            <div className="list-payment mt-5">
                                                <div className={`type bg-surface p-5 border border-line rounded-lg ${activePayment === 'credit-card' ? 'open' : ''}`}>
                                                    <input className="cursor-pointer" type="radio" id="credit" name="payment" checked={activePayment === 'credit-card'} onChange={() => handlePayment('credit-card')} />
                                                    <label className="text-button pl-2 cursor-pointer" htmlFor="credit">Credit Card</label>
                                                    <div className="infor">
                                                        <div className="text-on-surface-variant1 pt-4">Make your payment directly into our bank account. Your order will not be shipped until the funds have cleared in our account.</div>
                                                        <div className="row">
                                                            <div className="col-12 mt-3">
                                                                <label htmlFor="cardNumberCredit">Card Numbers</label>
                                                                <input className="cursor-pointer border-line px-4 py-3 w-full rounded mt-2" type="text" id="cardNumberCredit" placeholder="ex.1234567290" />
                                                            </div>
                                                            <div className=" mt-3">
                                                                <label htmlFor="dateCredit">Date</label>
                                                                <input className="border-line px-4 py-3 w-full rounded mt-2" type="date" id="dateCredit" name="date" />
                                                            </div>
                                                            <div className=" mt-3">
                                                                <label htmlFor="ccvCredit">CCV</label>
                                                                <input className="cursor-pointer border-line px-4 py-3 w-full rounded mt-2" type="text" id="ccvCredit" placeholder="****" />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-3">
                                                            <input type="checkbox" id="saveCredit" name="save" />
                                                            <label className="text-button" htmlFor="saveCredit">Save Card Details</label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`type bg-surface p-5 border border-line rounded-lg mt-5 ${activePayment === 'cash-delivery' ? 'open' : ''}`}>
                                                    <input className="cursor-pointer" type="radio" id="delivery" name="payment" checked={activePayment === 'cash-delivery'} onChange={() => handlePayment('cash-delivery')} />
                                                    <label className="text-button pl-2 cursor-pointer" htmlFor="delivery">Cash on delivery</label>
                                                    <div className="infor">
                                                        <div className="text-on-surface-variant1 pt-4">Make your payment directly into our bank account. Your order will not be shipped until the funds have cleared in our account.</div>
                                                        <div className="row">
                                                            <div className="col-12 mt-3">
                                                                {/* <div className="bg-img"><Image src="assets/images/component/payment.png" alt="" /></div> */}
                                                                <label htmlFor="cardNumberDelivery">Card Numbers</label>
                                                                <input className="cursor-pointer border-line px-4 py-3 w-full rounded mt-2" type="text" id="cardNumberDelivery" placeholder="ex.1234567290" />
                                                            </div>
                                                            <div className=" mt-3">
                                                                <label htmlFor="dateDelivery">Date</label>
                                                                <input className="border-line px-4 py-3 w-full rounded mt-2" type="date" id="dateDelivery" name="date" />
                                                            </div>
                                                            <div className=" mt-3">
                                                                <label htmlFor="ccvDelivery">CCV</label>
                                                                <input className="cursor-pointer border-line px-4 py-3 w-full rounded mt-2" type="text" id="ccvDelivery" placeholder="****" />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-3">
                                                            <input type="checkbox" id="saveDelivery" name="save" />
                                                            <label className="text-button" htmlFor="saveDelivery">Save Card Details</label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`type bg-surface p-5 border border-line rounded-lg mt-5 ${activePayment === 'apple-pay' ? 'open' : ''}`}>
                                                    <input className="cursor-pointer" type="radio" id="apple" name="payment" checked={activePayment === 'apple-pay'} onChange={() => handlePayment('apple-pay')} />
                                                    <label className="text-button pl-2 cursor-pointer" htmlFor="apple">Apple Pay</label>
                                                    <div className="infor">
                                                        <div className="text-on-surface-variant1 pt-4">Make your payment directly into our bank account. Your order will not be shipped until the funds have cleared in our account.</div>
                                                        <div className="row">
                                                            <div className="col-12 mt-3">
                                                                {/* <div className="bg-img"><Image src="assets/images/component/payment.png" alt="" /></div> */}
                                                                <label htmlFor="cardNumberApple">Card Numbers</label>
                                                                <input className="cursor-pointer border-line px-4 py-3 w-full rounded mt-2" type="text" id="cardNumberApple" placeholder="ex.1234567290" />
                                                            </div>
                                                            <div className=" mt-3">
                                                                <label htmlFor="dateApple">Date</label>
                                                                <input className="border-line px-4 py-3 w-full rounded mt-2" type="date" id="dateApple" name="date" />
                                                            </div>
                                                            <div className=" mt-3">
                                                                <label htmlFor="ccvApple">CCV</label>
                                                                <input className="cursor-pointer border-line px-4 py-3 w-full rounded mt-2" type="text" id="ccvApple" placeholder="****" />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-3">
                                                            <input type="checkbox" id="saveApple" name="save" />
                                                            <label className="text-button" htmlFor="saveApple">Save Card Details</label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`type bg-surface p-5 border border-line rounded-lg mt-5 ${activePayment === 'paypal' ? 'open' : ''}`}>
                                                    <input className="cursor-pointer" type="radio" id="paypal" name="payment" checked={activePayment === 'paypal'} onChange={() => handlePayment('paypal')} />
                                                    <label className="text-button pl-2 cursor-pointer" htmlFor="paypal">PayPal</label>
                                                    <div className="infor">
                                                        <div className="text-on-surface-variant1 pt-4">Make your payment directly into our bank account. Your order will not be shipped until the funds have cleared in our account.</div>
                                                        <div className="row">
                                                            <div className="col-12 mt-3">
                                                                <label htmlFor="cardNumberPaypal">Card Numbers</label>
                                                                <input className="cursor-pointer border-line px-4 py-3 w-full rounded mt-2" type="text" id="cardNumberPaypal" placeholder="ex.1234567290" />
                                                            </div>
                                                            <div className=" mt-3">
                                                                <label htmlFor="datePaypal">Date</label>
                                                                <input className="border-line px-4 py-3 w-full rounded mt-2" type="date" id="datePaypal" name="date" />
                                                            </div>
                                                            <div className=" mt-3">
                                                                <label htmlFor="ccvPaypal">CCV</label>
                                                                <input className="cursor-pointer border-line px-4 py-3 w-full rounded mt-2" type="text" id="ccvPaypal" placeholder="****" />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-3">
                                                            <input type="checkbox" id="savePaypal" name="save" />
                                                            <label className="text-button" htmlFor="savePaypal">Save Card Details</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Error/Success Messages */}
                                        {submitError && (
                                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mt-4">
                                                {submitError}
                                            </div>
                                        )}
                                        {submitSuccess && (
                                            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mt-4">
                                                订单提交成功！正在跳转...
                                            </div>
                                        )}

                                        <div className="block-button md:mt-10 mt-6">
                                            <button 
                                                type="submit" 
                                                disabled={isSubmitting}
                                                className={`button-main w-full payment-submit-btn ${
                                                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            >
                                                {isSubmitting ? '提交中...' : 'Payment'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                        </div>
                        <div className="right w-5/12">
                            <div className="checkout-block">
                                <div className="heading5 pb-3">Your Order</div>
                                {orderError && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mt-2">
                                        {orderError}
                                    </div>
                                )}
                                <div className="list-product-checkout">
                                    {order ? (
                                        (Array.isArray(order.line_items) && order.line_items.length > 0) ? (
                                            order.line_items.map((item: any, idx: number) => (
                                                <div key={`${item.product_id}-${idx}`} className="item flex items-center justify-between w-full pb-5 border-b border-line gap-6 mt-5">
                                                    <div className="flex items-center justify-between w-full">
                                                        <div>
                                                            <div className="name text-title">{item.name || `Product #${item.product_id}`}</div>
                                                            <div className="caption1 text-secondary mt-2">
                                                                <span className='size capitalize'>{item.meta_data?.find((m: any) => m.key === 'Size')?.value || ''}</span>
                                                                {item.meta_data?.find((m: any) => m.key === 'Color') ? <span>/</span> : null}
                                                                <span className='color capitalize'>{item.meta_data?.find((m: any) => m.key === 'Color')?.value || ''}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-title">
                                                            <span className='quantity'>{item.quantity}</span>
                                                            <span className='px-1'>x</span>
                                                            <span>
                                                                {formatPrice(parseFloat(item.subtotal || item.total || item.price || '0.00'))}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className='text-button pt-3'>订单无商品</p>
                                        )
                                    ) : (
                                        cartState.cartArray.length < 1 ? (
                                            <p className='text-button pt-3'>No product in cart</p>
                                        ) : (
                                            cartState.cartArray.map((product) => (
                                                <div key={String(product.id)} className="item flex items-center justify-between w-full pb-5 border-b border-line gap-6 mt-5">
                                                    <div className="bg-img w-[100px] aspect-square flex-shrink-0 rounded-lg overflow-hidden">
                                                        {(() => {
                                                            const fallback = '/images/product/1000x1000.png'
                                                            const imageSrc = product.thumbImage?.[0]
                                                                || product.images?.[0]
                                                                || product.variation?.[0]?.image
                                                                || fallback
                                                            return (
                                                                <Image
                                                                    src={imageSrc}
                                                                    width={500}
                                                                    height={500}
                                                                    alt={product.name || 'product image'}
                                                                    className='w-full h-full object-cover'
                                                                />
                                                            )
                                                        })()}
                                                    </div>
                                                    <div className="flex items-center justify-between w-full">
                                                        <div>
                                                            <div className="name text-title">{product.name}</div>
                                                            <div className="caption1 text-secondary mt-2">
                                                                <span className='size capitalize'>{product.selectedSize || (product.sizes?.[0] ?? '')}</span>
                                                                {(product.selectedSize || (product.sizes?.[0] ?? '')) && (product.selectedColor || (product.variation?.[0]?.color ?? '')) ? <span>/</span> : null}
                                                                <span className='color capitalize'>{product.selectedColor || (product.variation?.[0]?.color ?? '')}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-title">
                                                            <span className='quantity'>{product.quantity}</span>
                                                            <span className='px-1'>x</span>
                                                            <span>
                                                                {formatPrice(product.price)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )
                                    )}
                                </div>
                                <div className="discount-block py-5 flex justify-between border-b border-line">
                                    <div className="text-title">Discounts</div>
                                    <div className="text-title">-{formatPrice(0)}</div>
                                </div>
                                <div className="ship-block py-5 flex justify-between border-b border-line">
                                    <div className="text-title">Shipping</div>
                                    <div className="text-title">Free</div>
                                </div>
                                <div className="total-cart-block pt-5 flex justify-between">
                                    <div className="heading5">Total</div>
                                    <div className="heading5 total-cart">{totalDisplay}</div>
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