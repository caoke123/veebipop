'use client'

import React, { useRef, useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import BlurImage from '@/components/common/BlurImage'
import { getBlurDataURL } from '@/utils/imagePlaceholders'
import Link from 'next/link'
import { ProductType } from '@/type/ProductType'
import Product from '../Product'
import Rate from '@/components/Other/Rate'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import * as Icon from "@phosphor-icons/react/dist/ssr";
import SwiperCore from 'swiper/core';
import { useCart } from '@/context/CartContext'
import { useModalCartContext } from '@/context/ModalCartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useModalWishlistContext } from '@/context/ModalWishlistContext'
import { useCompare } from '@/context/CompareContext'
import { useModalCompareContext } from '@/context/ModalCompareContext'
import ModalSizeguide from '@/components/Modal/ModalSizeguide'
import { formatPrice } from '@/utils/priceFormat'
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ProductDetail.css'; // 导入新的样式文件

// Dynamic import for DOMPurify to avoid server-side issues
let DOMPurify: any = null;
const loadDOMPurify = async () => {
  if (typeof window !== 'undefined' && !DOMPurify) {
    const module = await import('isomorphic-dompurify');
    DOMPurify = module.default;
    
    // Apply hooks only once and only on client side
    if (DOMPurify && !DOMPurify.hooksApplied) {
      const ALLOWED_IFRAME_HOSTS = [
        'www.youtube.com', 'youtube.com', 'youtu.be', 'player.vimeo.com'
      ];

      DOMPurify.addHook('afterSanitizeAttributes', (node: Element) => {
        const name = node.nodeName;
        // External links: ensure rel and target are safe
        if (name === 'A') {
          const href = node.getAttribute('href') || '';
          if (/^(https?:)?\/\//i.test(href)) {
            if (!node.getAttribute('rel')) node.setAttribute('rel', 'noopener noreferrer');
            if (!node.getAttribute('target')) node.setAttribute('target', '_blank');
          }
        }

        // Restrict iframe sources to known hosts; add sandbox and referrer policy
        if (name === 'IFRAME') {
          const src = node.getAttribute('src') || '';
          try {
            const url = new URL(src, window.location.origin);
            const host = url.hostname.toLowerCase();
            if (!ALLOWED_IFRAME_HOSTS.includes(host)) {
              node.parentNode && node.parentNode.removeChild(node);
            } else {
              if (!node.getAttribute('sandbox')) node.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
              if (!node.getAttribute('referrerpolicy')) node.setAttribute('referrerpolicy', 'no-referrer');
            }
          } catch (e) {
            node.parentNode && node.parentNode.removeChild(node);
          }
        }

        // Ensure media/image src protocols are http(s) or data; strip others
        if (name === 'IMG' || name === 'VIDEO' || name === 'AUDIO' || name === 'SOURCE') {
          const src = node.getAttribute('src') || node.getAttribute('srcset') || '';
          if (src && !/^(https?:|data:)/i.test(src)) {
            node.removeAttribute('src');
            node.removeAttribute('srcset');
          }
        }
      });
      
      DOMPurify.hooksApplied = true;
    }
  }
  return DOMPurify;
};

SwiperCore.use([Navigation, Thumbs]);

// Centralized DOMPurify options for rich HTML while keeping safety
const SANITIZE_OPTIONS = {
    ADD_TAGS: [
        // media
        'img', 'picture', 'source', 'iframe', 'video', 'audio', 'track',
        // tables
        'table', 'thead', 'tbody', 'tr', 'td', 'th', 'caption', 'colgroup', 'col',
        // content
        'figure', 'figcaption', 'blockquote', 'hr', 'pre', 'code',
        'ul', 'ol', 'li', 'span', 'small', 'strong', 'em', 'u', 's', 'sup', 'sub',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        // image map
        'map', 'area'
    ],
    ADD_ATTR: [
        // common
        'class', 'style', 'id',
        // links
        'href', 'target', 'rel', 'download', 'name',
        // images
        'src', 'srcset', 'sizes', 'alt', 'title', 'width', 'height', 'loading', 'decoding', 'referrerpolicy', 'usemap',
        // picture/source
        'media', 'type',
        // iframe
        'allow', 'allowfullscreen', 'frameborder', 'sandbox', 'referrerpolicy',
        // video/audio
        'controls', 'autoplay', 'muted', 'loop', 'playsinline', 'poster', 'preload', 'controlsList', 'crossorigin',
        // track
        'kind', 'srclang', 'label', 'default',
        // area
        'coords', 'shape'
    ],
    ALLOW_DATA_ATTR: true
};

interface Props {
    data: Array<ProductType>
    // Accept either slug or id as the product selector
    productKey: string | number | null
}

const Sale: React.FC<Props> = ({ data, productKey }) => {
    const swiperRef: any = useRef();
    const [photoIndex, setPhotoIndex] = useState(0)
    const [openPopupImg, setOpenPopupImg] = useState(false)
    const [openSizeGuide, setOpenSizeGuide] = useState<boolean>(false)
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperCore | null>(null);
    const [activeColor, setActiveColor] = useState<string>('')
    const [activeSize, setActiveSize] = useState<string>('')
    const [domPurifyLoaded, setDomPurifyLoaded] = useState(false)
    const { addToCart, updateCart, cartState } = useCart()
    const { openModalCart } = useModalCartContext()
    const { addToWishlist, removeFromWishlist, wishlistState } = useWishlist()
    const { openModalWishlist } = useModalWishlistContext()
    const { addToCompare, removeFromCompare, compareState } = useCompare();
    const { openModalCompare } = useModalCompareContext()
    
    // Find the main product based on productKey - consistent on both server and client
    const key = productKey == null ? '' : String(productKey)
    let productMain = data.find(p => String(p.slug || '') === key) as ProductType
    if (productMain === undefined) {
        productMain = data.find(p => String(p.id) === key) as ProductType
    }
    if (productMain === undefined) {
        productMain = data[0]
    }
    
    // 提取产品数据
    // 确保 product 对象已在组件作用域内可用，例如通过 props 传入
    // 假设 product 对象结构为 { id: ..., name: ..., acf: { product_markdown_description: "...", product_image_gallery: [...] } }
    const markdownContent = productMain?.acf?.product_markdown_description || "";
    const imageGallery = productMain?.acf?.product_image_gallery || []; // 确保是个数组
    
    // Debug markdown content
    useEffect(() => {
        console.log('Product Main Object:', productMain);
        console.log('Product ACF:', productMain?.acf);
        console.log('Markdown Content:', markdownContent);
        console.log('Markdown Content Length:', markdownContent.length);
        console.log('Image Gallery:', imageGallery);
    }, [productMain, markdownContent, imageGallery]);
    
    // Load DOMPurify on client side
    useEffect(() => {
        if (!domPurifyLoaded) {
            loadDOMPurify().then(() => {
                console.log('DOMPurify loaded successfully');
                setDomPurifyLoaded(true);
            }).catch(error => {
                console.error('Failed to load DOMPurify:', error);
                // Still set to true to prevent infinite loading attempts
                setDomPurifyLoaded(true);
            });
        }
    }, [domPurifyLoaded]);
    
    // Debug product description
    useEffect(() => {
        if (productMain && productMain.description) {
            console.log('Product description length:', productMain.description.length);
            console.log('Product description preview:', productMain.description.substring(0, 100));
        }
    }, [productMain]);
    
    // Helper function to safely render HTML content
    const getSafeHTML = (htmlContent: string | undefined | null) => {
        if (!htmlContent) return { __html: '' };
        
        // On server side or before DOMPurify loads, return empty string to avoid hydration mismatch
        if (typeof window === 'undefined' || !domPurifyLoaded || !DOMPurify) {
            return { __html: '' };
        }
        
        try {
            return { __html: DOMPurify.sanitize(htmlContent, SANITIZE_OPTIONS) };
        } catch (error) {
            console.error('Error sanitizing HTML:', error);
            return { __html: '' };
        }
    };

    // Extract related products from data array (excluding the main product)
    // The related products are already fetched and included in the data array
    let relatedProducts = data.filter(p => p.id !== productMain?.id)
    
    // Debug related products calculation
    useEffect(() => {
        console.log('=== Related Products Debug ===')
        console.log('productMain:', productMain?.name, 'ID:', productMain?.id, 'Category:', productMain?.category)
        console.log('data.length:', data.length)
        console.log('relatedProducts.length:', relatedProducts.length)
        console.log('relatedProducts:', relatedProducts.map(p => ({name: p.name, id: p.id, category: p.category})))
        console.log('productMain.related_ids:', productMain?.related_ids)
    }, [productMain, data, relatedProducts])
    
    // Enhanced fallback strategy: If no related products, fetch fallback products from same category
    const [fallbackProducts, setFallbackProducts] = useState<ProductType[]>([])
    
    useEffect(() => {
        const fetchFallbackProducts = async () => {
            if (relatedProducts.length === 0 && productMain?.category) {
                try {
                    console.log('No related products found, fetching fallback products from category:', productMain.category)
                    const params = new URLSearchParams()
                    params.set('category', productMain.category)
                    params.set('per_page', '8')
                    params.set('_fields', 'id,name,slug,price,regular_price,sale_price,average_rating,stock_quantity,manage_stock,images,short_description,description,categories,attributes,tags,date_created,meta_data')
                    
                    const res = await fetch(`/api/woocommerce/products?${params.toString()}`)
                    if (res.ok) {
                        const list = await res.json()
                        const filteredList = Array.isArray(list)
                            ? list.filter((product: any) => product.id !== parseInt(productMain?.id || '0')).slice(0, 8)
                            : []
                        
                        const convertedProducts = await Promise.all(
                            filteredList.map((product: any) => import('@/utils/wcAdapter').then(({ wcToProductType }) => wcToProductType(product)))
                        )
                        
                        console.log(`获取到 ${convertedProducts.length} 个同类目兜底产品`)
                        setFallbackProducts(convertedProducts)
                    }
                } catch (error) {
                    console.error('Error fetching fallback products:', error)
                }
            } else {
                setFallbackProducts([])
            }
        }
        
        fetchFallbackProducts()
    }, [productMain, relatedProducts.length])
    
    // Use related products if available, otherwise use fallback products
    const finalRelatedProducts = relatedProducts.length > 0 ? relatedProducts : fallbackProducts

    // Calculate percentSale on both server and client to avoid hydration mismatch
    const [percentSale, setPercentSale] = useState(0)
    const [hydrated, setHydrated] = useState(false)
    
    // 使用useMemo确保服务器端和客户端的计算结果一致
    const viewCount = useMemo(() => {
        // 使用产品ID的哈希值生成确定的值，确保服务器端和客户端结果一致
        if (!productMain?.id) return 64;
        
        const productId = String(productMain.id);
        let hash = 0;
        for (let i = 0; i < productId.length; i++) {
            const char = productId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        
        // 确保值在1-100范围内
        return Math.abs(hash % 100) + 1;
    }, [productMain?.id]); // 使用productMain?.id作为依赖确保一致

    const categoryDisplay = useMemo(() => {
        // 确保服务器端和客户端使用相同的计算逻辑
        if (!productMain?.category && !productMain?.gender) {
            return 'art-toys, unisex'; // 完全无数据时的默认值
        }
        
        // 基于productMain数据计算，但提供一致的默认值
        const category = productMain?.category || 'art-toys';
        const gender = productMain?.gender || 'unisex';
        
        return `${category}, ${gender}`;
    }, [productMain?.category, productMain?.gender]);
    
    // Calculate percentSale on server-side first
    useMemo(() => {
        if (productMain && productMain.originPrice && productMain.price && productMain.price > 0 && productMain.originPrice > 0) {
            const calculatedPercent = Math.floor(100 - ((productMain.price / productMain.originPrice) * 100))
            setPercentSale(Math.max(0, calculatedPercent))
        }
    }, [productMain])
    
    useEffect(() => {
        // Set hydrated to true after client-side hydration
        setHydrated(true);
        
        // Recalculate on client to ensure accuracy
        if (productMain && productMain.originPrice && productMain.price && productMain.price > 0 && productMain.originPrice > 0) {
            const calculatedPercent = Math.floor(100 - ((productMain.price / productMain.originPrice) * 100))
            setPercentSale(Math.max(0, calculatedPercent))
        }
    }, [productMain])

    const handleOpenSizeGuide = () => {
        setOpenSizeGuide(true);
    };

    const handleCloseSizeGuide = () => {
        setOpenSizeGuide(false);
    };

    const handleSwiper = (swiper: SwiperCore) => {
        // Defer state update to avoid React warning in dev overlay about
        // updating state during render of a different component.
        setTimeout(() => setThumbsSwiper(swiper), 0);
    };

    const handleActiveColor = (item: string) => {
        setActiveColor(item)
    }

    const handleActiveSize = (item: string) => {
        setActiveSize(item)
    }

    const handleIncreaseQuantity = () => {
        if (productMain) {
            productMain.quantityPurchase = (productMain.quantityPurchase || 0) + 1;
            updateCart(String(productMain.id), productMain.quantityPurchase, activeSize || '', activeColor || '');
        }
    };

    const handleDecreaseQuantity = () => {
        if (productMain && productMain.quantityPurchase > 1) {
            productMain.quantityPurchase -= 1
            updateCart(String(productMain.id), productMain.quantityPurchase, activeSize || '', activeColor || '');
        }
    };

    const handleAddToCart = () => {
        try {
            // Ensure we have product data
            if (!productMain) {
                console.error('Product data is not available');
                return;
            }

            // Create a safe product object to add to cart
            const productToAdd = {
                ...productMain,
                quantityPurchase: productMain.quantityPurchase > 0 ? productMain.quantityPurchase : 1,
                selectedSize: activeSize || '',
                selectedColor: activeColor || ''
            };

            // Check if item already exists in cart
            const existingItem = productMain 
                ? cartState?.cartArray?.find(item => String(item.id) === String(productMain.id)) 
                : null;
            
            // Add or update in cart
            if (!existingItem) {
                // Add new item to cart
                addToCart(productToAdd);
            } else {
                // Update existing item with current quantity and selections
                updateCart(
                    String(productMain.id), 
                    productToAdd.quantityPurchase, 
                    activeSize || '', 
                    activeColor || ''
                );
            }
            
            // Open cart modal
            openModalCart();
        } catch (error) {
            console.error('Error adding product to cart:', error);
        }
    };
    const handleAddToWishlist = () => {
        // if product existed in wishlit, remove from wishlist and set state to false
        if (productMain && wishlistState.wishlistArray.some(item => item.id === productMain.id)) {
            removeFromWishlist(productMain.id);
        } else if (productMain) {
            // else, add to wishlist and set state to true
            addToWishlist(productMain);
        }
        openModalWishlist();
    };

    const handleAddToCompare = () => {
        // if product existed in wishlit, remove from wishlist and set state to false
        if (productMain && compareState.compareArray.length < 3) {
            if (compareState.compareArray.some(item => item.id === productMain.id)) {
                removeFromCompare(productMain.id);
            } else {
                // else, add to wishlist and set state to true
                addToCompare(productMain);
            }
        } else {
            alert('Compare up to 3 products')
        }

        openModalCompare();
    };

    const handleBuyNow = async () => {
        try {
            if (!productMain) {
                console.error('Product data is not available');
                return;
            }
            const quantity = productMain.quantityPurchase && productMain.quantityPurchase > 0
                ? productMain.quantityPurchase
                : 1

            // Prefer real WooCommerce product id via slug lookup
            let wcProductId: string | number = String(productMain?.id)
            let variationId: string | undefined = undefined
            
            const slug = String(productMain?.slug || '').trim()
            if (slug) {
                try {
                    const res = await fetch(`/api/woocommerce/products?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
                    if (res.ok) {
                        const list = await res.json()
                        const first = Array.isArray(list) && list.length > 0 ? list[0] : null
                        if (first?.id) wcProductId = String(first.id)
                        
                        // Try to find matching variation if product has variations
                        if (first?.type === 'variable' && (activeSize || activeColor)) {
                            const varRes = await fetch(`/api/woocommerce/products/${encodeURIComponent(String(first.id))}/variations`, { cache: 'no-store' })
                            if (varRes.ok) {
                                const variations = await varRes.json()
                                if (Array.isArray(variations)) {
                                    const norm = (s: string) => s.toLowerCase().replace(/^pa_/, '').trim()
                                    const wantSize = activeSize ? norm(activeSize) : null
                                    const wantColor = activeColor ? norm(activeColor) : null

                                    const match = variations.find((v: any) => {
                                        const attrs = Array.isArray(v?.attributes) ? v.attributes : []
                                        let ok = true
                                        if (wantSize) {
                                            const aSize = attrs.find((a: any) => norm(String(a?.name || '')) === 'size')
                                            ok = ok && !!aSize && norm(String(aSize.option || '')) === wantSize
                                        }
                                        if (wantColor) {
                                            const aColor = attrs.find((a: any) => {
                                                const n = norm(String(a?.name || ''))
                                                return n === 'color' || n === 'colour'
                                            })
                                            ok = ok && !!aColor && norm(String(aColor.option || '')) === wantColor
                                        }
                                        return ok
                                    })
                                    if (match?.id) variationId = String(match.id)
                                }
                            }
                        }
                    }
                } catch (err) {
                    // ignore; fallback to local id
                }
            }

            const params = new URLSearchParams()
            params.set('productId', String(wcProductId))
            params.set('quantity', String(quantity))
            if (variationId) params.set('variationId', variationId)
            if (activeSize) params.set('size', activeSize)
            if (activeColor) params.set('color', activeColor)
            
            // 检查是否在浏览器环境中
            if (typeof window !== 'undefined') {
                window.location.href = `/checkout?${params.toString()}`
            }
        } catch (error) {
            console.error('Error processing buy now:', error);
        }
    };


    return (
        <>
            <div className="product-detail sale">
                <div className="featured-product underwear md:py-20 py-10">
                    <div className="container flex justify-between gap-y-6 flex-wrap">
                        <div className="list-img md:w-1/2 md:pr-[45px] w-full">
                            <Swiper
                                slidesPerView={1}
                                spaceBetween={0}
                                thumbs={{ swiper: thumbsSwiper }}
                                modules={[Thumbs]}
                                className="mySwiper2 rounded-2xl overflow-hidden"
                            >
                                {productMain && productMain.images && productMain.images.map((item, index) => (
                                    <SwiperSlide
                                        key={index}
                                        onClick={() => {
                                            swiperRef.current?.slideTo(index);
                                            setOpenPopupImg(true)
                                        }}
                                    >
                                        <BlurImage
                                            src={item}
                                            width={1000}
                                            height={1000}
                                            alt='prd-img'
                                            className='w-full aspect-[3/4] object-cover'
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 720px"
                                            quality={75}
                                        />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                            <Swiper
                                onSwiper={handleSwiper}
                                spaceBetween={0}
                                slidesPerView={4}
                                freeMode={true}
                                watchSlidesProgress={true}
                                modules={[Navigation, Thumbs]}
                                className="mySwiper style-rectangle"
                            >
                                {productMain && productMain.images && productMain.images.map((item, index) => (
                                    <SwiperSlide key={index}>
                                        <BlurImage
                                            src={item}
                                            width={1000}
                                            height={1300}
                                            alt='prd-img'
                                            className='w-full aspect-[3/4] object-cover rounded-xl'
                                            sizes="(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 160px"
                                            quality={70}
                                        />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                            <div className={`popup-img ${openPopupImg ? 'open' : ''}`}>
                                <span
                                    className="close-popup-btn absolute top-4 right-4 z-[2] cursor-pointer"
                                    onClick={() => {
                                        setOpenPopupImg(false)
                                    }}
                                >
                                    <Icon.X className="text-3xl text-white" />
                                </span>
                                <Swiper
                                    spaceBetween={0}
                                    slidesPerView={1}
                                    modules={[Navigation, Thumbs]}
                                    navigation={true}
                                    loop={true}
                                    className="popupSwiper"
                                    onSwiper={(swiper) => {
                                        swiperRef.current = swiper
                                    }}
                                >
                                    {productMain && productMain.images && productMain.images.map((item, index) => (
                                        <SwiperSlide
                                            key={index}
                                            onClick={() => {
                                                setOpenPopupImg(false)
                                            }}
                                        >
                                            <BlurImage
                                                src={item}
                                                width={1000}
                                                height={1000}
                                                alt='prd-img'
                                                className='w-full aspect-[3/4] object-cover rounded-xl'
                                                onClick={(e) => {
                                                    e.stopPropagation(); // prevent
                                                }}
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 800px"
                                                quality={75}
                                            />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>
                        <div className="product-infor md:w-1/2 w-full lg:pl-[15px] md:pl-2">
                            <div className="flex justify-between">
                                <div>
                                    <div className="caption2 text-secondary font-semibold uppercase">{productMain ? (hydrated ? productMain.type : 'general') : ''}</div>
                                    <div className="heading4 mt-1">{productMain ? productMain.name : ''}</div>
                                </div>
                                <div
                                    className={`add-wishlist-btn w-12 h-12 flex items-center justify-center border border-line cursor-pointer rounded-xl duration-300 hover:bg-black hover:text-white ${productMain && wishlistState.wishlistArray.some(item => item.id === productMain.id) ? 'active' : ''}`}
                                    onClick={handleAddToWishlist}
                                >
                                    {productMain && wishlistState.wishlistArray.some(item => item.id === productMain.id) ? (
                                        <>
                                            <Icon.Heart size={24} weight='fill' className='text-white' />
                                        </>
                                    ) : (
                                        <>
                                            <Icon.Heart size={24} />
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap mt-5 pb-6 border-b border-line">
                                <div className="product-price heading5">{productMain ? formatPrice(productMain.price) : ''}</div>
                                <div className='w-px h-4 bg-line'></div>
                                <div className="product-origin-price font-normal text-secondary2"><del>{productMain ? formatPrice(productMain.originPrice) : ''}</del></div>
                                {productMain && productMain.originPrice && hydrated && (
                                    <div className="product-sale caption2 font-semibold bg-green px-3 py-0.5 inline-block rounded-full">
                                        -{percentSale}%
                                    </div>
                                )}
                                <div className='desc text-secondary mt-3 rich-content'>
                                    <p>Our premium quality products are designed to exceed your expectations. Crafted with attention to detail and using the finest materials, each item in our collection offers exceptional value and durability.</p>
                                    <p>Experience the difference that quality makes with our carefully curated selection of products that combine style, functionality, and reliability.</p>
                                </div>
                            </div>
                            <div className="list-action mt-6">
                                
                                <div className="text-title mt-5">Quantity:</div>
                                <div className="choose-quantity flex items-center lg:justify-between gap-5 gap-y-3 mt-3">
                                    <div className="quantity-block md:p-3 max-md:py-1.5 max-md:px-3 flex items-center justify-between rounded-lg border border-line sm:w-[180px] w-[120px] flex-shrink-0">
                                        <Icon.Minus
                                            size={20}
                                            onClick={handleDecreaseQuantity}
                                            className={`minus ${productMain && productMain.quantityPurchase === 1 ? 'disabled' : ''} cursor-pointer`}
                                        />
                                        <div className="body1 font-semibold">{productMain ? (productMain.quantityPurchase || 1) : 1}</div>
                                        <Icon.Plus
                                            size={20}
                                            onClick={handleIncreaseQuantity}
                                            className='cursor-pointer'
                                        />
                                    </div>
                                    <div onClick={handleAddToCart} className="button-main w-full text-center bg-white text-black border border-black">Add To Cart</div>
                                </div>
                                <div className="button-block mt-5">
                                    <div className="button-main w-full text-center" onClick={handleBuyNow}>Buy It Now</div>
                                </div>
                                <div className="flex items-center lg:gap-20 gap-8 mt-5 pb-6 border-b border-line">
                                    <div className="compare flex items-center gap-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleAddToCompare() }}>
                                        <div className="compare-btn md:w-12 md:h-12 w-10 h-10 flex items-center justify-center border border-line cursor-pointer rounded-xl duration-300 hover:bg-black hover:text-white">
                                            <Icon.ArrowsCounterClockwise className='heading6' />
                                        </div>
                                        <span>Compare</span>
                                    </div>
                                    <div className="share flex items-center gap-3 cursor-pointer">
                                        <div className="share-btn md:w-12 md:h-12 w-10 h-10 flex items-center justify-center border border-line cursor-pointer rounded-xl duration-300 hover:bg-black hover:text-white">
                                            <Icon.ShareNetwork weight='fill' className='heading6' />
                                        </div>
                                        <span>Share Products</span>
                                    </div>
                                </div><div className="more-infor mt-6">
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <div className="flex items-center gap-1">
                                            <Icon.ArrowClockwise className='body1' />
                                            <div className="text-title">Delivery & Return</div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Icon.Question className='body1' />
                                            <div className="text-title">Ask A Question</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 mt-3">
                                        <Icon.Timer className='body1' />
                                        <div className="text-title">Estimated Delivery:</div>
                                        <div className="text-secondary">14 January - 18 January</div>
                                    </div>
                                    <div className="flex items-center gap-1 mt-3">
                                        <Icon.Eye className='body1' />
                                        <div className="text-title">{viewCount}</div>
                                        <div className="text-secondary">people viewing this product right now!</div>
                                    </div>
                                    <div className="flex items-center gap-1 mt-3">
                                        <div className="text-title">SKU:</div>
                                        <div className="text-secondary">53453412</div>
                                    </div>
                                    <div className="flex items-center gap-1 mt-3">
                                        <div className="text-title">Categories:</div>
                                        <div className="text-secondary">{productMain ? categoryDisplay : ''}</div>
                                    </div>
                                    <div className="flex items-center gap-1 mt-3">
                                        <div className="text-title">Tag:</div>
                                        <div className="text-secondary">{productMain ? (hydrated ? productMain.type || '' : 'general') : ''}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="desc-tab md:pb-20 pb-10">
                    <div className="container">
                        <div className="flex items-center justify-center w-full">
                            <div className="menu-tab flex items-center md:gap-[60px] gap-8">
                                <div
                                    className="tab-item heading5 has-line-before text-black duration-300 active"
                                >
                                    Description
                                </div>
                            </div>
                        </div>
                        <div className="desc-block mt-8">
                            <div className="desc-item description open">
                                <div className="product-description-wrapper">
                                    {/* 第一部分：产品介绍 (由 Markdown 生成) */}
                                    <div className="product-intro-section">
                                        <div className="intro-content-container">
                                            <div className="china-direct-badge">🎪 CHINA DIRECT</div>
                                            {markdownContent && hydrated && ( // 只有当有内容时才渲染
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {markdownContent}
                                                </ReactMarkdown>
                                            )}
                                            {!markdownContent && (
                                                <div style={{color: 'red', padding: '10px', border: '1px dashed red', margin: '10px 0'}}>
                                                    Debug: Markdown content is empty or undefined
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* 第二部分：图片画廊 (由 ACF Repeater 生成) */}
                                    {imageGallery && imageGallery.length > 0 && ( // 只有当有图片时才渲染
                                        <div className="product-gallery-section">
                                            <div className="gallery-title-container">
                                                <div className="gallery-badge">📸 GALLERY</div>
                                                <h2>CUTE MOMENTS</h2>
                                                <p className="gallery-subtitle">✨ Explore Our Collection ✨</p>
                                            </div>
                                            <div className="image-grid">
                                                {imageGallery.map((image, index) => (
                                                    <div key={index} className="grid-item">
                                                        <BlurImage
                                                            src={image.url}
                                                            width={500}
                                                            height={500}
                                                            alt={image.alt || `Gallery image ${index + 1}`}
                                                            className='w-full aspect-square object-cover rounded-lg'
                                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                                                            quality={75}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {/* 第三部分：固定内容 (Why Us & CTA) */}
                                    <div className="why-us-section">
                                        <div className="why-us-container">
                                            <div className="why-us-title">
                                                <h2>WHY US?</h2>
                                                <div className="title-decorator">
                                                    <div className="line"></div>
                                                    <span>🌟</span>
                                                    <div className="line"></div>
                                                </div>
                                            </div>
                                            <div className="advantage-cards">
                                                {/* 卡片1 */}
                                                <div className="advantage-card">
                                                    <div className="card-icon-bg" style={{'--icon-bg-color': '#FF6B9D'} as React.CSSProperties}>🏭</div>
                                                    <h3>Original Source</h3>
                                                    <p>We are the original manufacturer! Direct from our workshop to your hands with guaranteed authenticity and best prices! 🏷️</p>
                                                </div>
                                                {/* 卡片2 */}
                                                <div className="advantage-card">
                                                     <div className="card-icon-bg" style={{'--icon-bg-color': '#6BC5FF'} as React.CSSProperties}>✨</div>
                                                    <h3>Trendy Designs</h3>
                                                    <p>Stay ahead with the latest pop culture trends! Our designers create the most sought-after collectibles! 🎭</p>
                                                </div>
                                                {/* 卡片3 */}
                                                <div className="advantage-card">
                                                     <div className="card-icon-bg" style={{'--icon-bg-color': '#FFB627'} as React.CSSProperties}>💎</div>
                                                    <h3>Premium Quality</h3>
                                                    <p>Every piece is carefully crafted with love and attention to detail. Museum-quality collectibles! 💖</p>
                                                </div>
                                            </div>
                                            <div className="cta-box">
                                                <div className="cta-emoji">🎉</div>
                                                <h3>Interested in wholesale pricing?</h3>
                                                <p>Start your Art toys collection today! 🌈</p>
                                                <a className="cta-button">Contact us today!</a>
                                                <div className="cta-footer">✨ drop us a line for a quote.✨</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="related-product md:py-20 py-10">
                    <div className="container">
                        <div className="heading3 text-center">Related Products</div>
                        <div className="list-product hide-product-sold  grid lg:grid-cols-4 grid-cols-2 md:gap-[30px] gap-5 md:mt-10 mt-6">
                            {finalRelatedProducts.map((item, index) => (
                                <Product key={index} data={item} type='grid' style='style-1' />
                            ))}
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}

export default Sale
