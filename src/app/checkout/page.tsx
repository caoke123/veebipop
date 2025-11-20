'use client'

import { Suspense } from 'react'
import CheckoutContent from './CheckoutContent'

// Note: Client components cannot export metadata directly
// The metadata will be inherited from the root layout
// For checkout-specific metadata, consider creating a server component wrapper

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}