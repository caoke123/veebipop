// server component: no client-side hooks in this page
import React from 'react'
import { Metadata } from 'next'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuEleven from '@/components/Header/Menu/MenuEleven'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import AboutHero from './components/AboutHero'
import AboutStory from './components/AboutStory'
import FeaturesGrid from './components/FeaturesGrid'
import Timeline from './components/Timeline'
import TeamSection from './components/TeamSection'
import VideoSection from './components/VideoSection'
import ContactSection from './components/ContactSection'

export const metadata: Metadata = {
  title: 'About Veebipop - Leading Factory-Direct Plush Toys & Fashion Accessories Manufacturer',
  description: 'Learn about Veebipop, a premier factory-direct manufacturer of trendy plush toys, doll clothes, fashion keychains, and car accessories. 10+ years OEM/ODM experience serving global B2B wholesalers.',
  keywords: ['plush toys manufacturer', 'factory direct toys', 'custom plush manufacturer', 'OEM toys China', 'wholesale plush toys'],
}

const AboutUs = () => {
    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with code GET10" />
            <div id="header" className='relative w-full'>
                <MenuEleven />
                <Breadcrumb heading='About Us' subHeading='About Us' />
            </div>
            
            {/* New About Us Content */}
            <AboutHero />
            <AboutStory />
            <FeaturesGrid />
            <Timeline />
            <TeamSection />
            <VideoSection />
            <ContactSection />
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <h1 className="text-4xl font-bold text-center mb-8">About Veebipop</h1>
                    <p className="text-lg text-center max-w-3xl mx-auto">
                        Veebipop is the international trade brand of Tianjin Caoke Information Technology Co., Ltd. We are a specialized original manufacturer (OEM/ODM) of Pop Toys, Plush Keychains, and Car Accessories.

We partner with global brands and retailers to provide reliable, high-quality production, custom design services, and factory-direct pricing. Our commitment is to quality, speed, and building lasting partnerships.
                    </p>
                </div>
            </section>
            
            <Footer />
        </>
    )
}

export default AboutUs