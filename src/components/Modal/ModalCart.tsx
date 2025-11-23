'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { ProductType } from '@/type/ProductType';
import { useModalCartContext } from '@/context/ModalCartContext'
import { useCart } from '@/context/CartContext'
import { countdownTime } from '@/store/countdownTime'
import CountdownTimeType from '@/type/CountdownType';
import { formatPrice } from '@/utils/priceFormat'

const ModalCart = ({ serverTimeLeft }: { serverTimeLeft: CountdownTimeType }) => {
    const [timeLeft, setTimeLeft] = useState(serverTimeLeft);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(countdownTime());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const [activeTab, setActiveTab] = useState<string | undefined>('')
    const { isModalOpen, closeModalCart } = useModalCartContext();
    const { cartState, addToCart, removeFromCart, updateCart } = useCart()

    const handleAddToCart = (productItem: ProductType) => {
        // 检查商品是否已在购物车中
        const existingItem = cartState.cartArray.find(item => item.id === productItem.id);
        
        if (!existingItem) {
            // 如果商品不在购物车中，添加新商品
            addToCart({ ...productItem });
        } else {
            // 如果商品已在购物车中，更新数量
            updateCart(productItem.id, productItem.quantityPurchase, '', '')
        }
        
        // 打开购物车模态框
        // 注意：不需要在这里调用openModalCart，因为模态框已经是打开状态
        // 这个函数主要用于在模态框内的推荐商品区域添加商品
    };

    const handleActiveTab = (tab: string) => {
        setActiveTab(tab)
    }

    let moneyForFreeship = 150;
    let [totalCart, setTotalCart] = useState<number>(0)
    let [discountCart, setDiscountCart] = useState<number>(0)

    useEffect(() => {
        const newTotal = cartState.cartArray.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setTotalCart(newTotal);
    }, [cartState.cartArray]);

    const [products, setProducts] = useState<ProductType[]>([])
    const [creatingOrder, setCreatingOrder] = useState(false)

    // No fallback - products will be fetched from WooCommerce API only

    const handleCheckout = async () => {
        if (cartState.cartArray.length === 0) {
            alert('购物车为空，无法创建订单')
            return
        }

        setCreatingOrder(true)
        
        try {
            // 获取WooCommerce真实产品ID
            const wcCartItems = []
            
            for (const item of cartState.cartArray) {
                try {
                    // 使用产品slug查询WooCommerce真实产品信息
                    const response = await fetch(`http://localhost:3001/api/woocommerce/products?slug=${item.slug}`)
                    
                    if (response.ok) {
                        const wcProducts = await response.json()
                        
                        if (wcProducts && wcProducts.length > 0) {
                            const wcProduct = wcProducts[0] // 获取第一个匹配的产品
                            
                            wcCartItems.push({
                                productId: wcProduct.id, // 使用WooCommerce真实ID
                                quantity: item.quantity,
                                variationId: null, // 暂时不处理variation ID
                                size: item.selectedSize || null,
                                color: item.selectedColor || null
                            })
                        } else {
                            console.warn(`未找到slug为${item.slug}的WooCommerce产品，使用前端ID: ${item.id}`)
                            // 如果未找到WooCommerce产品，继续使用前端ID作为备选
                            wcCartItems.push({
                                productId: item.id,
                                quantity: item.quantity,
                                variationId: null, // 暂时不处理variation ID
                                size: item.selectedSize || null,
                                color: item.selectedColor || null
                            })
                        }
                    } else {
                        console.warn(`查询slug为${item.slug}的WooCommerce产品失败: ${response.status}`)
                        // 如果查询失败，继续使用前端ID作为备选
                        wcCartItems.push({
                                productId: item.id,
                                quantity: item.quantity,
                                variationId: null, // 暂时不处理variation ID
                                size: item.selectedSize || null,
                                color: item.selectedColor || null
                            })
                    }
                } catch (error) {
                    console.error(`获取产品${item.slug}的WooCommerce信息时出错:`, error)
                    // 如果出现错误，继续使用前端ID作为备选
                    wcCartItems.push({
                                productId: item.id,
                                quantity: item.quantity,
                                variationId: null, // 暂时不处理variation ID
                                size: item.selectedSize || null,
                                color: item.selectedColor || null
                            })
                }
            }

            const params = new URLSearchParams()
            params.set('cartItems', JSON.stringify(wcCartItems))
            params.set('discount', String(discountCart))
            params.set('ship', String(totalCart < moneyForFreeship ? 30 : 0))
            
            // 关闭模态框并跳转到checkout页面
            closeModalCart()
            // 检查是否在浏览器环境中
            if (typeof window !== 'undefined') {
                window.location.href = `/checkout?${params.toString()}`
            }
        } catch (error) {
            console.error('Error redirecting to checkout:', error)
            alert('结算过程中出现错误，请重试')
        } finally {
            setCreatingOrder(false)
        }
    }

    return (
        <>
            <div className={`modal-cart-block`} onClick={closeModalCart}>
                <div
                    className={`modal-cart-main flex ${isModalOpen ? 'open' : ''}`}
                    onClick={(e) => { e.stopPropagation() }}
                >
                    <div className="left w-1/2 border-r border-line py-6 max-md:hidden">
                        <div className="heading5 px-6 pb-3">You May Also Like</div>
                        <div className="list px-6">
                            {products.slice(0, 4).map((product) => (
                                <div key={product.id} className='item py-5 flex items-center justify-between gap-3 border-b border-line'>
                                    <div className="infor flex items-center gap-5">
                                        <div className="bg-img">
                                            {(() => {
                                                const imgSrc = product.thumbImage?.[0]
                                                    || product.images?.[0]
                                                    || product.variation?.[0]?.image
                                                    || '/images/product/1000x1000.png';
                                                return (
                                                    <Image
                                                        src={imgSrc}
                                                        width={300}
                                                        height={300}
                                                        alt={product.name || 'Product image'}
                                                        className='w-[100px] aspect-square flex-shrink-0 rounded-lg'
                                                    />
                                                );
                                            })()}
                                        </div>
                                        <div className=''>
                                            <div className="name text-button">{product.name}</div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="product-price text-title">{formatPrice(product.price)}</div>
                                                <div className="product-origin-price text-title text-secondary2"><del>{formatPrice(product.originPrice)}</del></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="text-xl bg-white w-10 h-10 rounded-xl border border-black flex items-center justify-center duration-300 cursor-pointer hover:bg-black hover:text-white"
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleAddToCart(product)
                                        }}
                                    >
                                        <Icon.Handbag />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="right cart-block md:w-1/2 w-full py-6 relative overflow-hidden">
                        <div className="heading px-6 pb-3 flex items-center justify-between relative">
                            <div className="heading5">Shopping Cart</div>
                            <div
                                className="close-btn absolute right-6 top-0 w-6 h-6 rounded-full bg-surface flex items-center justify-center duration-300 cursor-pointer hover:bg-black hover:text-white"
                                onClick={closeModalCart}
                            >
                                <Icon.X size={14} />
                            </div>
                        </div>
                        <div className="time px-6">
                            <div className=" flex items-center gap-3 px-5 py-3 bg-green rounded-lg">
                                <p className='text-3xl'>🔥</p>
                                <div className="caption1">Your cart will expire in <span className='text-red caption1 font-semibold'>{timeLeft.minutes}:
                                    {timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds}</span> minutes!<br />
                                    Please checkout now before your items sell out!</div>
                            </div>
                        </div>
                        <div className="heading banner mt-3 px-6">
                            <div className="text">Buy <span className="text-button"> {formatPrice(moneyForFreeship - totalCart > 0 ? moneyForFreeship - totalCart : 0)} </span>
                                <span>more to get </span>
                                <span className="text-button">freeship</span></div>
                            <div className="tow-bar-block mt-3">
                                <div
                                    className="progress-line"
                                    style={{ width: totalCart <= moneyForFreeship ? `${(totalCart / moneyForFreeship) * 100}%` : `100%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="list-product px-6">
                            {cartState.cartArray.map((product) => (
                                <div key={product.id} className='item py-5 flex items-center justify-between gap-3 border-b border-line'>
                                    <div className="infor flex items-center gap-3 w-full">
                                        <div className="bg-img w-[100px] aspect-square flex-shrink-0 rounded-lg overflow-hidden">
                                            {(() => {
                                                const imgSrc = product.thumbImage?.[0]
                                                    || product.images?.[0]
                                                    || product.variation?.[0]?.image
                                                    || '/images/product/1000x1000.png';
                                                return (
                                                    <Image
                                                        src={imgSrc}
                                                        width={300}
                                                        height={300}
                                                        alt={product.name || 'Product image'}
                                                        className='w-full h-full'
                                                    />
                                                );
                                            })()}
                                        </div>
                                        <div className='w-full'>
                                            <div className="flex items-center justify-between w-full">
                                                <div className="name text-button">{product.name}</div>
                                                <div
                                                    className="remove-cart-btn caption1 font-semibold text-red underline cursor-pointer"
                                                    onClick={() => removeFromCart(product.id)}
                                                >
                                                    Remove
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between gap-2 mt-3 w-full">
                                                <div className="flex items-center text-secondary2 capitalize">
                                                {(product.selectedSize || product.sizes?.[0] || '')}/{(product.selectedColor || (product.variation && product.variation[0] && product.variation[0].color) || '')}
                                            </div>
                                                <div className="product-price text-title">{formatPrice(product.price)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="footer-modal bg-white absolute bottom-0 left-0 w-full">
                            <div className="flex items-center justify-center lg:gap-14 gap-8 px-6 py-4 border-b border-line">
                                <div
                                    className="item flex items-center gap-3 cursor-pointer"
                                    onClick={() => handleActiveTab('note')}
                                >
                                    <Icon.NotePencil className='text-xl' />
                                    <div className="caption1">Note</div>
                                </div>
                                <div
                                    className="item flex items-center gap-3 cursor-pointer"
                                    onClick={() => handleActiveTab('shipping')}
                                >
                                    <Icon.Truck className='text-xl' />
                                    <div className="caption1">Shipping</div>
                                </div>
                                <div
                                    className="item flex items-center gap-3 cursor-pointer"
                                    onClick={() => handleActiveTab('coupon')}
                                >
                                    <Icon.Tag className='text-xl' />
                                    <div className="caption1">Coupon</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-6 px-6">
                                <div className="heading5">Subtotal</div>
                                <div className="heading5">{formatPrice(totalCart)}</div>
                            </div>
                            <div className="block-button text-center p-6">
                                <div className="flex items-center gap-4">
                                    <Link
                                        href={'/cart'}
                                        className='button-main basis-1/2 bg-white border border-black text-black text-center uppercase'
                                        onClick={closeModalCart}
                                    >
                                        View cart
                                    </Link>
                                    <button
                                        className='button-main basis-1/2 text-center uppercase'
                                        onClick={handleCheckout}
                                        disabled={creatingOrder || cartState.cartArray.length === 0}
                                    >
                                        {creatingOrder ? 'Creating Order...' : 'Check Out'}
                                    </button>
                                </div>
                                <div onClick={closeModalCart} className="text-button-uppercase mt-4 text-center has-line-before cursor-pointer inline-block">Or continue shopping</div>
                            </div>
                            <div className={`tab-item note-block ${activeTab === 'note' ? 'active' : ''}`}>
                                <div className="px-6 py-4 border-b border-line">
                                    <div className="item flex items-center gap-3 cursor-pointer">
                                        <Icon.NotePencil className='text-xl' />
                                        <div className="caption1">Note</div>
                                    </div>
                                </div>
                                <div className="form pt-4 px-6">
                                    <textarea name="form-note" id="form-note" rows={4} placeholder='Add special instructions for your order...' className='caption1 py-3 px-4 bg-surface border-line rounded-md w-full'></textarea>
                                </div>
                                <div className="block-button text-center pt-4 px-6 pb-6">
                                    <div className='button-main w-full text-center' onClick={() => setActiveTab('')}>Save</div>
                                    <div onClick={() => setActiveTab('')} className="text-button-uppercase mt-4 text-center has-line-before cursor-pointer inline-block">Cancel</div>
                                </div>
                            </div>
                            <div className={`tab-item note-block ${activeTab === 'shipping' ? 'active' : ''}`}>
                                <div className="px-6 py-4 border-b border-line">
                                    <div className="item flex items-center gap-3 cursor-pointer">
                                        <Icon.Truck className='text-xl' />
                                        <div className="caption1">Estimate shipping rates</div>
                                    </div>
                                </div>
                                <div className="form pt-4 px-6">
                                    <div className="">
                                        <label htmlFor='select-country' className="caption1 text-secondary">Country/region</label>
                                        <div className="select-block relative mt-2">
                                            <select
                                                id="select-country"
                                                name="select-country"
                                                className='w-full py-3 pl-5 rounded-xl bg-white border border-line'
                                                defaultValue={'Country/region'}
                                            >
                                                <option value="Country/region" disabled>Country/region</option>
                                                <option value="France">France</option>
                                                <option value="Spain">Spain</option>
                                                <option value="UK">UK</option>
                                                <option value="USA">USA</option>
                                            </select>
                                            <Icon.CaretDown size={12} className='absolute top-1/2 -translate-y-1/2 md:right-5 right-2' />
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <label htmlFor='select-state' className="caption1 text-secondary">State</label>
                                        <div className="select-block relative mt-2">
                                            <select
                                                id="select-state"
                                                name="select-state"
                                                className='w-full py-3 pl-5 rounded-xl bg-white border border-line'
                                                defaultValue={'State'}
                                            >
                                                <option value="State" disabled>State</option>
                                                <option value="Paris">Paris</option>
                                                <option value="Madrid">Madrid</option>
                                                <option value="London">London</option>
                                                <option value="New York">New York</option>
                                            </select>
                                            <Icon.CaretDown size={12} className='absolute top-1/2 -translate-y-1/2 md:right-5 right-2' />
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <label htmlFor='select-code' className="caption1 text-secondary">Postal/Zip Code</label>
                                        <input className="border-line px-5 py-3 w-full rounded-xl mt-3" id="select-code" type="text" placeholder="Postal/Zip Code" />
                                    </div>
                                </div>
                                <div className="block-button text-center pt-4 px-6 pb-6">
                                    <div className='button-main w-full text-center' onClick={() => setActiveTab('')}>Calculator</div>
                                    <div onClick={() => setActiveTab('')} className="text-button-uppercase mt-4 text-center has-line-before cursor-pointer inline-block">Cancel</div>
                                </div>
                            </div>
                            <div className={`tab-item note-block ${activeTab === 'coupon' ? 'active' : ''}`}>
                                <div className="px-6 py-4 border-b border-line">
                                    <div className="item flex items-center gap-3 cursor-pointer">
                                        <Icon.Tag className='text-xl' />
                                        <div className="caption1">Add A Coupon Code</div>
                                    </div>
                                </div>
                                <div className="form pt-4 px-6">
                                    <div className="">
                                        <label htmlFor='select-discount' className="caption1 text-secondary">Enter Code</label>
                                        <input className="border-line px-5 py-3 w-full rounded-xl mt-3" id="select-discount" type="text" placeholder="Discount code" />
                                    </div>
                                </div>
                                <div className="block-button text-center pt-4 px-6 pb-6">
                                    <div className='button-main w-full text-center' onClick={() => setActiveTab('')}>Apply</div>
                                    <div onClick={() => setActiveTab('')} className="text-button-uppercase mt-4 text-center has-line-before cursor-pointer inline-block">Cancel</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ModalCart
