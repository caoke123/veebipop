"use client"

import React from 'react'
import GlobalProvider from './GlobalProvider'
import ModalCart from '@/components/Modal/ModalCart'
import ModalWishlist from '@/components/Modal/ModalWishlist'
import ModalSearch from '@/components/Modal/ModalSearch'
import ModalQuickview from '@/components/Modal/ModalQuickview'
import ModalCompare from '@/components/Modal/ModalCompare'
import CountdownTimeType from '@/type/CountdownType'
import { useEffect } from 'react'
import { initWebVitals } from '@/monitor/webVitals'

const ClientRoot: React.FC<{ children: React.ReactNode; serverTimeLeft: CountdownTimeType }> = ({ children, serverTimeLeft }) => {
  useEffect(() => {
    initWebVitals()
  }, [])
  return (
    <GlobalProvider>
      {children}
      <ModalCart serverTimeLeft={serverTimeLeft} />
      <ModalWishlist />
      <ModalSearch />
      <ModalQuickview />
      <ModalCompare />
    </GlobalProvider>
  )
}

export default ClientRoot