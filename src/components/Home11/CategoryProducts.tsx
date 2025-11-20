'use client'

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react'
import BlurImage from '@/components/common/BlurImage'
import Link from 'next/link'
import Product from '../Product/Product'
import { ProductType } from '@/type/ProductType'
import { motion } from 'framer-motion'
import { fetchProductsByCategoryAndTag, fetchProductsByCategory } from '@/utils/productServiceArtToy'
import { fetchSubcategoryProductsWithFallback, fetchSubcategoryProducts, preloadSubcategoryProducts, prefetchAdjacentTabs } from '@/utils/productServiceSubcategory'
import { useProductList } from '@/hooks/useProductList'

interface Subcategory {
  id: number;
  name: string;
  slug: string;
}

interface CategoryProductsProps {
  // 类别配置
  title: string; // 组件标题，如 "Art Toys Collection" 或 "Men's Fashion"
  categorySlug: string; // 主类别 slug，如 "art-toy" 或 "fashion"
  tag?: string; // 产品标签，如 "home"
  parentCategorySlug?: string; // 父类别 slug，用于子类别回退，默认为 categorySlug
  limit?: number; // 每个标签显示的产品数量，默认为 3
  
  // UI 配置
  bannerImage?: string; // 横幅图片路径
  bannerTitle?: string; // 横幅标题
  bannerLink?: string; // 横幅链接
  
  // 标签配置
  defaultTab?: string; // 默认选中的标签
  tabs?: string[]; // 自定义标签列表，如果不提供则从子类别获取
  
  // 样式配置
  className?: string; // 自定义 CSS 类名
  showBanner?: boolean; // 是否显示横幅
  gridCols?: { lg: string; md: string; default: string }; // 网格列数配置
  
  // 回调函数
  onTabChange?: (tab: string) => void; // 标签切换回调
  initialData?: ProductType[]; // SSR 注入的默认标签数据
  disableAnimations?: boolean; // 首页性能优化：禁用 framer-motion 动画
  disableBlur?: boolean; // 首页性能优化：禁用图片模糊占位
}

// Memoized Product to prevent unnecessary re-renders
const MemoizedProductCard = memo(Product);

