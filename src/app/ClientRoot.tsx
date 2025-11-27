"use client"

import React from 'react'
import GlobalProvider from './GlobalProvider'
import ModalCart from '@/components/Modal/ModalCart'
import ModalWishlist from '@/components/Modal/ModalWishlist'
import ModalSearch from '@/components/Modal/ModalSearch'
import ModalQuickview from '@/components/Modal/ModalQuickview'
import ModalCompare from '@/components/Modal/ModalCompare'
import FloatingChatWidget from '@/components/Chat/FloatingChatWidget'
import { CHAT_CHANNELS } from '@/constants/chatChannels'
import CountdownTimeType from '@/type/CountdownType'
import { useEffect } from 'react'

const ClientRoot: React.FC<{ children: React.ReactNode; serverTimeLeft: CountdownTimeType }> = ({ children, serverTimeLeft }) => {
  useEffect(() => {
    // 简化的性能监控初始化
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // 动态导入性能监控模块，避免SSR问题
      import('@/monitor/webVitals').then(({ initPerformanceMonitoring }) => {
        initPerformanceMonitoring()
      }).catch(error => {
        console.warn('Failed to load performance monitoring:', error)
      })
    }
  }, [])
  return (
    <GlobalProvider>
      {children}
      <ModalCart serverTimeLeft={serverTimeLeft} />
      <ModalWishlist />
      <ModalSearch />
      <ModalQuickview />
      <ModalCompare />
      <FloatingChatWidget channels={CHAT_CHANNELS} />
    </GlobalProvider>
  )
}

export default ClientRoot