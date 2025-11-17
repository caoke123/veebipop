import React from 'react'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuEleven from '@/components/Header/Menu/MenuEleven'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import FaqsInteractive from '@/components/Faqs/FaqsInteractive'

const Faqs = () => {
  return (
    <>
      <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
      <div id="header" className='relative w-full'>
        <MenuEleven />
        <Breadcrumb heading='FAQs' subHeading='FAQs' />
      </div>
      <div className='faqs-block md:py-20 py-10'>
        <FaqsInteractive />
      </div>
      <Footer />
    </>
  )
}

export default Faqs