const CategoryProducts: React.FC<CategoryProductsProps> = ({
  title,
  categorySlug,
  tag = 'home',
  parentCategorySlug = categorySlug,
  limit = 3,
  bannerImage,
  bannerTitle,
  bannerLink = "/shop",
  defaultTab = 'Top',
  tabs,
  className = "",
  showBanner = true,
  gridCols = { lg: 'lg:grid-cols-4', md: 'grid-cols-2', default: 'grid-cols-2' },
  onTabChange,
  initialData
  , disableAnimations = false
  , disableBlur = false
}) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [hasSubcategories, setHasSubcategories] = useState<boolean>(false);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [preloadedData, setPreloadedData] = useState<Map<string, ProductType[]>>(new Map());
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isStale, setIsStale] = useState<boolean>(false);

  const queryCategory = categorySlug === 'art-toy' ? 'art-toys' : categorySlug
  const listQuery = useProductList(queryCategory, parentCategorySlug, limit, tag)

  // Memoize tab items to prevent unnecessary re-renders
  const tabItems = useMemo(() => {
    if (tabs) {
      return tabs;
    }
    return [defaultTab, ...subcategories.map(sub => sub.name)];
  }, [tabs, subcategories, defaultTab]);
  
  // Fetch subcategories on component mount
  useEffect(() => {
    // 如果提供了自定义标签，则不需要获取子类别
    if (tabs) {
      setHasSubcategories(true);
      setInitialLoad(false);
      return;
    }

    const fetchSubcategories = async () => {
      try {
        // 修正API路径，根据categorySlug映射到正确的端点
        let endpoint;
        if (categorySlug === 'art-toy') {
          endpoint = '/api/woocommerce/categories/art-toy-subcategories';
        } else if (categorySlug === 'charms') {
          endpoint = '/api/woocommerce/categories/charms-subcategories';
        } else if (categorySlug === 'in-car-accessories') {
          endpoint = '/api/woocommerce/categories/in-car-accessories-subcategories';
        } else {
          // 对于其他类别，尝试动态端点
          endpoint = `/api/woocommerce/categories/${categorySlug}-subcategories`;
        }
        
        const res = await fetch(endpoint);
        if (!res.ok) {
          // 如果API端点不存在或返回错误，不抛出错误，只是不设置子类别
          console.warn(`No subcategories API endpoint for ${categorySlug} or endpoint returned error`);
          // 对于没有子类别的类别，仍然设置hasSubcategories为true以显示默认标签
          if (tabs) {
            setHasSubcategories(true);
          }
          return;
        }
        const data = await res.json();
        console.log(`CategoryProducts: Fetched subcategories for ${categorySlug}:`, data);
        if (data.subcategories && data.subcategories.length > 0) {
          console.log(`CategoryProducts: Setting ${data.subcategories.length} subcategories:`, (data.subcategories as any[]).map((sub: any) => sub.name));
          setSubcategories(data.subcategories);
          setHasSubcategories(true);
          
          // Start preloading products for all subcategories in parallel
          // but don't wait for them to complete
          preloadSubcategoryProducts(data.subcategories, parentCategorySlug, limit, tag)
            .then(() => {
              console.log('Preloading completed for all subcategories');
            })
            .catch(error => {
              console.warn('Error during preloading:', error);
            });
        } else {
          console.log(`CategoryProducts: No subcategories found for ${categorySlug}`);
          // 即使没有子类别，也设置hasSubcategories为true以显示默认标签
          setHasSubcategories(true);
        }
      } catch (error) {
        // 捕获所有错误，但不阻止组件渲染
        console.warn(`Error fetching subcategories for ${categorySlug}:`, error);
        // 对于有自定义标签的类别，即使出错也要设置hasSubcategories
        if (tabs) {
          setHasSubcategories(true);
        }
      } finally {
        setInitialLoad(false);
      }
    };

    fetchSubcategories();
  }, [categorySlug, parentCategorySlug, limit, tag, tabs]);

  // Optimized function to load products with caching
  const loadProducts = useCallback(async (tab: string) => {
    console.log(`CategoryProducts: Loading products for category="${categorySlug}", tab="${tab}", tag="${tag}"`);
    
    // Check if we already have preloaded data
    if (tab !== defaultTab && preloadedData.has(tab)) {
      console.log(`CategoryProducts: Using preloaded data for tab "${tab}"`);
      setProducts(preloadedData.get(tab) || []);
      setIsStale(false);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setIsStale(false);
    try {
      let products: ProductType[] = [];
      let responseMeta: any = null;
      
      if (tab === defaultTab) {
        // Fetch products from main category with the specified tag
        // Try both the categorySlug and a pluralized version to handle naming differences
        let categoryToTry = categorySlug;
        
        // If categorySlug is "art-toy", also try "art-toys" since that's the actual category in WooCommerce
        if (categorySlug === 'art-toy') {
          categoryToTry = 'art-toys';
        }
        
        let apiUrl;
        if (tag && tag !== "") {
          apiUrl = `/api/woocommerce/products/by-category-and-tag?category=${categoryToTry}&per_page=${limit}&tag=${tag}`;
        } else {
          // Use a different API endpoint when tag is empty
          apiUrl = `/api/woocommerce/products?category=${categoryToTry}&per_page=${limit}`;
        }
        
        console.log(`CategoryProducts: Fetching from API: ${apiUrl}`);
        
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
        
        try {
          const response = await fetch(apiUrl, { 
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache',
            }
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            // Handle 204 No Content response
            if (response.status === 204) {
              console.log(`CategoryProducts: API returned 204 No Content for category "${categoryToTry}"`);
              products = [];
              responseMeta = null;
            } else {
              const responseData = await response.json();
              products = responseData.data || responseData || [];
              responseMeta = responseData.meta || null;
              console.log(`CategoryProducts: Successfully fetched ${products.length} products from API`);
              
              // Update state based on metadata
              if (responseMeta) {
                setHasMore(responseMeta.hasMore || false);
                setIsStale(responseMeta.isStale || false);
              }
            }
          } else {
            console.log(`CategoryProducts: API request failed with status ${response.status}, using fallback service functions`);
            // Fallback to the service function
            if (tag && tag !== "") {
              products = await fetchSubcategoryProductsWithFallback(categorySlug, parentCategorySlug, limit, tag);
            } else {
              products = await fetchSubcategoryProducts(categorySlug, parentCategorySlug, limit);
            }
            console.log(`CategoryProducts: Fallback fetched ${products.length} products`);
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          console.log(`CategoryProducts: Fetch error (${fetchError instanceof Error ? fetchError.name : 'Unknown'}), using fallback service functions`);
          // Fallback to the service function
          if (tag && tag !== "") {
            products = await fetchSubcategoryProductsWithFallback(categorySlug, parentCategorySlug, limit, tag);
          } else {
            products = await fetchSubcategoryProducts(categorySlug, parentCategorySlug, limit);
          }
          console.log(`CategoryProducts: Fallback fetched ${products.length} products`);
        }
      } else {
        // Fetch products for the selected subcategory
        const subcategory = subcategories.find(sub => sub.name === tab);
        if (subcategory) {
          let categorySlugToUse = subcategory.slug;
          
          // If subcategory slug is "art-toy", also try "art-toys" since that's the actual category in WooCommerce
          if (subcategory.slug === 'art-toy') {
            categorySlugToUse = 'art-toys';
          }
          
          let apiUrl;
          if (tag) {
            apiUrl = `/api/woocommerce/products/by-category-and-tag?category=${categorySlugToUse}&per_page=${limit}&tag=${tag}`;
          } else {
            // Use a different API endpoint when tag is empty
            apiUrl = `/api/woocommerce/products?category=${categorySlugToUse}&per_page=${limit}`;
          }
          
          console.log(`CategoryProducts: Fetching subcategory "${tab}" from API: ${apiUrl}`);
          
          // Add timeout to prevent hanging requests
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
          
          try {
            const response = await fetch(apiUrl, { 
              signal: controller.signal,
              headers: {
                'Cache-Control': 'no-cache',
              }
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
              // Handle 204 No Content response
              if (response.status === 204) {
                console.log(`CategoryProducts: API returned 204 No Content for subcategory "${tab}"`);
                products = [];
                responseMeta = null;
              } else {
                const responseData = await response.json();
                products = responseData.data || responseData || [];
                responseMeta = responseData.meta || null;
                console.log(`CategoryProducts: Successfully fetched ${products.length} products for subcategory "${tab}"`);
                
                // Update state based on metadata
                if (responseMeta) {
                  setHasMore(responseMeta.hasMore || false);
                  setIsStale(responseMeta.isStale || false);
                }
              }
            } else {
              console.log(`CategoryProducts: Subcategory API request failed with status ${response.status}, using fallback service functions`);
              // Fallback to the service function
              if (tag) {
                products = await fetchSubcategoryProductsWithFallback(
                  categorySlugToUse,
                  parentCategorySlug,
                  limit,
                  tag
                );
              } else {
                products = await fetchSubcategoryProducts(
                  categorySlugToUse,
                  parentCategorySlug,
                  limit
                );
              }
              console.log(`CategoryProducts: Fallback fetched ${products.length} products for subcategory "${tab}"`);
            }
          } catch (fetchError) {
            clearTimeout(timeoutId);
            console.log(`CategoryProducts: Subcategory fetch error (${fetchError instanceof Error ? fetchError.name : 'Unknown'}), using fallback service functions`);
            // Fallback to the service function
            if (tag) {
              products = await fetchSubcategoryProductsWithFallback(
                categorySlugToUse,
                parentCategorySlug,
                limit,
                tag
              );
            } else {
              products = await fetchSubcategoryProducts(
                categorySlugToUse,
                parentCategorySlug,
                limit
              );
            }
            console.log(`CategoryProducts: Fallback fetched ${products.length} products for subcategory "${tab}"`);
          }
          
          // Cache the loaded data
          setPreloadedData(prev => new Map(prev).set(tab, products));
        }
      }
      
      // Add a brief transition for smoother UI
      setIsTransitioning(true);
      setTimeout(() => {
        setProducts(products);
        setIsTransitioning(false);
      }, 100);
    } catch (error) {
      console.error('CategoryProducts: Error loading products:', error);
      setIsStale(true); // Mark as stale on error
      setProducts([]); // Clear products on error
    } finally {
      setIsLoading(false);
    }
  }, [categorySlug, tag, limit, defaultTab, subcategories, parentCategorySlug, preloadedData]);

  // Fetch products based on active tab
  useEffect(() => {
    if (activeTab === defaultTab) {
      if (initialData && initialData.length) {
        setProducts(initialData)
        setIsStale(false)
        setIsLoading(false)
      } else if (listQuery.isLoading) {
        setIsLoading(true)
      } else if (listQuery.data) {
        setProducts(listQuery.data.data || [])
        setIsStale(!!listQuery.data.meta?.isStale)
        setIsLoading(false)
      }
      return
    }
    if (hasSubcategories) {
      loadProducts(activeTab)
    } else if (!initialLoad) {
      setIsLoading(false)
    }
  }, [activeTab, hasSubcategories, initialLoad, loadProducts, defaultTab, listQuery.isLoading, listQuery.data, initialData]);

  const handleTabClick = useCallback((tab: string) => {
    setActiveTab(tab);
    
    // Call the callback function if provided
    if (onTabChange) {
      onTabChange(tab);
    }
    
    // Use the new smart prefetch function for adjacent tabs
    if (tab !== defaultTab && !tabs) {
      prefetchAdjacentTabs(
        tab,
        tabItems,
        subcategories,
        parentCategorySlug,
        limit,
        tag
      );
    }
  }, [tabItems, subcategories, parentCategorySlug, limit, tag, defaultTab, tabs, onTabChange]);

  // If there are no subcategories and no custom tabs, don't render the component
  if (!hasSubcategories && !tabs && isLoading === false) {
    return null;
  }
  
  // 如果提供了自定义标签，但没有子类别，确保组件仍然渲染
  if (tabs && !hasSubcategories && !isLoading) {
    setHasSubcategories(true);
  }

  return (
    <>
      <div className={`tab-features-block md:pt-20 pt-10 ${className}`}>
        <div className="container">
          <div className="heading flex items-center justify-between gap-5 flex-wrap">
            <div className="heading3">{title}</div>
            <div className="flex items-center gap-3">
              {isStale && (
                <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  显示缓存数据
                </div>
              )}
              <div className="menu-tab flex items-center gap-2 p-1 bg-surface rounded-2xl">
                {tabItems.map((tab) => (
                  <div
                    key={tab}
                    className={`tab-item relative text-secondary py-2 px-5 cursor-pointer duration-500 hover:text-black ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => handleTabClick(tab)}
                  >
                    {activeTab === tab && (
                      disableAnimations ? (
                        <div className='absolute inset-0 rounded-2xl bg-white'></div>
                      ) : (
                        <motion.div layoutId='active-pill' className='absolute inset-0 rounded-2xl bg-white'></motion.div>
                      )
                    )}
                    <span className='relative text-button-uppercase z-[1]'>
                      {tab}
                    </span>
                  </div>
                ))}
                <Link 
                  href={`/shop?category=${parentCategorySlug}`}
                  prefetch={false}
                  className="tab-item relative text-secondary py-2 px-5 cursor-pointer duration-500 hover:text-black"
                >
                  <span className='relative text-button-uppercase z-[1]'>
                    View All
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className={`list-product hide-product-sold grid ${gridCols.lg} ${gridCols.md} ${gridCols.default} sm:gap-[30px] gap-[20px] md:mt-10 mt-6`}>
            {showBanner && (
              <Link href={bannerLink} prefetch={false} className="banner rounded-[20px] overflow-hidden relative flex items-center justify-center">
                {/* <div className="heading4 text-white text-center">{bannerTitle || title}</div> */}
                <BlurImage
                  src={bannerImage || `/images/banner/default.png`}
                  width={500}
                  height={500}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover z-1"
                  disableBlur={disableBlur}
                />
              </Link>
            )}
            {isLoading ? (
              // Enhanced skeleton loading with product card structure
              Array.from({ length: limit }).map((_, index) => (
                <div key={index} className="product-item">
                  <div className="product-main rounded-2xl overflow-hidden bg-grey-100">
                    <div className="product-img relative aspect-[3/4] bg-grey-200 animate-pulse"></div>
                    <div className="product-info p-4">
                      <div className="flex gap-2 mb-2">
                        <div className="w-8 h-8 bg-grey-200 rounded-full animate-pulse"></div>
                        <div className="w-8 h-8 bg-grey-200 rounded-full animate-pulse"></div>
                        <div className="w-8 h-8 bg-grey-200 rounded-full animate-pulse"></div>
                      </div>
                      <div className="text-xs text-grey-400 mb-1 h-4 bg-grey-200 rounded animate-pulse"></div>
                      <div className="text-sm font-medium mb-2 h-4 bg-grey-200 rounded animate-pulse"></div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-bold h-4 bg-grey-200 rounded w-16 animate-pulse"></div>
                        <div className="flex gap-1">
                          <div className="w-4 h-4 bg-grey-200 rounded-full animate-pulse"></div>
                          <div className="w-4 h-4 bg-grey-200 rounded-full animate-pulse"></div>
                          <div className="w-4 h-4 bg-grey-200 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <>
                {products.length > 0 ? (
                  products.map((product, index) => (
                    disableAnimations ? (
                      <div key={product.id}>
                        <MemoizedProductCard data={product} type="grid" style="style-1" />
                      </div>
                    ) : (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: isTransitioning ? 0 : 1, y: isTransitioning ? 20 : 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <MemoizedProductCard data={product} type="grid" style="style-1" />
                      </motion.div>
                    )
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                       <div className="text-4xl mb-4">📦</div>
                       <p className="text-grey-600 mb-2">loading</p>
                       {isStale && (
                           <p className="text-xs text-amber-600">Please try again later.</p>
                       )}
                   </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryProducts;