'use client'

import React, { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
const ReactWindowList = dynamic(() => import('react-window').then(m => m.FixedSizeList), { ssr: false })
import Link from 'next/link'
import CategoryTabs from './CategoryTabs'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { ProductType } from '@/type/ProductType'
import Product from '../Product/Product';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css'
import HandlePagination from '../Other/HandlePagination';
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import ActiveFiltersBar from './ActiveFiltersBar'

interface Props {
    data: Array<ProductType>;
    productPerPage: number
    dataType: string | null
    // 可配置的虚拟滚动阈值：当当前页渲染条目数大于该值时启用虚拟滚动
    virtualThreshold?: number
    initialCategories?: any[]
}

const ShopSidebarList: React.FC<Props> = ({ data, productPerPage, dataType, virtualThreshold = 40, initialCategories }) => {
    const [type, setType] = useState<string | null>(dataType)
    const [showOnlySale, setShowOnlySale] = useState(false)
    const [sortOption, setSortOption] = useState('');
    const [size, setSize] = useState<string | null>()
    const [color, setColor] = useState<string | null>()
    const [brand, setBrand] = useState<string | null>()
    const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 100 });
    const [currentPage, setCurrentPage] = useState(0);
    const [priorityCount, setPriorityCount] = useState<number>(() => {
        // 始终返回默认值避免水合错误，在useEffect中再动态设置
        return 9;
    });
    const [typeCounts, setTypeCounts] = useState<Record<string, number>>({})
    const productsPerPage = productPerPage;
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const offset = currentPage * productsPerPage;

    useEffect(() => {
        // 检查是否在浏览器环境中
        if (typeof window === 'undefined') return;
        
        const mq = window.matchMedia('(min-width: 1024px)')
        const compute = () => setPriorityCount(mq.matches ? 9 : 6)
        compute()
        mq.addEventListener('change', compute)
        return () => { mq.removeEventListener('change', compute) }
    }, [])

    // 获取产品类型的真实数量（从全站数据）
    useEffect(() => {
        const fetchTypeCounts = async () => {
            try {
                // 获取所有产品来计算真实的产品类型数量
                const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/woocommerce/products?per_page=100&_fields=type`)
                if (response.ok) {
                    const products = await response.json()
                    const counts = products.reduce((acc: Record<string, number>, product: any) => {
                        const productType = product.type || 'uncategorized'
                        acc[productType] = (acc[productType] || 0) + 1
                        return acc
                    }, {})
                    setTypeCounts(counts)
                }
            } catch (error) {
                console.error('Failed to fetch type counts:', error)
            }
        }

        fetchTypeCounts()
    }, [])

    const handleType = (nextType: string) => {
        setType(prevType => {
            const next = prevType === nextType ? null : nextType
            updateUrlParams(qs => {
                if (next) qs.set('type', String(next))
                else qs.delete('type')
            })
            return next
        })
        setCurrentPage(0);
    }

    // Sync local state from URL params on mount
    // Dynamic price bounds based on data
    const priceBounds = useMemo(() => {
        const prices = (data || [])
            .map(p => Number(p.price))
            .filter(n => Number.isFinite(n) && n >= 0)
        let min = prices.length ? Math.floor(Math.min(...prices)) : 0
        let max = prices.length ? Math.ceil(Math.max(...prices)) : 100
        if (min === max) max = min + 1
        return { min, max }
    }, [data])

    // Sync on_sale to local state whenever URL changes
    useEffect(() => {
        const onSaleParam = (searchParams.get('on_sale') ?? '').toLowerCase()
        setShowOnlySale(onSaleParam === 'true')
    }, [searchParams])

    // Sync price range from URL whenever URL or bounds change
    useEffect(() => {
        const pm = searchParams.get('price_min')
        const px = searchParams.get('price_max')
        if (pm || px) {
            const min = pm ? Math.max(priceBounds.min, parseInt(pm, 10) || priceBounds.min) : priceBounds.min
            const max = px ? Math.min(priceBounds.max, Math.max(min, parseInt(px, 10) || min)) : priceBounds.max
            setPriceRange({ min, max })
        } else {
            setPriceRange(priceBounds)
        }
    }, [searchParams, priceBounds])

    // Keep local type/brand in sync with URL
    useEffect(() => {
        const urlType = searchParams.get('type')
        const urlBrand = searchParams.get('brand')
        setType(urlType || null)
        setBrand(urlBrand || null)
    }, [searchParams])

    const updateUrlParams = (mutate: (qs: URLSearchParams) => void) => {
        const qs = new URLSearchParams(searchParams.toString())
        mutate(qs)
        const q = qs.toString()
        router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false })
    }

    const handleShowOnlySale = () => {
        setShowOnlySale(prev => {
            const next = !prev
            updateUrlParams(qs => {
                if (next) qs.set('on_sale', 'true')
                else qs.delete('on_sale')
            })
            return next
        })
        setCurrentPage(0);
    }

    const handleSortChange = (option: string) => {
        setSortOption(option);
        setCurrentPage(0);
    };

    const handleSize = (size: string) => {
        setSize((prevSize) => (prevSize === size ? null : size))
        setCurrentPage(0);
    }

    const handlePriceChange = (values: number | number[]) => {
        if (Array.isArray(values)) {
            const next = { min: values[0], max: values[1] }
            setPriceRange(next)
        }
    };

    const handlePriceAfterChange = (values: number | number[]) => {
        if (Array.isArray(values)) {
            const next = { min: values[0], max: values[1] }
            setCurrentPage(0)
            updateUrlParams(qs => {
                qs.set('price_min', String(next.min))
                qs.set('price_max', String(next.max))
            })
        }
    };

    const handleColor = (color: string) => {
        setColor((prevColor) => (prevColor === color ? null : color))
        setCurrentPage(0);
    }

    const handleBrand = (nextBrand: string) => {
        setBrand(prevBrand => {
            const next = prevBrand === nextBrand ? null : nextBrand
            updateUrlParams(qs => {
                if (next) qs.set('brand', String(next))
                else qs.delete('brand')
            })
            return next
        })
        setCurrentPage(0);
    }


    // 本地筛选：按类型、是否促销、尺寸、颜色、品牌与价格范围过滤
    let filteredData = data.filter((item) => {
        const matchesType = !type || ((item.type || '').toLowerCase() === type.toLowerCase());
        const matchesSale = !showOnlySale || !!item.sale;
        const matchesSize = !size || (Array.isArray(item.sizes) && item.sizes.includes(size));
        const matchesColor = !color || (Array.isArray(item.variation) && item.variation.some(v => (v.color || '').toLowerCase() === color.toLowerCase()));
        const matchesBrand = !brand || ((item.brand || '').toLowerCase() === brand.toLowerCase());
        const matchesPrice = typeof item.price === 'number' && item.price >= priceRange.min && item.price <= priceRange.max;
        return matchesType && matchesSale && matchesSize && matchesColor && matchesBrand && matchesPrice;
    })

    // 排序：在过滤后的结果上进行排序
    let sortedData = [...filteredData];

    if (sortOption === 'soldQuantityHighToLow') {
        sortedData.sort((a, b) => b.sold - a.sold)
    }

    if (sortOption === 'discountHighToLow') {
        sortedData.sort((a, b) => (
            (Math.floor(100 - ((b.price / b.originPrice) * 100))) - (Math.floor(100 - ((a.price / a.originPrice) * 100)))
        ))
    }

    if (sortOption === 'priceHighToLow') {
        sortedData.sort((a, b) => b.price - a.price)
    }

    if (sortOption === 'priceLowToHigh') {
        sortedData.sort((a, b) => a.price - b.price)
    }

    filteredData = sortedData

    const totalProducts = filteredData.length
    const selectedType = type
    const selectedSize = size
    const selectedColor = color
    const selectedBrand = brand


    if (filteredData.length === 0) {
        filteredData = [{
            id: 'no-data',
            category: 'no-data',
            type: 'no-data',
            name: 'no-data',
            gender: 'no-data',
            new: false,
            sale: false,
            rate: 0,
            price: 0,
            originPrice: 0,
            brand: 'no-data',
            sold: 0,
            quantity: 0,
            quantityPurchase: 0,
            sizes: [],
            variation: [],
            thumbImage: [],
            images: [],
            description: 'no-data',
            action: 'no-data',
            slug: 'no-data'
        }];
    }


    // Find page number base on filteredData
    const pageCount = Math.ceil(filteredData.length / productsPerPage);

    // If page number 0, set current page = 0
    if (pageCount === 0) {
        setCurrentPage(0);
    }

    // Get product data for current page
    let currentProducts: ProductType[];

    if (filteredData.length > 0) {
        currentProducts = filteredData.slice(offset, offset + productsPerPage);
    } else {
        currentProducts = []
    }

    const handlePageChange = (selected: number) => {
        setCurrentPage(selected);
    };

    const handleClearAll = () => {
        setType(null);
        setSize(null);
        setColor(null);
        setBrand(null);
        setPriceRange({ min: 0, max: 100 });
        setCurrentPage(0);
        dataType = null
        setType(dataType);
        // Also clear URL-based filters for consistency
        updateUrlParams(qs => {
            qs.delete('category')
            qs.delete('on_sale')
            qs.delete('price_min')
            qs.delete('price_max')
        })
    };

    return (
        <>
            <div className="breadcrumb-block style-img">
                <div className="breadcrumb-main bg-linear overflow-hidden">
                    <div className="container lg:pt-[134px] pt-24 pb-10 relative">
                        <div className="main-content w-full h-full flex flex-col items-center justify-center relative z-[1]">
                            <div className="text-content">
                                <div className="heading2 text-center">{dataType === null ? 'Shop' : dataType}</div>
                                {(() => {
                                    const currentCategorySlug = searchParams.get('category') || null
                                    return currentCategorySlug ? (
                                        <div className="link flex items-center justify-center gap-1 caption1 mt-3">
                                            <Link href={'/'}>Homepage</Link>
                                            <Icon.CaretRight size={14} className='text-secondary2' />
                                            <Link href={'/shop'}>Shop</Link>
                                            <Icon.CaretRight size={14} className='text-secondary2' />
                                            <div className='text-secondary2 capitalize'>{dataType === null ? 'Shop' : dataType}</div>
                                        </div>
                                    ) : null
                                })()}
                            </div>
                            <CategoryTabs initialCategories={initialCategories as any} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="shop-product breadcrumb1 lg:py-20 md:py-14 py-10">
                <div className="container">
                    <div className="flex max-md:flex-wrap max-md:flex-col-reverse gap-y-8">
                        <div className="sidebar lg:w-1/4 md:w-1/3 w-full md:pr-12">
                            <div className="filter-type pb-8 border-b border-line">
                                <div className="heading6">Products Type</div>
                                <div className="list-type mt-4">
                                    {['t-shirt', 'dress', 'top', 'swimwear', 'shirt', 'underwear', 'sets', 'accessories'].map((item, index) => (
                                        <div
                                            key={index}
                                            className={`item flex items-center justify-between cursor-pointer ${dataType === item ? 'active' : ''}`}
                                            onClick={() => handleType(item)}
                                        >
                                            <div className='text-secondary has-line-before hover:text-black capitalize'>{item}</div>
                                            <div className='text-secondary2'>
                                                ({typeCounts[item] || 0})
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="filter-price pb-8 border-b border-line mt-8">
                                <div className="heading6">Price Range</div>
                                <Slider
                                    range
                                    value={[priceRange.min, priceRange.max]}
                                    min={priceBounds.min}
                                    max={priceBounds.max}
                                    onChange={handlePriceChange}
                                    onAfterChange={handlePriceAfterChange}
                                    className='mt-5'
                                />
                                <div className="price-block flex items-center justify-between flex-wrap mt-4">
                                    <div className="min flex items-center gap-1">
                                        <div>Min price:</div>
                                        <div className='price-min'>$
                                            <span>{priceRange.min}</span>
                                        </div>
                                    </div>
                                    <div className="min flex items-center gap-1">
                                        <div>Max price:</div>
                                        <div className='price-max'>$
                                            <span>{priceRange.max}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="list-product-block lg:w-3/4 md:w-2/3 w-full md:pl-3">
                            <div className="filter-heading flex items-center justify-between gap-5 flex-wrap">
                                <div className="left flex has-line items-center flex-wrap gap-5">
                                    <div className="choose-layout flex items-center gap-2">
<Link href={'/shop'} className="item three-col w-8 h-8 border border-line rounded flex items-center justify-center cursor-pointer">
                                            <div className='flex items-center gap-0.5'>
                                                <span className='w-[3px] h-4 bg-secondary2 rounded-sm'></span>
                                                <span className='w-[3px] h-4 bg-secondary2 rounded-sm'></span>
                                                <span className='w-[3px] h-4 bg-secondary2 rounded-sm'></span>
                                            </div>
                                        </Link>
                                        <div className="item row w-8 h-8 border border-line rounded flex items-center justify-center cursor-pointer active">
                                            <div className='flex flex-col items-center gap-0.5'>
                                                <span className='w-4 h-[3px] bg-secondary2 rounded-sm'></span>
                                                <span className='w-4 h-[3px] bg-secondary2 rounded-sm'></span>
                                                <span className='w-4 h-[3px] bg-secondary2 rounded-sm'></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="check-sale flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="filterSale"
                                            id="filter-sale"
                                            className='border-line'
                                            onChange={handleShowOnlySale}
                                            checked={showOnlySale}
                                        />
                                        <label htmlFor="filter-sale" className='cation1 cursor-pointer'>Show only products on sale</label>
                                    </div>
                                </div>
                                <div className="right flex items-center gap-3">
                                    <label htmlFor='select-filter' className="caption1 capitalize">Sort by</label>
                                    <div className="select-block relative">
                                        <select
                                            id="select-filter"
                                            name="select-filter"
                                            className='caption1 py-2 pl-3 md:pr-20 pr-10 rounded-lg border border-line'
                                            onChange={(e) => { handleSortChange(e.target.value) }}
                                            defaultValue={'Sorting'}
                                        >
                                            <option value="Sorting" disabled>Sorting</option>
                                            <option value="soldQuantityHighToLow">Best Selling</option>
                                            <option value="discountHighToLow">Best Discount</option>
                                            <option value="priceHighToLow">Price High To Low</option>
                                            <option value="priceLowToHigh">Price Low To High</option>
                                        </select>
                                        <Icon.CaretDown size={12} className='absolute top-1/2 -translate-y-1/2 md:right-4 right-2' />
                                    </div>
                                </div>
                            </div>

                            <div className="list-filtered flex items-center gap-3 mt-4">
                                <div className="total-product">
                                    {totalProducts}
                                    <span className='text-secondary pl-1'>Products Found</span>
                                </div>
                                {/* URL-driven active filter tags (category, on_sale, price, type, brand) */}
                                <ActiveFiltersBar
                                    includeKeys={["category","on_sale","price_min","price_max","type","brand"]}
                                    onClearAll={() => {
                                        // clear local non-URL filters
                                        setSize(null)
                                        setColor(null)
                                    }}
                                />
                                {
                                    (selectedSize || selectedColor) && (
                                        <>
                                            <div className="list flex items-center gap-3">
                                                <div className='w-px h-4 bg-line'></div>
                                                {selectedSize && (
                                                    <div className="item flex items-center px-2 py-1 gap-1 bg-linear rounded-full capitalize" onClick={() => { setSize(null) }}>
                                                        <Icon.X className='cursor-pointer' />
                                                        <span>{selectedSize}</span>
                                                    </div>
                                                )}
                                                {selectedColor && (
                                                    <div className="item flex items-center px-2 py-1 gap-1 bg-linear rounded-full capitalize" onClick={() => { setColor(null) }}>
                                                        <Icon.X className='cursor-pointer' />
                                                        <span>{selectedColor}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )
                                }
                            </div>

                            <div className="list-product hide-product-sold mt-7">
                                {currentProducts.length === 0 ? (
                                    <div className="no-data-product">No products match the selected criteria.</div>
                                ) : (
                                    // 仅在条目数较大时启用虚拟滚动（阈值可配置），否则保持原有渲染以避免样式裁剪与双滚动条问题
                                    (currentProducts.length > virtualThreshold ? (
                                        <ReactWindowList
                                            height={800}
                                            width={'100%'}
                                            itemCount={currentProducts.length}
                                            itemSize={360}
                                        >
                                            {({ index, style }: { index: number; style: React.CSSProperties }) => {
                                                const item = currentProducts[index] as ProductType & { id: string }
                                                return (
                                                    <div style={style} key={item.id}>
                                                        {item.id === 'no-data' ? (
                                                            <div className="no-data-product">No products match the selected criteria.</div>
                                                        ) : (
                                                            <Product data={item} type='list' priority={index < priorityCount} disableBlur disablePrefetchDetail />
                                                        )}
                                                    </div>
                                                )
                                            }}
                                        </ReactWindowList>
                                    ) : (
                                        <div className="flex flex-col gap-8">
                                            {currentProducts.map((item, index) => (
                                                item.id === 'no-data' ? (
                                                    <div key={item.id} className="no-data-product">No products match the selected criteria.</div>
                                                ) : (
                                                    <Product key={item.id} data={item} type='list' priority={index < priorityCount} disableBlur disablePrefetchDetail />
                                                )
                                            ))}
                                        </div>
                                    ))
                                )}
                            </div>

                            {pageCount > 1 && (
                                <div className="list-pagination flex items-center md:mt-10 mt-7">
                                    <HandlePagination pageCount={pageCount} onPageChange={handlePageChange} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}

export default ShopSidebarList