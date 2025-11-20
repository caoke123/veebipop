import { NextRequest, NextResponse } from 'next/server'
import { getCart, addToCart, removeFromCart, clearCart } from '@/lib/cart'

// Changed from 'edge' to 'nodejs' to fix compatibility with Node.js modules
export const runtime = 'nodejs'

// GET - 获取购物车
export async function GET() {
  try {
    const cart = await getCart()
    return NextResponse.json({ success: true, data: cart })
  } catch (error) {
    console.error('获取购物车失败:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get cart' },
      { status: 500 }
    )
  }
}

// POST - 添加商品到购物车
export async function POST(request: NextRequest) {
  try {
    const { productId, quantity } = await request.json()
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    await addToCart(productId, quantity || 1)
    const cart = await getCart()
    
    return NextResponse.json({ success: true, data: cart })
  } catch (error) {
    console.error('添加到购物车失败:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add to cart' },
      { status: 500 }
    )
  }
}

// DELETE - 清空购物车
export async function DELETE() {
  try {
    await clearCart()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('清空购物车失败:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear cart' },
      { status: 500 }
    )
  }
}