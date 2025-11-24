import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { addressSchema, type AddressFormData } from '@/lib/validations/address'
import { json } from '@/utils/apiResponse'

export async function POST(request: NextRequest) {
  try {
    // 获取认证令牌
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // 移除 'Bearer ' 前缀
    
    // 验证令牌并获取用户信息
    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!userResponse.ok) {
      return json(
        { success: false, message: '令牌验证失败' },
        { status: 401 }
      )
    }

    const userData = await userResponse.json()
    if (!userData.success || !userData.user) {
      return json(
        { success: false, message: '用户信息无效' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // 验证请求数据
    const validatedData = addressSchema.parse(body)
    
    // 获取地址类型
    const { searchParams } = new URL(request.url)
    const addressType = searchParams.get('type') || 'billing'
    
    // 构建WooCommerce API请求数据
    const wooCommerceData = {
      [addressType]: {
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        company: validatedData.company || '',
        address_1: validatedData.address1,
        address_2: validatedData.address2 || '',
        city: validatedData.city,
        state: validatedData.state,
        postcode: validatedData.postcode,
        country: validatedData.country,
        email: validatedData.email || userData.user.email,
        phone: validatedData.phone || userData.user.phone
      }
    }

    // 调用WooCommerce API
    const wooCommerceUrl = process.env.WOOCOMMERCE_URL || process.env.NEXT_PUBLIC_WOOCOMMERCE_URL
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || process.env.WC_CONSUMER_KEY
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || process.env.WC_CONSUMER_SECRET

    if (!wooCommerceUrl || !consumerKey || !consumerSecret) {
      return json(
        { success: false, message: 'WooCommerce API配置不完整' },
        { status: 500 }
      )
    }

    // 构建基本认证
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')
    
    let apiUrl = ''
    if (addressType === 'billing') {
      // 更新账单地址
      apiUrl = `${wooCommerceUrl}/wp-json/wc/v3/customers/${userData.user.id}`
    } else {
      // 创建或更新配送地址
      // 这里需要先检查用户是否已有配送地址
      const existingAddressesResponse = await fetch(`${wooCommerceUrl}/wp-json/wc/v3/customers/${userData.user.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`
        }
      })

      if (existingAddressesResponse.ok) {
        const customerData = await existingAddressesResponse.json()
        const shippingAddresses = customerData.shipping || []
        
        // 查找是否有配送地址
        const existingShippingAddress = shippingAddresses.find(addr => 
          addr.first_name === validatedData.firstName &&
          addr.last_name === validatedData.lastName &&
          addr.address_1 === validatedData.address1 &&
          addr.city === validatedData.city &&
          addr.postcode === validatedData.postcode
        )

        if (existingShippingAddress) {
          // 更新现有配送地址
          apiUrl = `${wooCommerceUrl}/wp-json/wc/v3/customers/${userData.user.id}/addresses/${existingShippingAddress.id}`
        } else {
          // 创建新的配送地址
          apiUrl = `${wooCommerceUrl}/wp-json/wc/v3/customers/${userData.user.id}/addresses`
        }
      } else {
        // 创建新的配送地址
        apiUrl = `${wooCommerceUrl}/wp-json/wc/v3/customers/${userData.user.id}/addresses`
      }
    }

    const response = await fetch(apiUrl, {
      method: addressType === 'billing' ? 'PUT' : 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(wooCommerceData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return json(
        { 
          success: false, 
          message: errorData.message || '地址保存失败' 
        },
        { status: response.status }
      )
    }

    const result = await response.json()
    
    return json(
      { 
        success: true, 
        message: '地址保存成功',
        data: result
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Address save error:', error)
    
    if (error instanceof z.ZodError) {
      return json(
        { 
          success: false, 
          message: '表单验证失败',
          errors: (error as any).errors?.reduce((acc: any, err: any) => {
            const field = err.path?.[0]
            return {
              ...acc,
              [field]: err.message
            }
          }, {})
        },
        { status: 400 }
      )
    }
    
    return json(
      { 
        success: false, 
        message: '服务器错误，请稍后重试' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // 获取认证令牌
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // 验证令牌并获取用户信息
    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!userResponse.ok) {
      return json(
        { success: false, message: '令牌验证失败' },
        { status: 401 }
      )
    }

    const userData = await userResponse.json()
    if (!userData.success || !userData.user) {
      return json(
        { success: false, message: '用户信息无效' },
        { status: 401 }
      )
    }

    // 获取地址类型
    const { searchParams } = new URL(request.url)
    const addressType = searchParams.get('type') || 'billing'
    
    // 调用WooCommerce API获取地址
    const wooCommerceUrl = process.env.WOOCOMMERCE_URL || process.env.NEXT_PUBLIC_WOOCOMMERCE_URL
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || process.env.WC_CONSUMER_KEY
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || process.env.WC_CONSUMER_SECRET

    if (!wooCommerceUrl || !consumerKey || !consumerSecret) {
      return json(
        { success: false, message: 'WooCommerce API配置不完整' },
        { status: 500 }
      )
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')
    
    let apiUrl = ''
    let responseData = null
    
    if (addressType === 'billing') {
      // 获取账单地址
      apiUrl = `${wooCommerceUrl}/wp-json/wc/v3/customers/${userData.user.id}`
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`
        }
      })
      
      if (response.ok) {
        const customerData = await response.json()
        responseData = customerData.billing || null
      }
    } else {
      // 获取配送地址
      apiUrl = `${wooCommerceUrl}/wp-json/wc/v3/customers/${userData.user.id}/addresses`
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`
        }
      })
      
      if (response.ok) {
        const customerData = await response.json()
        const shippingAddresses = customerData.shipping || []
        
        if (shippingAddresses.length > 0) {
          responseData = shippingAddresses[0]
        }
      }
    }

    return json(
      { 
        success: true, 
        message: '地址获取成功',
        data: responseData
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Address fetch error:', error)
    
    return json(
      { 
        success: false, 
        message: '服务器错误，请稍后重试' 
      },
      { status: 500 }
    )
  }
}

// 处理OPTIONS请求（用于CORS）
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}