'use client'

import React, { useState, useEffect, useMemo, startTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import CategoryTabs from './CategoryTabs'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { ProductType } from '@/type/ProductType'
import Product from '../Product/Product';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css'
import HandlePagination from '../Other/HandlePagination';
import ActiveFiltersBar from './ActiveFiltersBar'
import { useCategories } from '@/hooks/useCategories'
import VirtualizedProductList from './VirtualizedProductList'
import { formatPrice } from '@/utils/priceFormat'

interface Props {
    data: Array<ProductType>
    productPerPage: number
    dataType: string | null | undefined
    gender: string | null
    category: string | null
    initialCategories?: any[]
    initialBrands?: any[]
    isEmptyState?: boolean
    emptyCategoryName?: string
    paginationMeta?: {
        total?: number
        totalPages?: number
        page?: number
        per_page?: number
        count?: number
    }
}

const ShopBreadCrumb1: React.FC<Props> = ({ data, productPerPage, dataType, gender, category, initialCategories, initialBrands, isEmptyState, emptyCategoryName, paginationMeta }) => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [showOnlySale, setShowOnlySale] = useState(false)
    const [sortOption, setSortOption] = useState('');
    const [type, setType] = useState<string | null | undefined>(dataType)
    const [size, setSize] = useState<string | null>()
    const [color, setColor] = useState<string | null>()
    const [brand, setBrand] = useState<string | null>()
    const [mounted, setMounted] = useState(false)
    const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set())
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
    const [priorityCount, setPriorityCount] = useState<number>(() => {
        // 始终返回默认值避免水合错误，在useEffect中再动态设置
        return 9;
    })
    useEffect(() => { setMounted(true) }, [])

    // 获取类目真实产品数量
    useEffect(() => {
        const fetchCategoryCounts = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/woocommerce/categories-count`)
                if (response.ok) {
                    const counts = await response.json()
                    setCategoryCounts(counts)
                }
            } catch (error) {
                console.error('Failed to fetch category counts:', error)
            }
        }

        fetchCategoryCounts()
    }, [])

    useEffect(() => {
        // 检查是否在浏览器环境中
        if (typeof window === 'undefined') return;
        
        const mq = window.matchMedia('(min-width: 1024px)')
        const compute = () => setPriorityCount(mq.matches ? 9 : 6)
        compute()
        mq.addEventListener('change', compute)
        return () => { mq.removeEventListener('change', compute) }
    }, [])

    // Dynamic price bounds derived from data
    const priceBounds = useMemo(() => {
        const prices = (data || [])
            .map(p => Number(p.price))
            .filter(n => Number.isFinite(n) && n >= 0)
        let min = prices.length ? Math.floor(Math.min(...prices)) : 0
        let max = prices.length ? Math.ceil(Math.max(...prices)) : 100
        if (min === max) max = min + 1
        return { min, max }
    }, [data])

    const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: priceBounds.min, max: priceBounds.max });
    const cats = useCategories()
    const catsArr = useMemo(() => Array.isArray(cats) ? cats : [], [cats])
    const byId = useMemo(() => new Map<number, any>(catsArr.map(c => [c.id, c])), [catsArr])
    const bySlug = useMemo(() => new Map<string, any>(catsArr.map(c => [String(c.slug).toLowerCase(), c])), [catsArr])
    const childrenByParent = useMemo(() => {
        const m = new Map<number, any[]>()
        for (const c of catsArr) {
            const arr = m.get(c.parent) || []
            arr.push(c)
            m.set(c.parent, arr)
        }
        return m
    }, [catsArr])
    const [currentPage, setCurrentPage] = useState(0);
    const productsPerPage = productPerPage;
    const offset = currentPage * productsPerPage;
    const currentCategorySlug = searchParams.get('category') || category || null





    const allowedCategorySlugs = useMemo(() => {
        const slug = currentCategorySlug
        if (!slug) return null
        const catsArrLocal = Array.isArray(cats) ? cats : []
        const byIdLocal = new Map<number, any>(catsArrLocal.map(c => [c.id, c]))
        const bySlugLocal = new Map<string, any>(catsArrLocal.map(c => [String(c.slug).toLowerCase(), c]))
        const childrenByParentLocal = new Map<number, any[]>()
        for (const c of catsArrLocal) {
            const arr = childrenByParentLocal.get(c.parent) || []
            arr.push(c)
            childrenByParentLocal.set(c.parent, arr)
        }
        const root = bySlugLocal.get(String(slug).toLowerCase())
        const set = new Set<string>()
        const walk = (node: any) => {
            if (!node) return
            const s = String(node.slug || '').toLowerCase()
            if (s) set.add(s)
            const kids = childrenByParentLocal.get(node.id) || []
            for (const k of kids) walk(k)
        }
        walk(root)
        if (!set.size) set.add(String(slug).toLowerCase())
        return set
    }, [cats, currentCategorySlug])

    useEffect(() => {
        if (!mounted) return
        if (!currentCategorySlug) return
        const node = bySlug.get(String(currentCategorySlug).toLowerCase())
        if (!node) return
        const next = new Set(expandedCats)
        let cur = node
        while (cur && cur.parent) {
            next.add(cur.parent)
            cur = byId.get(cur.parent)
        }
        setExpandedCats(next)
    }, [mounted, currentCategorySlug, bySlug, byId])

    // Keep local state in sync with URL changes
    useEffect(() => {
        const onSaleParam = (searchParams.get('on_sale') ?? '').toLowerCase()
        setShowOnlySale(onSaleParam === 'true')
    }, [searchParams])

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
        startTransition(() => {
            router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false })
        })
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
    }

    const handleSortChange = (option: string) => {
        setSortOption(option);
        setCurrentPage(0);
    };

    const handleType = (nextType: string | null) => {
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

    const handleSize = (size: string) => {
        setSize((prevSize) => (prevSize === size ? null : size))
        setCurrentPage(0);
    }

    const handlePriceChange = (values: number | number[]) => {
        if (Array.isArray(values)) {
            const next = { min: values[0], max: values[1] }
            setPriceRange(next)
        }
    }

    const handlePriceAfterChange = (values: number | number[]) => {
        if (Array.isArray(values)) {
            const next = { min: values[0], max: values[1] }
            setCurrentPage(0)
            updateUrlParams(qs => {
                qs.set('price_min', String(next.min))
                qs.set('price_max', String(next.max))
            })
        }
    }

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


    // 简化客户端过滤逻辑，因为大部分工作已移至服务端
    const filteredData = useMemo(() => {
        // 数据已经在服务端过滤，这里只做基本的客户端过滤
        return (data || [])
            .filter(product => {
                // 确保产品有图片
                const hasImage = (Array.isArray((product as any).images) && (product as any).images.length > 0)
                    || (Array.isArray((product as any).thumbImage) && (product as any).thumbImage.length > 0)
                
                // 只保留有图片的产品
                return hasImage
            })
            // 移除复杂的服务端筛选逻辑，这些已在API端处理
    }, [data]);

    // Sort the filtered data using useMemo for performance optimization
    const sortedData = useMemo(() => {
        const onlyRealImages = filteredData.filter(p => Array.isArray(p.images) && p.images.length > 0 && (p.imageStatus ?? 'mapped') === 'mapped')
        const base = onlyRealImages.length > 0 ? onlyRealImages : filteredData
        const sorted = [...base];
        // Primary: items with images first
        sorted.sort((a, b) => {
            const ai = Array.isArray(a.images) && a.images.length > 0 ? 1 : 0;
            const bi = Array.isArray(b.images) && b.images.length > 0 ? 1 : 0;
            return bi - ai;
        })
        // Secondary: apply user-selected sort
        switch (sortOption) {
            case 'soldQuantityHighToLow':
                sorted.sort((a, b) => (b.sold - a.sold));
                break;
            case 'discountHighToLow':
                sorted.sort((a, b) => (
                    (Math.floor(100 - ((b.price / b.originPrice) * 100))) - (Math.floor(100 - ((a.price / a.originPrice) * 100)))
                ));
                break;
            case 'priceHighToLow':
                sorted.sort((a, b) => (b.price - a.price));
                break;
            case 'priceLowToHigh':
                sorted.sort((a, b) => (a.price - b.price));
                break;
            default:
                break;
        }
        return sorted;
    }, [filteredData, sortOption])

    const hasNoData = filteredData.length === 0
    const effectiveFilteredData = hasNoData ? [{
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
    }] : filteredData

    const totalProducts = hasNoData ? 0 : filteredData.length
    const selectedType = type
    const selectedSize = size
    const selectedColor = color
    const selectedBrand = brand


    // Find page number base on sortedData (use sorted data for pagination)
    const dataForPaging = hasNoData ? [] : sortedData

    // Use paginationMeta from API if available, otherwise fall back to client-side calculation
    const pageCount = paginationMeta?.totalPages || Math.ceil(filteredData.length / productsPerPage);

    // 根据页数安全调整当前页，避免在渲染阶段直接 setState 导致循环渲染
    useEffect(() => {
        if (pageCount === 0 && currentPage !== 0) {
            setCurrentPage(0)
        } else if (currentPage >= pageCount && pageCount > 0) {
            setCurrentPage(0)
        }
    }, [pageCount, currentPage])

    // Get product data for current page
    let currentProducts: ProductType[];

    if (dataForPaging.length > 0) {
        currentProducts = dataForPaging.slice(offset, offset + productsPerPage);
    } else {
        currentProducts = []
    }

    const handlePageChange = (selected: number) => {
        setCurrentPage(selected);
    };

    const handleClearAll = () => {
        dataType = null
        setShowOnlySale(false);
        setSortOption('');
        setType(null);
        setSize(null);
        setColor(null);
        setBrand(null);
        setPriceRange({ min: 0, max: 100 });
        setCurrentPage(0);
        handleType(null)
    };

    const resolvedCategoryName = useMemo(() => {
        const slug = currentCategorySlug
        if (!slug) return null
        const found = Array.isArray(cats)
            ? cats.find((c: any) => String(c.slug || '').toLowerCase() === String(slug).toLowerCase())
            : null
        return found?.name || String(slug)
    }, [cats, currentCategorySlug])

    const displayTitle = resolvedCategoryName ?? (dataType === null ? 'Shop' : dataType)

    // URL filter helpers no longer needed here; ActiveFiltersBar manages URL filters centrally

    return (
        <>
            <div className="breadcrumb-block style-img">
                <div className="breadcrumb-main bg-linear overflow-hidden">
                    <div className="container lg:pt-20 pt-12 pb-10 relative">
                        <div className="main-content w-full h-full flex flex-col items-center justify-start relative z-[1]">
                            <div className="text-content">
                                <div className="heading2 text-center">{displayTitle}</div>
                                {currentCategorySlug ? (
                                    <div className="link flex items-center justify-center gap-1 caption1 mt-3">
                                        <Link href={'/'}>Homepage</Link>
                                        <Icon.CaretRight size={14} className='text-secondary2' />
                                        <Link href={'/shop'}>Shop</Link>
                                        <Icon.CaretRight size={14} className='text-secondary2' />
                                        <div className='text-secondary2 capitalize'>{displayTitle}</div>
                                    </div>
                                ) : null}
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
                                    {(() => {
                                        // 使用真实类目数量计算总数（包括子类目）
                                        const totalCount = (id: number): number => {
                                            const node = byId.get(id)
                                            const self = node ? (categoryCounts[String(node.slug).toLowerCase()] || 0) : 0
                                            const children = childrenByParent.get(id) || []
                                            let sum = self
                                            for (const ch of children) sum += totalCount(ch.id)
                                            return sum
                                        }
                                        
                                        const toggle = (id: number) => {
                                            const next = new Set(expandedCats)
                                            if (next.has(id)) next.delete(id)
                                            else next.add(id)
                                            setExpandedCats(next)
                                        }
                                        const roots = catsArr.filter(c => c.parent === 0)
                                        const renderNode = (node: any, level: number) => {
                                            const slug = node.slug
                                            const name = node.name
                                            const kids = childrenByParent.get(node.id) || []
                                            const cnt = mounted ? totalCount(node.id) : 0
                                            const isActive = currentCategorySlug === slug
                                            const hasKids = kids.length > 0
                                            const isExpanded = expandedCats.has(node.id)
                                            return (
                                                <div key={slug} className="w-full">
                                                    <div className={`item flex items-center justify-between cursor-pointer ${isActive ? 'active' : ''} py-1.5 px-2 rounded-lg hover:bg-linear`}>
                                                        <div className="flex items-center gap-2">
                                                            {hasKids && (
                                                                <span className="w-5 h-5 flex items-center justify-center rounded hover:bg-line" onClick={() => toggle(node.id)}>
                                                                    {isExpanded ? <Icon.CaretDown size={14} /> : <Icon.CaretRight size={14} />}
                                                                </span>
                                                            )}
                                                            <span className={`text-secondary has-line-before hover:text-black capitalize pl-${level * 4}`} onClick={() => {
                                                                updateUrlParams(qs => {
                                                                    if (currentCategorySlug === slug) qs.delete('category')
                                                                    else qs.set('category', slug)
                                                                })
                                                                setCurrentPage(0)
                                                            }}>
                                                                {(() => {
                                                                    const n = (() => { try { return decodeURIComponent(String(name)) } catch { return String(name) } })()
                                                                    return level > 0 ? `- ${n}` : n
                                                                })()}
                                                            </span>
                                                        </div>
                                                        <div className='text-secondary2' suppressHydrationWarning>
                                                            ({cnt})
                                                        </div>
                                                    </div>
                                                    {hasKids && isExpanded && (
                                                        <div className="mt-1">
                                                            {kids.map(ch => renderNode(ch, level + 1))}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        }
                                        return roots.map(r => renderNode(r, 0))
                                    })()}
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
                                        <div className='price-min'>{formatPrice(priceRange.min)}</div>
                                    </div>
                                    <div className="min flex items-center gap-1">
                                        <div>Max price:</div>
                                        <div className='price-max'>{formatPrice(priceRange.max)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="list-product-block lg:w-3/4 md:w-2/3 w-full md:pl-3">
                            <div className="filter-heading flex items-center justify-between gap-5 flex-wrap">
                                <div className="left flex has-line items-center flex-wrap gap-5">
                                    <div className="choose-layout flex items-center gap-2">
                                        <div className="item three-col w-8 h-8 border border-line rounded flex items-center justify-center cursor-pointer active">
                                            <div className='flex items-center gap-0.5'>
                                                <span className='w-[3px] h-4 bg-secondary2 rounded-sm'></span>
                                                <span className='w-[3px] h-4 bg-secondary2 rounded-sm'></span>
                                                <span className='w-[3px] h-4 bg-secondary2 rounded-sm'></span>
                                            </div>
                                        </div>
                                        {/* Removed sidebar-list link */}
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
                                {/* Unified URL-driven tags (category, sale, price, type, brand) */}
                                <ActiveFiltersBar
                                    includeKeys={["category","on_sale","price_min","price_max","type","brand"]}
                                    onClearAll={() => {
                                        // clear local non-URL filters
                                        setSize(null)
                                        setColor(null)
                                    }}
                                />
                                {(selectedSize || selectedColor) && (
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
                                )}
                            </div>

                            {(totalProducts > 50 && !(filteredData.length === 1 && filteredData[0]?.id === 'no-data')) ? (
                                <div className="list-product hide-product-sold mt-7">
                                    <VirtualizedProductList 
                                        products={currentProducts} 
                                        type="grid" 
                                        columnCount={3}
                                        rowHeight={500}
                                        gap={20}
                                        disableBlur
                                        disablePrefetchDetail
                                        startIndex={priorityCount}
                                    />
                                </div>
                            ) : (
                                <div className="list-product hide-product-sold grid lg:grid-cols-3 grid-cols-2 sm:gap-[30px] gap-[20px] mt-7">
                                    {currentProducts.map((item, index) => (
                                        item.id === 'no-data' ? (
                                            <div key={item.id} className="no-data-product">
                                                {isEmptyState && emptyCategoryName 
                                                    ? `该分类"${emptyCategoryName}"下暂无商品` 
                                                    : "No products match the selected criteria."
                                                }
                                            </div>
                                        ) : (
                                            <Product key={item.id} data={item} type='grid' priority={index < priorityCount} disableBlur disablePrefetchDetail />
                                        )
                                    ))}
                                </div>
                            )}

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

export default ShopBreadCrumb1