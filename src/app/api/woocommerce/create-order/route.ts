import { NextRequest } from 'next/server'
import { getWcApi } from '@/utils/woocommerce'
import { json, error, badRequest } from '@/utils/apiResponse'

// Changed from 'edge' to 'nodejs' to fix compatibility with Node.js modules
export const runtime = 'nodejs'

function toInt(v: string | null | undefined, def: number): number {
  const n = v ? parseInt(v, 10) : NaN
  return Number.isNaN(n) ? def : Math.max(1, n)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const productIdRaw = searchParams.get('productId')
  const quantityRaw = searchParams.get('quantity')
  const variationIdRaw = searchParams.get('variationId')
  const size = searchParams.get('size')
  const color = searchParams.get('color')
  const cartItemsParam = searchParams.get('cartItems')

  // Support both single product orders and cart orders
  let isCartOrder = false
  let cartItems: any[] = []
  
  if (cartItemsParam) {
    isCartOrder = true
    try {
      cartItems = JSON.parse(cartItemsParam)
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return badRequest('Invalid cartItems: must be non-empty array')
      }
    } catch {
      return badRequest('Invalid cartItems: JSON parse failed')
    }
  } else if (!productIdRaw) {
    return badRequest('Missing required query: productId or cartItems')
  }
  
  let product_id = 0
  let quantity = 1
  let variation_id: number | undefined = undefined

  if (!isCartOrder) {
    if (!productIdRaw) {
      return badRequest('Missing productId')
    }
    product_id = parseInt(productIdRaw, 10)
    if (Number.isNaN(product_id) || product_id <= 0) {
      return badRequest('Invalid productId')
    }
    quantity = toInt(quantityRaw, 1)
    variation_id = variationIdRaw ? parseInt(variationIdRaw, 10) : undefined
  }

  console.log('=== 环境变量检查 ===')
  console.log('WOOCOMMERCE_URL:', process.env.WOOCOMMERCE_URL)
  console.log('NEXT_PUBLIC_WOOCOMMERCE_URL:', process.env.NEXT_PUBLIC_WOOCOMMERCE_URL)
  console.log('WC_API_BASE:', process.env.WC_API_BASE)
  console.log('NEXT_PUBLIC_WC_API_BASE:', process.env.NEXT_PUBLIC_WC_API_BASE)
  console.log('WOOCOMMERCE_CONSUMER_KEY:', process.env.WOOCOMMERCE_CONSUMER_KEY)
  console.log('WOOCOMMERCE_CONSUMER_SECRET:', process.env.WOOCOMMERCE_CONSUMER_SECRET)
  console.log('WC_CONSUMER_KEY:', process.env.WC_CONSUMER_KEY)
  console.log('WC_CONSUMER_SECRET:', process.env.WC_CONSUMER_SECRET)

  const wcApi = getWcApi()
  console.log('=== API配置检查 ===')
  console.log('wcApi object:', !!wcApi)
  if (wcApi) {
    console.log('WooCommerce API client configured successfully')
  }
  
  if (!wcApi) {
    return error(500, 'WooCommerce API client not configured properly')
  }
  
  // Try to resolve variation_id automatically when not provided
  // based on optional size/color attributes.
  let resolvedVariationId: number | undefined = variation_id
  try {
    if (!resolvedVariationId && (size || color)) {
      const productRes = await wcApi.get(`products/${encodeURIComponent(String(product_id))}`)
      const product = productRes?.data || null
      const type = String(product?.type || '').toLowerCase()
      if (type === 'variable') {
        // Fetch variations (cap at 100 to avoid excessive pagination)
        const varRes = await wcApi.get(`products/${encodeURIComponent(String(product_id))}/variations`, { per_page: 100 })
        const variations = Array.isArray(varRes?.data) ? varRes.data : []
        const norm = (s: string) => s.toLowerCase().replace(/^pa_/, '').trim()
        const wantSize = size ? norm(size) : null
        const wantColor = color ? norm(color) : null

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
        if (match?.id) resolvedVariationId = Number(match.id)
      }
    }
  } catch {
    // Swallow resolution errors; we'll proceed without variation_id if not found
  }

  // Get product price and detailed info
  let productPrice: number | undefined
  let product: any = null
  try {
    console.log('Fetching product price for product_id:', product_id)
    const productRes = await wcApi.get(`products/${encodeURIComponent(String(product_id))}`)
    product = productRes?.data || null
    productPrice = Number(product?.price) || undefined
    console.log('Product fetched:', { 
      id: product?.id, 
      name: product?.name, 
      price: product?.price, 
      parsedPrice: productPrice,
      type: product?.type,
      stock_quantity: product?.stock_quantity,
      manage_stock: product?.manage_stock,
      in_stock: product?.in_stock,
      stock_status: product?.stock_status,
      purchasable: product?.purchasable,
      catalog_visibility: product?.catalog_visibility,
      status: product?.status,
      virtual: product?.virtual,
      downloadable: product?.downloadable,
      categories: product?.categories,
      description: product?.description?.substring(0, 100) + '...'
    })
    
    // Validate product before creating order
    console.log('Product validation:')
    console.log('- Is purchasable:', product?.purchasable)
    console.log('- Stock status:', product?.stock_status) 
    console.log('- Catalog visibility:', product?.catalog_visibility)
    console.log('- Product status:', product?.status)
    console.log('- Type:', product?.type)
    
    if (!product?.purchasable) {
      console.log('WARNING: Product is not purchasable!')
    }
    
  } catch (err) {
    console.error('Error fetching product price:', err)
    // Swallow price fetching errors; WooCommerce will use default price
  }

  // Try the simplest line item format
  let lineItems: any[] = []
  
  if (isCartOrder) {
    // Process cart items
    console.log('Processing cart order with items:', cartItems)
    
    for (const cartItem of cartItems) {
      const { productId, quantity: cartQuantity, variationId, size: cartSize, color: cartColor } = cartItem
      
      if (!productId || !cartQuantity) {
        console.error('Invalid cart item:', cartItem)
        continue
      }
      
      let cartProductId: number
      // 尝试将productId转换为数字，如果失败则使用slug查找
      const numericId = parseInt(String(productId), 10)
      if (!Number.isNaN(numericId) && numericId > 0) {
        cartProductId = numericId
      } else {
        // 如果是字符串slug，尝试通过slug查找产品
        console.log('ProductId is not numeric, trying to find product by slug:', productId)
        try {
          const productsRes = await wcApi.get(`products?slug=${encodeURIComponent(String(productId))}&per_page=1`)
          const products = productsRes?.data || []
          if (products.length > 0) {
            cartProductId = products[0].id
            console.log('Found product by slug, ID:', cartProductId)
          } else {
            console.error('Product not found for slug:', productId)
            continue
          }
        } catch (slugErr) {
          console.error('Error finding product by slug:', slugErr)
          continue
        }
      }
      
      const cartQuantityInt = toInt(String(cartQuantity), 1)
      const cartVariationId = variationId ? parseInt(String(variationId), 10) : undefined
      
      const cartLineItem: any = {
        product_id: cartProductId,
        quantity: cartQuantityInt
      }
      
      if (cartVariationId) {
        cartLineItem.variation_id = cartVariationId
      }
      
      console.log('Cart line item:', JSON.stringify(cartLineItem, null, 2))
      lineItems.push(cartLineItem)
    }
    
    if (lineItems.length === 0) {
      return badRequest('No valid cart items found')
    }
  } else {
    // Process single product
    const lineItem: any = { 
      product_id, 
      quantity 
    }
    
    if (variation_id) {
      lineItem.variation_id = variation_id
    }
    
    console.log('=== SINGLE PRODUCT LINE ITEM DEBUGGING ===')
    console.log('product_id type:', typeof product_id)
    console.log('product_id value:', product_id)
    console.log('quantity type:', typeof quantity)
    console.log('quantity value:', quantity)
    console.log('lineItem object:', JSON.stringify(lineItem, null, 2))
    console.log('Final line item (simple format):', JSON.stringify(lineItem, null, 2))
    console.log('Product data for line item:', { 
      id: product?.id, 
      name: product?.name, 
      price: product?.price, 
      type: product?.type,
      stock_status: product?.stock_status,
      stock_quantity: product?.stock_quantity,
      manage_stock: product?.manage_stock,
      in_stock: product?.in_stock,
      virtual: product?.virtual,
      downloadable: product?.downloadable
    })
    
    lineItems = [lineItem]
  }

  try {
    // Try minimal payload first to isolate the issue
    console.log('=== ATTEMPT 1: Minimal payload ===')
    let payload1 = {
      status: 'pending',
      line_items: lineItems
    }
    
    console.log('Creating order with minimal payload:', JSON.stringify(payload1, null, 2))
    let res1 = await wcApi.post('orders', payload1)
    console.log('Minimal payload response status:', res1?.status)
    let order1 = res1?.data
    console.log('Minimal payload response:', JSON.stringify(order1, null, 2))
    
    console.log('=== DETAILED DEBUGGING ===')
    console.log('payload1:', JSON.stringify(payload1, null, 2))
    console.log('lineItems:', JSON.stringify(lineItems, null, 2))
    console.log('res1.data.line_items:', JSON.stringify(res1?.data?.line_items, null, 2))
    console.log('res1.data.total:', res1?.data?.total)
    console.log('order1 exists:', !!order1)
    console.log('order1.line_items exists:', !!order1?.line_items)
    console.log('order1.line_items.length:', order1?.line_items?.length)
    
    if (order1 && order1.line_items && order1.line_items.length > 0) {
      console.log('SUCCESS: Minimal payload worked!')
      return json({ success: true, order_id: order1.id, order: order1, method: 'minimal' })
    }
    
    // If minimal didn't work, try with more fields
    console.log('=== ATTEMPT 2: Extended payload ===')
    const payload: any = {
      status: 'pending',
      payment_method: 'pending',
      payment_method_title: 'Pending Payment',
      set_paid: false,
      line_items: lineItems,
      customer_note: 'Created via frontend create-order route'
    }
    
    // Add billing info separately to test if it's causing issues
    payload.billing = {
      first_name: 'Test',
      last_name: 'User', 
      email: 'test@example.com',
      phone: '1234567890'
    }
    
    console.log('Creating order with extended payload:', JSON.stringify(payload, null, 2))
    const res = await wcApi.post('orders', payload)
    console.log('Extended payload response status:', res?.status)
    const order = res?.data
    console.log('Extended payload response:', JSON.stringify(order, null, 2))
    
    if (!order) {
      return error(500, 'Failed to create order - empty response')
    }
    // Check if extended payload worked
    console.log('Order line_items in response:', order.line_items)
    
    // If line_items are empty, try to fetch the order again to see if it was updated
    if (!order.line_items || order.line_items.length === 0) {
      console.log('Line items are empty, fetching order again...')
      try {
        const fetchRes = await wcApi.get(`orders/${order.id}`)
        const fetchedOrder = fetchRes?.data
        console.log('Fetched order:', JSON.stringify(fetchedOrder, null, 2))
        if (fetchedOrder && fetchedOrder.line_items && fetchedOrder.line_items.length > 0) {
          console.log('Found line items in fetched order')
          return json({ success: true, order_id: fetchedOrder.id, order: fetchedOrder, method: 'fetched' })
        }
      } catch (fetchErr) {
        console.error('Error fetching order:', fetchErr)
      }
    }
    
    return json({ success: true, order_id: order.id, order, method: 'extended' })
  } catch (err: any) {
    console.error('Order creation error:', err)
    console.error('Error response status:', err?.response?.status)
    console.error('Error response data:', err?.response?.data)
    const status = err?.response?.status ?? 500
    const details = err?.response?.data ?? { message: String(err?.message ?? 'Unknown error') }
    return error(status, 'Failed to create pending order', details)
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
