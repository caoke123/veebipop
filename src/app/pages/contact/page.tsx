// server component: no client-side hooks in this page
import React from 'react'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuEleven from '@/components/Header/Menu/MenuEleven'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import Footer from '@/components/Footer/Footer'
import { COMPANY_INFO } from '@/constants/aboutConstants';
import { Envelope, Phone, MapPin, PaperPlaneTilt, Clock } from '@phosphor-icons/react/dist/ssr';
import InlineContactForm from './components/InlineContactForm'

export const metadata: Metadata = {
  title: 'Contact VeebiPop - Get Direct Factory Quote for Custom Plush Toys',
  description: 'Direct contact with plush toy factory in China. WhatsApp, email, phone support. Get free samples & quotes for custom plush toys, dolls & accessories.',
}

const ContactUs = () => {
  return (
    <>
      <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
      <div id="header" className='relative w-full'>
        <MenuEleven />
        <Breadcrumb heading='Contact us' subHeading='Contact us' />
      </div>
      
      <div className="bg-surface min-h-screen font-sans text-black selection:bg-green selection:text-black">
        {/* Page Header - AboutHero Style */}
        <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://assets.veebipop.com/images/contact us-optimized.webp"
              alt="Contact Hero Background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent"></div>
          </div>
          
          <div className="relative z-10 container mx-auto px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-bold tracking-widest uppercase text-white mb-6">
                EST. 2015 — CHINA
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
                Let's start a conversation.
              </h1>
              <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-8 max-w-2xl mx-auto">
                Ready to bring your designs to life? Whether you have a question about manufacturing, pricing, or global shipping, our team is ready to answer.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href={COMPANY_INFO.whatsapp}
                  className="px-8 py-4 font-bold rounded-full transition-all duration-300 flex items-center gap-2"
                  style={{ backgroundColor: '#D2EF9A', color: 'black' }}
                >
                  <Phone className="w-5 h-5" />
                  WhatsApp Now
                </Link>
                <Link 
                  href={`mailto:${COMPANY_INFO.email}`}
                  className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2"
                >
                  <Envelope className="w-5 h-5" />
                  Send Email
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-6 py-12 md:py-20">
          <div className="grid lg:grid-cols-12 gap-12">
            
            {/* Left Column: Contact Info */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* Cards */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-line transition-transform hover:-translate-y-1 duration-300">
                 <div className="flex items-start justify-between mb-4">
                   <div className="w-12 h-12 bg-green rounded-2xl flex items-center justify-center rotate-3">
                     <Phone className="w-6 h-6 text-black" />
                   </div>
                   <span className="px-3 py-1 bg-surface rounded-full text-xs font-bold text-secondary">Fastest Response</span>
                 </div>
                 <h3 className="text-xl font-bold mb-2">WhatsApp / WeChat</h3>
                 <p className="text-secondary mb-6 text-sm">Direct line to our sales manager for urgent inquiries.</p>
                 <div className="flex flex-col gap-1">
                   <a href={COMPANY_INFO.whatsapp} className="text-lg font-bold border-b-2 border-green hover:bg-green/20 transition-colors inline-block self-start pb-0.5">
                     {COMPANY_INFO.phone}
                   </a>
                   <span className="text-xs text-secondary2">WeChat ID: {COMPANY_INFO.wechat}</span>
                 </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-line transition-transform hover:-translate-y-1 duration-300">
                 <div className="w-12 h-12 bg-purple/10 rounded-2xl flex items-center justify-center mb-6 -rotate-3">
                   <Envelope className="w-6 h-6 text-purple" />
                 </div>
                 <h3 className="text-xl font-bold mb-2">Email Inquiries</h3>
                 <p className="text-secondary mb-6 text-sm">Send us your design files (AI, PDF) for a quick quote.</p>
                 <a href={`mailto:${COMPANY_INFO.email}`} className="text-lg font-bold border-b-2 border-purple/30 hover:text-purple transition-colors inline-block pb-0.5">
                   {COMPANY_INFO.email}
                 </a>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-line">
                 <div className="flex items-center gap-3 mb-6">
                   <Clock className="w-5 h-5 text-secondary" />
                   <h3 className="font-bold text-lg">Office Hours</h3>
                 </div>
                 <div className="space-y-3 text-secondary">
                   <div className="flex justify-between border-b border-line pb-2">
                     <span>Monday - Friday</span>
                     <span className="font-medium text-black">9:00 - 18:30</span>
                   </div>
                   <div className="flex justify-between border-b border-line pb-2">
                     <span>Saturday</span>
                     <span className="font-medium text-black">10:00 - 16:00</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Sunday</span>
                     <span>Closed</span>
                   </div>
                 </div>
                 <p className="mt-4 text-xs text-secondary2">*Time Zone: GMT+8 (Beijing Time)</p>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="lg:col-span-7">
              <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl shadow-black/5 border border-line relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <h2 className="text-3xl font-bold mb-8 relative z-10">Send us a message</h2>

                <InlineContactForm />
              </div>

              {/* Map / Location Visual */}
              <div className="mt-8 p-6 bg-black rounded-3xl text-white flex items-center justify-between flex-wrap gap-4">
                 <div className="flex items-center gap-4">
                   <div className="p-3 bg-surface1 rounded-full">
                     <MapPin className="w-6 h-6 text-green" />
                   </div>
                   <div>
                     <p className="text-sm text-secondary2">Our Headquarters</p>
                     <p className="font-medium max-w-md">{COMPANY_INFO.address}</p>
                   </div>
                 </div>
                 <button className="px-6 py-2 bg-white text-black rounded-full text-sm font-bold hover:bg-green transition-colors">
                   Open in Maps
                 </button>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default ContactUs
