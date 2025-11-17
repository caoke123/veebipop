"use client"
import React, { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { ModalCartProvider } from '@/context/ModalCartContext'
import { WishlistProvider } from '@/context/WishlistContext'
import { ModalWishlistProvider } from '@/context/ModalWishlistContext'
import { CompareProvider } from '@/context/CompareContext'
import { ModalCompareProvider } from '@/context/ModalCompareContext'
import { ModalSearchProvider } from '@/context/ModalSearchContext'
import { ModalQuickviewProvider } from '@/context/ModalQuickviewContext'

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
})

const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 将客户端特定的代码移到useEffect中，避免在服务端渲染时执行
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@tanstack/query-sync-storage-persister').then(({ createSyncStoragePersister }) => {
        import('@tanstack/react-query-persist-client').then(({ persistQueryClient }) => {
          const persister = createSyncStoragePersister({ storage: window.localStorage })
          persistQueryClient({ queryClient: client, persister, maxAge: 24 * 60 * 60 * 1000 })
        }).catch(() => {})
      }).catch(() => {})
    }
  }, [])

  return (
        <QueryClientProvider client={client}>
        <AuthProvider>
            <CartProvider>
                <ModalCartProvider>
                    <WishlistProvider>
                        <ModalWishlistProvider>
                            <CompareProvider>
                                <ModalCompareProvider>
                                    <ModalSearchProvider>
                                        <ModalQuickviewProvider>
                                            {children}
                                        </ModalQuickviewProvider>
                                    </ModalSearchProvider>
                                </ModalCompareProvider>
                            </CompareProvider>
                        </ModalWishlistProvider>
                    </WishlistProvider>
                </ModalCartProvider>
            </CartProvider>
        </AuthProvider>
        </QueryClientProvider>
    )
}

export default GlobalProvider