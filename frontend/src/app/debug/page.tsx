"use client";

import { useState, useEffect } from 'react';
import ProductDebug from '@/components/Debug/ProductDebug';

export default function DebugPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [apiResponse, setApiResponse] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<number>(3472);

  useEffect(() => {
    // 首先获取所有分类
    async function fetchCategories() {
      try {
        const response = await fetch('/api/woocommerce/categories');
        if (!response.ok) {
          throw new Error(`分类API请求失败: ${response.status}`);
        }
        const categoriesData = await response.json();
        setCategories(categoriesData);
        console.log('所有分类:', categoriesData);
        
        // 查找目标分类
        const targetCategory = categoriesData.find((cat: any) => 
          cat.slug === 'in-car-accessories' || 
          cat.name.toLowerCase().includes('car') ||
          cat.name.toLowerCase().includes('accessor')
        );
        
        if (targetCategory) {
          console.log('找到目标分类:', targetCategory);
        } else {
          console.log('未找到目标分类，显示前5个分类:');
          console.log(categoriesData.slice(0, 5).map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug
          })));
        }
      } catch (err) {
        console.error('获取分类失败:', err);
        setError(`获取分类失败: ${err}`);
      }
    }

    // 然后获取产品数据
    async function fetchData() {
      try {
        setLoading(true);
        const apiUrl = '/api/woocommerce/products?per_page=50&category=in-car-accessories';
        console.log('正在请求API:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`API请求失败: ${response.status}`);
        }
        
        // Handle 204 No Content response
        if (response.status === 204) {
          console.log('API返回了204 No Content - 该分类下没有产品');
          setData([]);
          setApiResponse('204 No Content - 该分类下没有产品');
          return;
        }
        
        const result = await response.json();
        setData(result);
        console.log('API返回的产品数据:', result);
        
        // 保存原始响应用于调试
        setApiResponse(JSON.stringify(result, null, 2));
      } catch (err) {
        console.error('获取产品数据失败:', err);
        setError(`获取产品数据失败: ${err}`);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
    fetchData();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">调试页面 - in-car-accessories分类产品</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">错误:</p>
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">
          <p>加载中...</p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">分类信息</h2>
            <div className="bg-gray-100 p-4 rounded">
              <p>总分类数: {categories.length}</p>
              <div className="mt-2">
                <h3 className="font-medium">查找 'in-car-accessories' 分类:</h3>
                {categories.find((cat: any) => cat.slug === 'in-car-accessories') ? (
                  <div className="bg-green-100 p-2 mt-2 rounded">
                    找到匹配的分类: {categories.find((cat: any) => cat.slug === 'in-car-accessories').name} (ID: {categories.find((cat: any) => cat.slug === 'in-car-accessories').id})
                  </div>
                ) : (
                  <div className="bg-yellow-100 p-2 mt-2 rounded">
                    未找到slug为 'in-car-accessories' 的分类
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium">前5个分类:</h3>
                <ul className="list-disc pl-5 mt-2">
                  {categories.slice(0, 5).map((cat: any) => (
                    <li key={cat.id}>
                      ID: {cat.id}, 名称: {cat.name}, Slug: {cat.slug}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium">包含"car"或"accessor"的分类:</h3>
                <ul className="list-disc pl-5 mt-2">
                  {categories
                    .filter((cat: any) => 
                      cat.name.toLowerCase().includes('car') || 
                      cat.name.toLowerCase().includes('accessor')
                    )
                    .map((cat: any) => (
                      <li key={cat.id}>
                        ID: {cat.id}, 名称: {cat.name}, Slug: {cat.slug}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">API响应概要</h2>
            <div className="bg-gray-100 p-4 rounded">
              <p>返回的产品数量: {data ? data.length : 0}</p>
              <p>响应类型: {Array.isArray(data) ? '数组' : typeof data}</p>
            </div>
          </div>
          
          {data && data.length > 0 ? (
            <div>
              <h2 className="text-xl font-semibold mb-2">产品详情</h2>
              <div className="space-y-4">
                {data.slice(0, 3).map((product: any, index: number) => (
                  <div key={product.id || index} className="border p-4 rounded">
                    <h3 className="font-medium">{product.name}</h3>
                    <p>价格: {product.price}</p>
                    <p>分类信息:</p>
                    <ul className="list-disc pl-5">
                      {product.categories && product.categories.length > 0 ? (
                        product.categories.map((cat: any) => (
                          <li key={cat.id}>
                            ID: {cat.id}, 名称: {cat.name}, Slug: {cat.slug}
                          </li>
                        ))
                      ) : (
                        <li>无分类信息</li>
                      )}
                    </ul>
                    
                    {/* 检查ACF字段 */}
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                      <h4 className="font-medium mb-2">ACF字段检查:</h4>
                      <p>Markdown内容存在: {product.acf?.product_markdown_content ? '是' : '否'}</p>
                      <p>Markdown内容长度: {product.acf?.product_markdown_content?.length || 0}</p>
                      <p>图片画廊存在: {product.acf?.product_image_gallery ? '是' : '否'}</p>
                      <p>图片画廊数量: {product.acf?.product_image_gallery?.length || 0}</p>
                      
                      <button 
                        onClick={() => setSelectedProductId(product.id)}
                        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
                      >
                        详细调试此产品
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-yellow-100 p-4 rounded">
              <h2 className="text-xl font-semibold mb-2">无产品数据</h2>
              <p>API返回了空数组或非数组数据。</p>
              <p>可能的原因:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>分类 'in-car-accessories' 不存在</li>
                <li>该分类下没有产品</li>
                <li>API参数不正确</li>
                <li>权限或认证问题</li>
              </ul>
            </div>
          )}
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">原始API响应</h2>
            <div className="bg-gray-100 p-4 rounded">
              <pre className="whitespace-pre-wrap text-xs">{apiResponse}</pre>
            </div>
          </div>
          
          {/* 产品详细调试部分 */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">产品ACF字段详细调试</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                产品ID: 
                <input 
                  type="number" 
                  value={selectedProductId} 
                  onChange={(e) => setSelectedProductId(parseInt(e.target.value) || 1)}
                  className="ml-2 px-2 py-1 border rounded"
                />
              </label>
            </div>
            <ProductDebug productId={selectedProductId} />
          </div>
        </>
      )}
    </div>
  );
}