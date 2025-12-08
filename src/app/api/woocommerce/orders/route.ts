import { NextRequest } from 'next/server'
import { getWcApi } from '@/utils/woocommerce'
import { json, error, badRequest } from '@/utils/apiResponse'

// Order creation interface matching WooCommerce API
interface CreateOrderRequest {
  payment_method: string
  payment_method_title: string
  set_paid?: boolean
  billing: {
    first_name: string
    last_name: string
    company?: string
    address_1: string
    address_2?: string
    city: string
    state: string
    postcode: string
    country: string
    email: string
    phone: string
  }
  shipping: {
    first_name: string
    last_name: string
    company?: string
    address_1: string
    address_2?: string
    city: string
    state: string
    postcode: string
    country: string
  }
  line_items: Array<{
    product_id: number
    quantity: number
    variation_id?: number
    meta_data?: Array<{
      key: string
      value: string
    }>
  }>
  shipping_lines?: Array<{
    method_id: string
    method_title: string
    total: string
  }>
  coupon_lines?: Array<{
    code: string
  }>
  customer_note?: string
  transaction_id?: string
}

function validateOrderData(data: CreateOrderRequest): { isValid: boolean; message?: string } {
  // Basic validation
  if (!data.payment_method || !data.billing || !data.line_items || data.line_items.length === 0) {
    return { isValid: false, message: 'Missing required fields: payment_method, billing, line_items' }
  }

  // Validate billing address
  const requiredBillingFields = ['first_name', 'last_name', 'address_1', 'city', 'state', 'postcode', 'country', 'email', 'phone']
  for (const field of requiredBillingFields) {
    if (!data.billing[field as keyof typeof data.billing]) {
      return { isValid: false, message: `Missing required billing field: ${field}` }
    }
  }

  // Validate line items
  for (let i = 0; i < data.line_items.length; i++) {
    const item = data.line_items[i]
    if (!item.product_id || !item.quantity || item.quantity <= 0) {
      return { isValid: false, message: `Invalid line item at index ${i}: product_id and positive quantity required` }
    }
  }

  return { isValid: true }
}

export async function POST(request: NextRequest) {
  try {
    const orderData: CreateOrderRequest = await request.json()
    
    // Validate input data
    const validation = validateOrderData(orderData)
    if (!validation.isValid) {
      return badRequest(validation.message)
    }

    // Get WooCommerce API client
    const wcApi = getWcApi()
    if (!wcApi) {
      return error(500, 'WooCommerce API client not configured properly')
    }

    // Create the order via WooCommerce API
    const response = await wcApi.post('orders', orderData)
    
    if (response.data) {
      // Send Order Confirmation Emails
      try {
        const { sendEmail } = await import('@/lib/email')
        const order = response.data
        const itemsList = order.line_items.map((item: any) => 
          `<li>${item.name} x ${item.quantity} - $${item.total}</li>`
        ).join('')

        // To Customer
        await sendEmail({
          to: orderData.billing.email,
          subject: `Order Confirmation #${order.id}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Order Confirmation</h2>
              <p>Hi ${orderData.billing.first_name},</p>
              <p>Thank you for your order! We've received it and are processing it.</p>
              <h3>Order #${order.id}</h3>
              <ul>${itemsList}</ul>
              <p><strong>Total:</strong> ${order.currency_symbol || '$'}${order.total}</p>
              <br>
              <p>Best regards,</p>
              <p>VeebiPoP Team</p>
            </div>
          `
        })

        // To Admin
        await sendEmail({
          to: process.env.MAIL_TO_ADMIN || 'info@veebipop.com',
          subject: `[New Order] #${order.id} - ${order.total}`,
          html: `
            <h3>New Order Received</h3>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Customer:</strong> ${orderData.billing.first_name} ${orderData.billing.last_name}</p>
            <p><strong>Email:</strong> ${orderData.billing.email}</p>
            <p><strong>Total:</strong> ${order.total}</p>
            <h4>Items:</h4>
            <ul>${itemsList}</ul>
          `
        })
      } catch (emailError) {
        console.error('Failed to send order emails:', emailError)
      }

      return json({
        success: true,
        order: response.data,
        message: 'Order created successfully'
      }, {
        status: 201,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    } else {
      return error(500, 'Failed to create order - no data received from WooCommerce')
    }
    
  } catch (err: any) {
    console.error('Order creation error:', err)
    
    // Handle specific WooCommerce API errors
    if (err.response) {
      const status = err.response.status || 500
      const details = err.response.data || { message: 'WooCommerce API error' }
      
      return error(status, `Failed to create order: ${details.message || 'WooCommerce API error'}`, details)
    }
    
    // Handle JSON parsing errors
    if (err.name === 'SyntaxError' || err.type === 'invalid-json') {
      return badRequest('Invalid JSON in request body')
    }
    
    // Handle network/connection errors
    return error(500, 'Failed to connect to WooCommerce API', {
      message: err.message || 'Unknown error occurred'
    })
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}