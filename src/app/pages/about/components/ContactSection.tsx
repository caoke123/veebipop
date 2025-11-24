import React from 'react';
import { COMPANY_INFO } from '@/constants/aboutConstants';
import { Phone, Envelope, MapPin, WhatsappLogo, PaperPlaneTilt } from '@phosphor-icons/react/dist/ssr';
import InlineAboutContactForm from './InlineAboutContactForm'

const ContactSection: React.FC = () => {
  return (
    <section id="contact" className="py-24 bg-surface">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16">
          
          {/* Contact Info */}
          <div>
            <span className="text-green font-bold tracking-wider uppercase text-sm mb-2 block">Get In Touch</span>
            <h2 className="heading2 text-black mb-6">Let's Create Your Next Bestseller</h2>
            <p className="text-secondary text-lg mb-10 body1">
              Ready to start your custom project? Our team is ready to provide quotes, samples, and design consultations within 24 hours.
            </p>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                  <Phone className="w-5 h-5 text-green" />
                </div>
                <div>
                  <h4 className="font-bold text-black mb-1">Phone / WhatsApp / WeChat</h4>
                  <p className="text-secondary">{COMPANY_INFO.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                  <Envelope className="w-5 h-5 text-green" />
                </div>
                <div>
                  <h4 className="font-bold text-black mb-1">Email</h4>
                  <a href={`mailto:${COMPANY_INFO.email}`} className="text-secondary hover:underline">{COMPANY_INFO.email}</a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                  <MapPin className="w-5 h-5 text-green" />
                </div>
                <div>
                  <h4 className="font-bold text-black mb-1">Office Address</h4>
                  <p className="text-secondary max-w-xs">{COMPANY_INFO.address}</p>
                </div>
              </div>
            </div>
            
            {/* Working Hours Badge */}
            <div className="mt-10 p-6 bg-white rounded-xl border-l-4 border-green shadow-sm">
              <h4 className="font-bold text-black mb-1">Working Hours</h4>
              <p className="text-secondary text-sm">Mon-Fri 9:00 - 18:30 (Beijing Time, GMT+8)</p>
            </div>
            
            {/* WhatsApp Quick Contact */}
            <a 
              href={COMPANY_INFO.whatsapp} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-green hover:bg-green/80 text-black font-semibold rounded-lg transition-all"
            >
              <WhatsappLogo className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          </div>
          
          {/* Form */}
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-line">
            <h3 className="heading4 text-black mb-6">Send us a Message</h3>
            <InlineAboutContactForm />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
