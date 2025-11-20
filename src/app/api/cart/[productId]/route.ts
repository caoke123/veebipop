import { NextRequest, NextResponse } from 'next/server'
import { removeFromCart } from '@/lib/cart'

// Changed from 'edge' to 'nodejs' to fix compatibility with Node.js modules
export const runtime = 'nodejs'

// DELETE - 从购物车中移除指定商品
export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    await removeFromCart(productId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('从购物车移除商品失败:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove from cart' },
      { status: 500 }
    )
  }
}